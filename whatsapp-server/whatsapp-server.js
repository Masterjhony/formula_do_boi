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

let makeWASocket, DisconnectReason, fetchLatestBaileysVersion, initAuthCreds, BufferJSON;

let cachedWAVersion = null;

const PORT = process.env.WHATSAPP_SERVER_PORT || 3001;

// =============================================================================
// Supabase
// =============================================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[WA] ERRO: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.');
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
// Estado global — UM único socket, gerenciado de forma estrita
// =============================================================================
let sock = null;
let socketGeneration = 0;      // incrementa a cada startSocket para invalidar handlers antigos
let currentStatus = 'disconnected';
let currentQr = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;

// Fecha o socket antigo de verdade — mata o WebSocket, remove listeners
function destroySocket(oldSock) {
  if (!oldSock) return;
  try { oldSock.ev.removeAllListeners(); } catch (_) {}
  try { oldSock.ws?.close(); } catch (_) {}
  try { oldSock.end(); } catch (_) {}
}

function scheduleReconnect(delayMs) {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  console.log(`[WA] Reconectando em ${(delayMs / 1000).toFixed(1)}s...`);
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    startSocket();
  }, delayMs);
}

// =============================================================================
// Fila de envio
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
    throw new Error('Fila de envio cheia (max 200). Tente novamente em alguns minutos.');
  }
  msgQueue.push({ phone, name });
  const position = msgQueue.length;
  const estimatedSeconds = (position - 1) * (QUEUE_DELAY_MS / 1000);
  runMsgQueue();
  return { queued: true, position, estimatedSeconds };
}

// =============================================================================
// Inicializar/Reconectar o Baileys
// =============================================================================
async function startSocket() {
  // Se já tem socket ativo, destruir primeiro para não ter dois WebSockets
  if (sock) {
    console.log('[WA] Destruindo socket anterior antes de reconectar...');
    const old = sock;
    sock = null;
    destroySocket(old);
  }

  // Cancela qualquer reconexão pendente
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  // Gera uma "geração" para este socket — se o handler que dispara pertence
  // a uma geração anterior, ignora (evita fantasmas).
  const myGen = ++socketGeneration;

  currentStatus = 'connecting';
  currentQr = null;
  console.log(`[WA] Iniciando conexao (gen=${myGen})...`);

  try {
    if (!cachedWAVersion) {
      try {
        const fetched = await fetchLatestBaileysVersion();
        cachedWAVersion = fetched.version;
        console.log(`[WA] Versao WA: ${cachedWAVersion.join('.')}`);
      } catch (_) {
        cachedWAVersion = [2, 3000, 1023270955];
        console.warn(`[WA] Falha ao buscar versao, usando fallback`);
      }
    }

    const { state, saveCreds } = await useSupabaseAuthState();

    // Se outra chamada a startSocket já tomou nosso lugar, abortar
    if (myGen !== socketGeneration) {
      console.log(`[WA] gen=${myGen} abortada, gen=${socketGeneration} em andamento`);
      return;
    }

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
      shouldSyncHistoryMessage: () => false,
    });

    // Verifica de novo — entre o await acima e aqui, outra gen pode ter tomado lugar
    if (myGen !== socketGeneration) {
      console.log(`[WA] gen=${myGen} abortada apos makeWASocket`);
      destroySocket(newSock);
      return;
    }

    sock = newSock;

    sock.ev.on('creds.update', () => {
      if (myGen !== socketGeneration) return; // handler fantasma, ignorar
      saveCreds();
    });

    sock.ev.on('connection.update', (update) => {
      // Se este handler pertence a uma geração antiga, ignorar completamente
      if (myGen !== socketGeneration) return;

      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQr = qr;
        currentStatus = 'qr';
        console.log('[WA] QR Code gerado — escaneie com o WhatsApp.');
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;

        console.log(`[WA] Conexao fechada (code=${statusCode}, loggedOut=${loggedOut}, gen=${myGen})`);

        // IMPORTANTE: destruir o socket ANTES de reconectar
        const old = sock;
        sock = null;
        currentQr = null;
        destroySocket(old);

        if (loggedOut) {
          currentStatus = 'disconnected';
          reconnectAttempts = 0;
          console.log('[WA] Logout detectado. Limpando sessao para novo QR...');
          supabase.from('whatsapp_auth').delete().neq('id', 'null').then(() => {
            console.log('[WA] Sessao limpa. Reconectando para gerar QR...');
            scheduleReconnect(3000);
          }).catch(() => {
            scheduleReconnect(5000);
          });
        } else {
          // Para QUALQUER outro código (incluindo 440), reconectar com backoff
          currentStatus = 'connecting';
          const base = 5000;
          const delay = Math.min(base * Math.pow(2, reconnectAttempts), 60_000);
          reconnectAttempts = Math.min(reconnectAttempts + 1, 8);
          scheduleReconnect(Math.floor(delay));
        }
      } else if (connection === 'open') {
        currentStatus = 'connected';
        currentQr = null;
        reconnectAttempts = 0;
        console.log(`[WA] Conectado com sucesso (gen=${myGen})`);
      }
    });
  } catch (error) {
    console.error('[WA] Erro ao iniciar socket:', error.message);
    if (sock) { destroySocket(sock); sock = null; }
    currentStatus = 'disconnected';
    const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), 60_000);
    reconnectAttempts = Math.min(reconnectAttempts + 1, 8);
    scheduleReconnect(Math.floor(delay));
  }
}

