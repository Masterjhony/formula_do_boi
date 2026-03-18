/**
 * WhatsApp Server — Servidor dedicado ao Baileys
 * 
 * Roda separado do Next.js para manter a conexão WebSocket ativa.
 * Expõe:
 *   GET  /status  → retorna {status, qr}
 *   POST /send    → recebe {phone, name} e envia mensagem de boas-vindas
 * 
 * Uso:
 *   node whatsapp-server.js
 * 
 * Via Docker:
 *   docker compose up -d whatsapp-server
 */

const http = require('http');
const { createClient } = require('@supabase/supabase-js');

// Tentamos importar Baileys. Suporte a ESM via dynamic import.
let makeWASocket, DisconnectReason, useMultiFileAuthState,
    fetchLatestBaileysVersion, initAuthCreds, BufferJSON;

// Cache da versão do WA para não buscar a cada reconexão
let cachedWAVersion = null;

const PORT = process.env.WHATSAPP_SERVER_PORT || 3001;

// =============================================================================
// Supabase
// =============================================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[WhatsApp Server] ERRO: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =============================================================================
// Auth State no Supabase (persistência de sessão)
// =============================================================================
async function useSupabaseAuthState() {
  const readData = async (type, id) => {
    const key = `${type}-${id}`;
    const { data } = await supabase
      .from('whatsapp_auth')
      .select('data')
      .eq('id', key)
      .single();
    if (data && data.data) {
      return JSON.parse(JSON.stringify(data.data), BufferJSON.reviver);
    }
    return null;
  };

  const writeData = async (data, type, id) => {
    const key = `${type}-${id}`;
    await supabase.from('whatsapp_auth').upsert({
      id: key,
      data: JSON.parse(JSON.stringify(data, BufferJSON.replacer)),
    });
  };

  const removeData = async (type, id) => {
    const key = `${type}-${id}`;
    await supabase.from('whatsapp_auth').delete().eq('id', key);
  };

  let creds = await readData('creds', 'base');
  if (!creds) {
    creds = initAuthCreds();
    await writeData(creds, 'creds', 'base');
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(type, id);
              if (type === 'app-state-sync-key' && value) {
                value = typeof value === 'string'
                  ? Buffer.from(value, 'base64')
                  : Buffer.from(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              if (value) {
                tasks.push(writeData(value, category, id));
              } else {
                tasks.push(removeData(category, id));
              }
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeData(creds, 'creds', 'base'),
  };
}

// =============================================================================
// Estado global do socket
// =============================================================================
let sock = null;
let currentStatus = 'disconnected'; // 'disconnected' | 'connecting' | 'qr' | 'connected'
let currentQr = null;
let reconnectTimeout = null;

// =============================================================================
// Fila de envio — serializa mensagens com delay para evitar MessageCounterError
// e risco de ban por envios em massa
// =============================================================================
const msgQueue = [];
let queueRunning = false;
const QUEUE_DELAY_MS = 4000; // 4 segundos entre cada envio

async function runMsgQueue() {
  if (queueRunning) return;
  queueRunning = true;
  while (msgQueue.length > 0) {
    const { phone, name } = msgQueue.shift();
    try {
      await _executeSend(phone, name);
    } catch (err) {
      console.error(`[Queue] Falha ao enviar para ${phone}:`, err.message);
    }
    if (msgQueue.length > 0) {
      await new Promise(r => setTimeout(r, QUEUE_DELAY_MS));
    }
  }
  queueRunning = false;
}

function enqueueSend(phone, name) {
  if (msgQueue.length >= 200) {
    throw new Error('Fila de envio cheia (máx 200). Tente novamente em alguns minutos.');
  }
  msgQueue.push({ phone, name });
  const position = msgQueue.length;
  const estimatedSeconds = (position - 1) * (QUEUE_DELAY_MS / 1000);
  runMsgQueue(); // dispara sem await — processa em background
  return { queued: true, position, estimatedSeconds };
}

// =============================================================================
// Inicializar/Reconectar o Baileys
// =============================================================================
async function startSocket() {
  if (sock) return; // já iniciado

  currentStatus = 'connecting';
  currentQr = null;
  console.log('[WhatsApp Server] Iniciando conexão Baileys...');

  try {
    if (!cachedWAVersion) {
      const fetched = await fetchLatestBaileysVersion();
      cachedWAVersion = fetched.version;
      console.log(`[WhatsApp Server] Versão WA obtida: ${cachedWAVersion.join('.')}`);
    }

    const { state, saveCreds } = await useSupabaseAuthState();

    const pino = (await import('pino')).default;

    sock = makeWASocket({
      version: cachedWAVersion,
      logger: pino({ level: 'silent' }), // suprime todos os logs de erros internos do Baileys
      printQRInTerminal: false,
      auth: state,
      keepAliveIntervalMs: 30_000,
      getMessage: async () => undefined, // não tentar reenviar mensagens ausentes
      syncFullHistory: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false,
      fireInitQueries: false,            // não buscar histórico/grupos ao conectar
      shouldSyncHistoryMessage: () => false, // ignorar sync de histórico de grupos
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQr = qr;
        currentStatus = 'qr';
        console.log('[WhatsApp Server] QR Code gerado — escaneie com o WhatsApp.');
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;

        sock = null;
        currentQr = null;

        // 440 = conflict:replaced (outra sessão tomou o lugar) → limpar e gerar novo QR
        const replaced = statusCode === 440;

        if (loggedOut || replaced) {
          const reason = loggedOut ? 'Deslogado' : 'Sessão substituída (conflict:replaced)';
          console.log(`[WhatsApp Server] ${reason}. Limpando sessão para novo QR...`);
          currentStatus = 'qr';
          supabase.from('whatsapp_auth').delete().neq('id', '').then(() => {
            console.log('[WhatsApp Server] Sessão limpa. Aguardando novo QR...');
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(startSocket, 3000);
          });
        } else {
          // Mantém status 'connecting' para a UI não oscilar durante reconexão automática
          currentStatus = 'connecting';
          const delay = statusCode === 408 ? 3000 : 5000;
          console.log(`[WhatsApp Server] Conexão fechada (código ${statusCode}). Reconectando em ${delay / 1000}s...`);
          if (reconnectTimeout) clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(startSocket, delay);
        }
      } else if (connection === 'open') {
        currentStatus = 'connected';
        currentQr = null;
        console.log('[WhatsApp Server] ✅ Conectado ao WhatsApp com sucesso!');
      }
    });
  } catch (error) {
    console.error('[WhatsApp Server] Erro ao iniciar socket:', error);
    sock = null;
    currentStatus = 'disconnected';
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(startSocket, 10000);
  }
}

// =============================================================================
// Formatar número brasileiro
// =============================================================================
function formatBRNumber(phone) {
  let cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.startsWith('55')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.length < 10 || cleaned.length > 11) return null;
  return `55${cleaned}@s.whatsapp.net`;
}

