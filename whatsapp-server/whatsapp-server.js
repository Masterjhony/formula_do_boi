/**
 * WhatsApp Server — Servidor dedicado ao Baileys
 *
 * Roda separado do Next.js para manter a conexão WebSocket ativa.
 * Expõe:
 *   GET  /status  → retorna {status, qr}
 *   POST /send    → recebe {phone, name} e adiciona à fila de envio
 *   GET  /queue   → retorna tamanho da fila
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
let starting = false; // flag para evitar chamadas paralelas de startSocket
let currentStatus = 'disconnected'; // 'disconnected' | 'connecting' | 'qr' | 'connected'
let currentQr = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY_MS = 60_000; // máximo de 60s entre tentativas

function getReconnectDelay(statusCode) {
  // Backoff exponencial com limite: 5s, 10s, 20s, 40s, 60s, 60s, ...
  const base = statusCode === 408 ? 3000 : 5000;
  const delay = Math.min(base * Math.pow(1.5, reconnectAttempts), MAX_RECONNECT_DELAY_MS);
  reconnectAttempts = Math.min(reconnectAttempts + 1, 10);
  return Math.floor(delay);
}

function scheduleReconnect(delayMs) {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    startSocket();
  }, delayMs);
}

// =============================================================================
// Fila de envio — serializa mensagens com delay para evitar MessageCounterError
// =============================================================================
const msgQueue = [];
let queueRunning = false;
const QUEUE_DELAY_MS = 4000;

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
  // Evita chamadas paralelas: se já há um socket ativo ou estamos iniciando, sai
  if (sock || starting) return;
  starting = true;

  currentStatus = 'connecting';
  currentQr = null;
  console.log('[WhatsApp Server] Iniciando conexão Baileys...');

  try {
    // Busca versão do WA apenas uma vez; em falha, usa fallback fixo
    if (!cachedWAVersion) {
      try {
        const fetched = await fetchLatestBaileysVersion();
        cachedWAVersion = fetched.version;
        console.log(`[WhatsApp Server] Versão WA obtida: ${cachedWAVersion.join('.')}`);
      } catch (vErr) {
        cachedWAVersion = [2, 3000, 1023270955]; // versão estável conhecida como fallback
        console.warn('[WhatsApp Server] Falha ao buscar versão WA, usando fallback:', cachedWAVersion.join('.'));
      }
    }

    const { state, saveCreds } = await useSupabaseAuthState();

    const pino = (await import('pino')).default;

    const newSock = makeWASocket({
      version: cachedWAVersion,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: state,
      keepAliveIntervalMs: 25_000,
      connectTimeoutMs: 60_000,
      retryRequestDelayMs: 2000,
      getMessage: async () => undefined,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false,
      fireInitQueries: false,
      shouldSyncHistoryMessage: () => false,
    });

    sock = newSock;
    starting = false; // socket criado com sucesso

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
        // 440 = conflict:replaced — outro cliente deslocou nossa sessão WebSocket.
        // As credenciais ainda são válidas. NÃO limpar a sessão, apenas reconectar
        // com backoff. Limpar a sessão causaria loop infinito: reconecta → 440 → limpa → reconecta.
        const replaced = statusCode === 440;

        sock = null;
        currentQr = null;

        if (loggedOut) {
          console.log('[WhatsApp Server] Deslogado do WhatsApp. Limpando sessão para novo QR...');
          currentStatus = 'qr';
          reconnectAttempts = 0;
          supabase.from('whatsapp_auth').delete().neq('id', '').then(() => {
            console.log('[WhatsApp Server] Sessão limpa. Aguardando novo QR...');
            scheduleReconnect(3000);
          }).catch((err) => {
            console.error('[WhatsApp Server] Erro ao limpar sessão:', err.message);
            scheduleReconnect(5000);
          });
        } else if (replaced) {
          // 440: reconectar sem limpar — credenciais ainda válidas
          currentStatus = 'connecting';
          const delay = Math.min(3000 * Math.pow(1.5, reconnectAttempts), 30_000);
          reconnectAttempts = Math.min(reconnectAttempts + 1, 8);
          console.log(`[WhatsApp Server] Sessão substituída (440). Reconectando com mesmas credenciais em ${(delay/1000).toFixed(1)}s...`);
          scheduleReconnect(Math.floor(delay));
        } else {
          currentStatus = 'connecting';
          const delay = getReconnectDelay(statusCode);
          console.log(`[WhatsApp Server] Conexão fechada (código ${statusCode}). Reconectando em ${delay / 1000}s... (tentativa ${reconnectAttempts})`);
          scheduleReconnect(delay);
        }
      } else if (connection === 'open') {
        currentStatus = 'connected';
        currentQr = null;
        reconnectAttempts = 0; // reset backoff ao conectar com sucesso
        console.log('[WhatsApp Server] ✅ Conectado ao WhatsApp com sucesso!');
      }
    });
  } catch (error) {
    console.error('[WhatsApp Server] Erro ao iniciar socket:', error);
    sock = null;
    starting = false;
    currentStatus = 'disconnected';
    const delay = getReconnectDelay(null);
    console.log(`[WhatsApp Server] Tentando novamente em ${delay / 1000}s...`);
    scheduleReconnect(delay);
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
// Servidor HTTP
// =============================================================================
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  res.setHeader('Content-Type', 'application/json');

  // GET /status
  if (req.method === 'GET' && url.pathname === '/status') {
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
        const result = enqueueSend(phone, name);
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

  const baileys = await import('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  DisconnectReason = baileys.DisconnectReason;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
  initAuthCreds = baileys.initAuthCreds;
  BufferJSON = baileys.BufferJSON;

  await startSocket();

  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`[WhatsApp Server] 🚀 Servidor HTTP rodando na porta ${PORT}`);
    console.log(`[WhatsApp Server]    GET  http://localhost:${PORT}/status`);
    console.log(`[WhatsApp Server]    POST http://localhost:${PORT}/send`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('[WhatsApp Server] Encerrando servidor...');
    if (sock) {
      try { sock.end(); } catch (_) {}
      sock = null;
    }
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch(err => {
  console.error('[WhatsApp Server] Erro fatal:', err);
  process.exit(1);
});