// =============================================================================
// Formatar numero brasileiro
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
// Envio direto (interno)
// =============================================================================
async function _executeSend(phone, name) {
  if (currentStatus !== 'connected' || !sock) {
    throw new Error(`WhatsApp nao conectado. Status: ${currentStatus}`);
  }

  const formattedPhone = formatBRNumber(phone);
  if (!formattedPhone) {
    throw new Error(`Numero invalido: ${phone}`);
  }

  const messageText = `Olá ${name}! Seja bem vindo(a)! 🎉\n\nGostaríamos de te apresentar a *Fórmula do Boi*!\n\nAcesse nosso Marketplace e confira nossas ofertas exclusivas clicando no link abaixo:\n👉 https://app.formuladoboi.com`;

  const result = await sock.onWhatsApp(formattedPhone);
  if (!result || result.length === 0 || !result[0].exists) {
    console.log(`[Queue] ${formattedPhone} nao esta no WhatsApp.`);
    return { sent: false, reason: 'not_on_whatsapp' };
  }

  const jid = result[0].jid || formattedPhone;
  const msgResult = await sock.sendMessage(jid, { text: messageText });
  console.log(`[Queue] Enviado para ${jid} (${name}) — id: ${msgResult?.key?.id}`);
  return { sent: true };
}

// =============================================================================
// Servidor HTTP
// =============================================================================
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  res.setHeader('Content-Type', 'application/json');

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

  if (req.method === 'POST' && url.pathname === '/send') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { phone, name } = JSON.parse(body);
        if (!phone || !name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'phone e name sao obrigatorios' }));
          return;
        }
        const result = enqueueSend(phone, name);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, sent: true, ...result }));
      } catch (error) {
        console.error('[WA] Erro ao enfileirar:', error.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/queue') {
    res.writeHead(200);
    res.end(JSON.stringify({
      queueSize: msgQueue.length,
      processing: queueRunning,
      delayBetweenSendsMs: QUEUE_DELAY_MS,
    }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

// =============================================================================
// Bootstrap
// =============================================================================
async function main() {
  console.log('[WA] Carregando Baileys...');

  const baileys = await import('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  DisconnectReason = baileys.DisconnectReason;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
  initAuthCreds = baileys.initAuthCreds;
  BufferJSON = baileys.BufferJSON;

  await startSocket();

  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`[WA] Servidor HTTP na porta ${PORT}`);
  });

  const shutdown = () => {
    console.log('[WA] Encerrando...');
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (sock) { destroySocket(sock); sock = null; }
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch(err => {
  console.error('[WA] Erro fatal:', err);
  process.exit(1);
});
