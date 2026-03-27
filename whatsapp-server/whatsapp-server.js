/**
 * WhatsApp Server — Servidor dedicado ao Baileys
 *
 * Roda separado do Next.js para manter a conexão WebSocket ativa.
 * Auth state em arquivos locais (useMultiFileAuthState) persistidos via
 * Docker volume em /data/auth — zero latência, zero corrupção.
 *
 * Expõe:
 *   GET  /status         → retorna {status, qr}
 *   POST /send           → recebe {phone, name} e adiciona à fila de envio
 *   GET  /queue          → retorna tamanho da fila
 *   GET  /config         → retorna a configuração de fluxo atual
 *   POST /reload-config  → força recarga da config do Supabase
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

let makeWASocket, DisconnectReason, useMultiFileAuthState,
    fetchLatestBaileysVersion;

let cachedWAVersion = null;

const PORT = process.env.WHATSAPP_SERVER_PORT || 3001;
const AUTH_DIR = process.env.AUTH_DIR || '/data/auth';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const NEXT_JS_URL = process.env.NEXT_JS_URL || '';
const GROUP_TASK_SECRET = process.env.WHATSAPP_GROUP_TASK_SECRET || '';
const GROUP_TASK_PREFIX = '/tarefa';

// Garante que o diretório de auth existe
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

// =============================================================================
// Flow config — carregada do Supabase, com fallback para padrão
// =============================================================================
let flowConfig = {
  welcome_message: `Olá {nome}! Seja bem vindo(a)! 🎉\n\nGostaríamos de te apresentar a *Fórmula do Boi*!\n\nAcesse nosso Marketplace e confira nossas ofertas exclusivas:\n👉 https://app.formuladoboi.com`,
  options: [],
  flow_timeout_minutes: 60,
};

async function loadFlowConfig() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('[Config] Supabase URL/KEY não configurados. Usando config padrão.');
    return;
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_settings?key=eq.whatsapp_flow&select=value`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const data = await res.json();
    if (data?.[0]?.value) {
      flowConfig = data[0].value;
      console.log('[Config] Fluxo carregado do Supabase.');
    }
  } catch (e) {
    console.error('[Config] Erro ao carregar fluxo:', e.message);
  }
}

// Recarrega a cada 5 minutos como fallback
setInterval(loadFlowConfig, 5 * 60 * 1000);

// =============================================================================
// Estado de conversa — aguardando resposta do lead
// Map<phone_number_only, { expires_at: Date }>
// =============================================================================
const pendingReplies = new Map();

function trackPendingReply(phone) {
  const timeoutMins = Number(flowConfig.flow_timeout_minutes) || 60;
  if (!Array.isArray(flowConfig.options) || flowConfig.options.length === 0) return;
  if (timeoutMins <= 0) return;
  pendingReplies.set(phone, {
    expires_at: new Date(Date.now() + timeoutMins * 60 * 1000),
  });
}

// Limpa entradas expiradas a cada 10 minutos
setInterval(() => {
  const now = new Date();
  for (const [phone, state] of pendingReplies) {
    if (state.expires_at < now) pendingReplies.delete(phone);
  }
}, 10 * 60 * 1000);

// =============================================================================
// Estado de criação de tarefas via grupo — fluxo multi-step
// Map<`${senderJid}::${groupJid}`, PendingTaskState>
// =============================================================================
const pendingGroupTasks = new Map();
const GROUP_TASK_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos

setInterval(() => {
  const now = Date.now();
  for (const [key, state] of pendingGroupTasks) {
    if (state.expires_at < now) pendingGroupTasks.delete(key);
  }
}, 5 * 60 * 1000);

const ETAPA_MAP = { '1': 'Idéias', '2': 'A fazer', '3': 'Em andamento' };

function parseDueDate(text) {
  const lower = text.toLowerCase().trim();
  if (['sem prazo', 'nao', 'não', 'nenhum', 'pular', 'n', '-', 'sem'].includes(lower)) return null;
  const match = text.trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!match) return null;
  const day = parseInt(match[1]);
  const month = parseInt(match[2]) - 1;
  const yearRaw = match[3] ? parseInt(match[3]) : new Date().getFullYear();
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  const date = new Date(year, month, day, 12, 0, 0);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

function formatDateBR(isoDate) {
  const d = new Date(isoDate);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

async function sendGroupMsg(jid, text) {
  try {
    if (currentStatus === 'connected' && sock) {
      await sock.sendMessage(jid, { text });
    }
  } catch (e) {
    console.error('[Grupo] Erro ao enviar mensagem:', e.message);
  }
}

async function createGroupTask(groupJid, state, dueDate) {
  const { title, group_id, sender, sender_name, status, assignee } = state;

  if (!NEXT_JS_URL || !GROUP_TASK_SECRET) {
    console.warn('[Grupo] NEXT_JS_URL ou WHATSAPP_GROUP_TASK_SECRET não configurados.');
    return;
  }

  console.log(`[Grupo] Criando tarefa "${title}" (${status}) por ${sender_name}`);

  try {
    const body = { group_id, sender, sender_name, title, status };
    if (assignee) body.assignee_name = assignee;
    if (dueDate) body.due_date = dueDate;

    const res = await fetch(`${NEXT_JS_URL}/api/whatsapp/group-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': GROUP_TASK_SECRET,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const json = await res.json();
      console.log(`[Grupo] Tarefa criada: ${json.task_id}`);
      const assigneeText = assignee ? `\n👤 Responsável: *${assignee}*` : '';
      const dueDateText = dueDate ? `\n📅 Prazo: *${formatDateBR(dueDate)}*` : '';
      await sendGroupMsg(groupJid,
        `✅ Tarefa criada por *${sender_name}*:\n"${title}"\n📌 Etapa: *${status}*${assigneeText}${dueDateText}`
      );
    } else {
      const err = await res.text();
      console.error(`[Grupo] Erro ao criar tarefa (${res.status}): ${err}`);
      await sendGroupMsg(groupJid, `❌ Não foi possível criar a tarefa. Tente novamente.`);
    }
  } catch (e) {
    console.error('[Grupo] Falha ao chamar API:', e.message);
    await sendGroupMsg(groupJid, `❌ Não foi possível criar a tarefa. Tente novamente.`);
  }
}

// =============================================================================
// Estado global — UM único socket, gerenciado de forma estrita
// =============================================================================
let sock = null;
let socketGeneration = 0;
let currentStatus = 'disconnected';
let currentQr = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;

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
    throw new Error('Fila de envio cheia (max 200).');
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
  if (sock) {
    console.log('[WA] Destruindo socket anterior...');
    const old = sock;
    sock = null;
    destroySocket(old);
  }

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

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
        console.warn('[WA] Usando versao WA fallback');
      }
    }

    // Auth state em arquivos locais — leitura/escrita em microssegundos
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    if (myGen !== socketGeneration) {
      console.log(`[WA] gen=${myGen} abortada`);
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

    if (myGen !== socketGeneration) {
      destroySocket(newSock);
      return;
    }

    sock = newSock;

    sock.ev.on('creds.update', () => {
      if (myGen !== socketGeneration) return;
      saveCreds();
    });

    sock.ev.on('connection.update', (update) => {
      if (myGen !== socketGeneration) return;

      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQr = qr;
        currentStatus = 'qr';
        console.log('[WA] QR Code gerado.');
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;

        console.log(`[WA] Conexao fechada (code=${statusCode}, gen=${myGen})`);

        const old = sock;
        sock = null;
        currentQr = null;
        destroySocket(old);

        if (loggedOut) {
          currentStatus = 'disconnected';
          reconnectAttempts = 0;
          console.log('[WA] Logout. Limpando auth para novo QR...');
          try {
            const files = fs.readdirSync(AUTH_DIR);
            for (const f of files) {
              fs.unlinkSync(path.join(AUTH_DIR, f));
            }
            console.log('[WA] Auth limpo.');
          } catch (e) {
            console.error('[WA] Erro ao limpar auth:', e.message);
          }
          scheduleReconnect(3000);
        } else {
          currentStatus = 'connecting';
          const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), 60_000);
          reconnectAttempts = Math.min(reconnectAttempts + 1, 8);
          scheduleReconnect(Math.floor(delay));
        }
      } else if (connection === 'open') {
        currentStatus = 'connected';
        currentQr = null;
        reconnectAttempts = 0;
        console.log(`[WA] Conectado (gen=${myGen})`);
      }
    });

    // -----------------------------------------------------------------
    // Ouvir mensagens recebidas — fluxo individual + comando de grupos
    // -----------------------------------------------------------------
    sock.ev.on('messages.upsert', async ({ messages: msgs, type }) => {
      if (myGen !== socketGeneration) return;
      if (type !== 'notify') return;

      for (const msg of msgs) {
        // Ignorar mensagens próprias
        if (msg.key.fromMe) continue;

        const remoteJid = msg.key.remoteJid;
        if (!remoteJid) continue;
        if (remoteJid === 'status@broadcast') continue;

        // Extrair texto da mensagem
        const text = (
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          ''
        ).trim();

        if (!text) continue;

        // -----------------------------------------------------------------
        // Mensagens de GRUPO — fluxo multi-step de criação de tarefas
        // -----------------------------------------------------------------
        if (remoteJid.endsWith('@g.us')) {
          const lower = text.toLowerCase();
          const senderJid = msg.key.participant || '';
          const sender = senderJid.replace('@s.whatsapp.net', '');
          const senderName = msg.pushName || sender;
          const taskKey = `${senderJid}::${remoteJid}`;

          // /tarefa sempre inicia novo fluxo (cancela pendente anterior se houver)
          if (lower.startsWith(GROUP_TASK_PREFIX)) {
            const title = text.slice(GROUP_TASK_PREFIX.length).trim();
            if (!title) {
              await sendGroupMsg(remoteJid, '⚠️ Use: /tarefa <descrição da tarefa>');
              continue;
            }

            console.log(`[Grupo] /tarefa de ${senderName} (${sender}) no grupo ${remoteJid}: "${title}"`);

            if (!NEXT_JS_URL || !GROUP_TASK_SECRET) {
              console.warn('[Grupo] NEXT_JS_URL ou WHATSAPP_GROUP_TASK_SECRET não configurados — tarefa ignorada.');
              continue;
            }

            pendingGroupTasks.set(taskKey, {
              step: 'etapa',
              title,
              group_id: remoteJid,
              sender,
              sender_name: senderName,
              expires_at: Date.now() + GROUP_TASK_TIMEOUT_MS,
            });

            await sendGroupMsg(remoteJid,
              `📋 *Tarefa:* "${title}"\n\nEm qual etapa ficará?\n1️⃣ Idéias\n2️⃣ A fazer\n3️⃣ Em andamento`
            );
            continue;
          }

          // Continuar fluxo pendente para este remetente neste grupo
          const pending = pendingGroupTasks.get(taskKey);
          if (!pending) continue;

          if (pending.expires_at < Date.now()) {
            pendingGroupTasks.delete(taskKey);
            continue;
          }

          // Renovar timeout a cada interação
          pending.expires_at = Date.now() + GROUP_TASK_TIMEOUT_MS;

          if (pending.step === 'etapa') {
            const etapa = ETAPA_MAP[text.trim()];
            if (!etapa) {
              await sendGroupMsg(remoteJid, '⚠️ Responda com *1*, *2* ou *3*.');
              continue;
            }
            pending.step = 'responsavel';
            pending.status = etapa;
            await sendGroupMsg(remoteJid,
              `👤 Quem é o responsável?\n(Digite o nome ou responda *pular*)`
            );
            continue;
          }

          if (pending.step === 'responsavel') {
            const skipWords = ['pular', 'nao', 'não', 'nenhum', '-', 'sem'];
            pending.assignee = skipWords.includes(lower.trim()) ? null : text.trim();
            pending.step = 'prazo';
            await sendGroupMsg(remoteJid,
              `📅 Qual o prazo?\n(Ex: *25/04* ou *sem prazo*)`
            );
            continue;
          }

          if (pending.step === 'prazo') {
            const dueDate = parseDueDate(text);
            if (text.trim() && !['sem prazo', 'nao', 'não', 'nenhum', 'pular', 'n', '-', 'sem'].includes(lower.trim()) && !dueDate) {
              await sendGroupMsg(remoteJid,
                '⚠️ Formato inválido. Use *dd/mm* (ex: 25/04) ou *sem prazo*.'
              );
              continue;
            }
            pendingGroupTasks.delete(taskKey);
            await createGroupTask(remoteJid, pending, dueDate);
            continue;
          }

          continue;
        }

        // -----------------------------------------------------------------
        // Mensagens INDIVIDUAIS — fluxo de resposta de leads
        // -----------------------------------------------------------------
        const phone = remoteJid.replace('@s.whatsapp.net', '');

        // Verificar se este contato está aguardando resposta
        const pending = pendingReplies.get(phone);
        if (!pending) continue;
        if (pending.expires_at < new Date()) {
          pendingReplies.delete(phone);
          continue;
        }

        // Encontrar opção correspondente
        const options = Array.isArray(flowConfig.options) ? flowConfig.options : [];
        const option = options.find(o => String(o.key).trim() === text);

        if (option?.response) {
          try {
            if (currentStatus === 'connected' && sock) {
              await sock.sendMessage(remoteJid, { text: option.response });
              console.log(`[Fluxo] Resposta enviada para ${phone} (opção ${option.key})`);
            }
          } catch (e) {
            console.error(`[Fluxo] Erro ao enviar resposta para ${phone}:`, e.message);
          }
          // Remover do estado pendente após responder
          pendingReplies.delete(phone);
        }
      }
    });

  } catch (error) {
    console.error('[WA] Erro ao iniciar:', error.message);
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
  if (cleaned.startsWith('55')) cleaned = cleaned.substring(2);
  if (cleaned.length < 10 || cleaned.length > 11) return null;
  return `55${cleaned}@s.whatsapp.net`;
}

// =============================================================================
// Envio direto
// =============================================================================
async function _executeSend(phone, name) {
  if (currentStatus !== 'connected' || !sock) {
    throw new Error(`WhatsApp nao conectado. Status: ${currentStatus}`);
  }

  const formattedPhone = formatBRNumber(phone);
  if (!formattedPhone) throw new Error(`Numero invalido: ${phone}`);

  // Monta a mensagem a partir da config, substituindo {nome} e {name}
  const template = flowConfig.welcome_message ||
    `Olá {nome}! Seja bem vindo(a)! 🎉\n\nGostaríamos de te apresentar a *Fórmula do Boi*!\n\nAcesse nosso Marketplace e confira nossas ofertas exclusivas:\n👉 https://app.formuladoboi.com`;

  const messageText = template
    .replace(/\{nome\}/g, name)
    .replace(/\{name\}/g, name);

  const result = await sock.onWhatsApp(formattedPhone);
  if (!result || result.length === 0 || !result[0].exists) {
    console.log(`[Queue] ${formattedPhone} nao esta no WhatsApp.`);
    return { sent: false, reason: 'not_on_whatsapp' };
  }

  const jid = result[0].jid || formattedPhone;
  const msgResult = await sock.sendMessage(jid, { text: messageText });
  console.log(`[Queue] Enviado para ${jid} (${name}) — id: ${msgResult?.key?.id}`);

  // Marcar como aguardando resposta se houver opções configuradas
  const cleanPhone = phone.toString().replace(/\D/g, '');
  trackPendingReply(cleanPhone.startsWith('55') ? cleanPhone.substring(2) : cleanPhone);

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
      } catch { qrDataUrl = currentQr; }
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

  if (req.method === 'GET' && url.pathname === '/config') {
    res.writeHead(200);
    res.end(JSON.stringify({
      ...flowConfig,
      pending_replies: pendingReplies.size,
    }));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/reload-config') {
    loadFlowConfig()
      .then(() => {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      })
      .catch(e => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      });
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
  console.log(`[WA] Auth dir: ${AUTH_DIR}`);
  console.log(`[WA] Auth files: ${fs.readdirSync(AUTH_DIR).length}`);

  const baileys = await import('@whiskeysockets/baileys');
  makeWASocket = baileys.default;
  DisconnectReason = baileys.DisconnectReason;
  useMultiFileAuthState = baileys.useMultiFileAuthState;
  fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;

  // Carrega config do Supabase antes de iniciar o socket
  await loadFlowConfig();

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