// =============================================================================
// Envio direto (interno — chamado pela fila, nunca diretamente pelo HTTP)
// =============================================================================
async function _executeSend(phone, name) {
  if (currentStatus !== 'connected' || !sock) {
    throw new Error(`WhatsApp não está conectado. Status atual: ${currentStatus}`);
  }

  const formattedPhone = formatBRNumber(phone);
  if (!formattedPhone) {
    throw new Error(`Número inválido: ${phone}`);
  }

  const messageText = `Olá ${name}! Seja bem vindo(a)! 🎉\n\nGostaríamos de te apresentar a *Fórmula do Boi*!\n\nAcesse nosso Marketplace e confira nossas ofertas exclusivas clicando no link abaixo:\n👉 https://app.formuladoboi.com`;

  const result = await sock.onWhatsApp(formattedPhone);
  console.log(`[Queue] onWhatsApp(${formattedPhone}):`, JSON.stringify(result));
  if (!result || result.length === 0 || !result[0].exists) {
    console.log(`[Queue] ${formattedPhone} não está no WhatsApp.`);
    return { sent: false, reason: 'not_on_whatsapp' };
  }

  const jid = result[0].jid || formattedPhone;
  const msgResult = await sock.sendMessage(jid, { text: messageText });
  console.log(`[Queue] ✉️ Enviado para ${jid} (${name}) — id: ${msgResult?.key?.id}`);
  return { sent: true };
}

// =============================================================================
// Enviar mensagem de boas-vindas — entrada pública via fila
// =============================================================================
function sendWelcomeMessage(phone, name) {
  return enqueueSend(phone, name);
}

// =============================================================================
// Servidor HTTP
// =============================================================================
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  res.setHeader('Content-Type', 'application/json');

  // GET /status
  if (req.method === 'GET' && url.pathname === '/status') {
    // Gerar QR code em data URL se necessário
    let qrDataUrl = null;
    if (currentQr) {
      try {
        const QRCode = require('qrcode');
        qrDataUrl = await QRCode.toDataURL(currentQr);
      } catch {
        qrDataUrl = currentQr;
      }
    }
    res.writeHead(200);
    res.end(JSON.stringify({ status: currentStatus, qr: qrDataUrl }));
    return;
  }

  // POST /send — adiciona à fila e retorna imediatamente
  if (req.method === 'POST' && url.pathname === '/send') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { phone, name } = JSON.parse(body);
        if (!phone || !name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'phone e name são obrigatórios' }));
          return;
        }
        const result = sendWelcomeMessage(phone, name); // síncrono — só enfileira
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, sent: true, ...result }));
      } catch (error) {
        console.error('[WhatsApp Server] Erro ao enfileirar:', error.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // GET /queue — tamanho atual da fila
  if (req.method === 'GET' && url.pathname === '/queue') {
    res.writeHead(200);
    res.end(JSON.stringify({
      queueSize: msgQueue.length,
      processing: queueRunning,
      delayBetweenSendsMs: QUEUE_DELAY_MS,
    }));
    return;
  }

  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

// =============================================================================
// Bootstrap: importar Baileys (ESM) e iniciar tudo
// =============================================================================
async function main() {
  console.log('[WhatsApp Server] Carregando Baileys...');

  // Baileys é ESM, então usamos dynamic import
  const baileys = await import('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  DisconnectReason = baileys.DisconnectReason;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
  initAuthCreds = baileys.initAuthCreds;
  BufferJSON = baileys.BufferJSON;

  // Inicia o socket do WhatsApp
  await startSocket();

  // Inicia o servidor HTTP
  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`[WhatsApp Server] 🚀 Servidor HTTP rodando na porta ${PORT}`);
    console.log(`[WhatsApp Server]    GET  http://localhost:${PORT}/status`);
    console.log(`[WhatsApp Server]    POST http://localhost:${PORT}/send`);
  });
}

main().catch(err => {
  console.error('[WhatsApp Server] Erro fatal:', err);
  process.exit(1);
});
