/**
 * WhatsApp Server — Servidor dedicado ao Baileys
 *
 * Roda separado do Next.js para manter a conexão WebSocket ativa.
 * Auth state em arquivos locais (useMultiFileAuthState) persistidos via
 * Docker volume em /data/auth — zero latência, zero corrupção.
 *
 * Expõe:
 *   GET  /status          → retorna {status, qr}
 *   POST /send            → recebe {phone, name} e adiciona à fila de envio (welcome)
 *   POST /send-direct     → recebe {phone, message, meta?} e enfileira mensagem livre
 *   POST /campaign-send   → recebe {campaign_id, recipients[]} e dispara campanha
 *   POST /add-to-group    → adiciona número ao grupo da LP
 *   GET  /queue           → retorna tamanho da fila
 *   GET  /config          → retorna a configuração de fluxo atual
 *   POST /reload-config   → força recarga da config do Supabase
 *
 * Fluxo conversacional (Central WhatsApp):
 *   Toda mensagem recebida em chat individual é encaminhada para
 *   `${NEXT_JS_URL}/api/whatsapp/inbound`. O Next.js classifica o interesse,
 *   atualiza o CRM e devolve a resposta a ser enviada (ou silêncio quando o
 *   lead pediu handoff humano / fez opt-out).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

let makeWASocket, DisconnectReason, useMultiFileAuthState,
    fetchLatestBaileysVersion, decryptPollVote;

let cachedWAVersion = null;

const PORT = process.env.WHATSAPP_SERVER_PORT || 3001;
const AUTH_DIR = process.env.AUTH_DIR || '/data/auth';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const NEXT_JS_URL = process.env.NEXT_JS_URL || '';
const GROUP_TASK_SECRET = process.env.WHATSAPP_GROUP_TASK_SECRET || '';
const LP_GROUP_INVITE_CODE = process.env.LP_GROUP_INVITE_CODE || 'JYxJPWfkoHHLZfosHlywN9';
let lpGroupJid = process.env.LP_GROUP_JID || null;

// Comandos de grupo
const GROUP_TASK_PREFIX = '/tarefa';
const GROUP_DECISION_PREFIX = '/decisao';
const GROUP_RISK_PREFIX = '/risco';
const GROUP_AI_PREFIX = '/ia';
const PROB_MAP = { '1': 'baixa', '2': 'media', '3': 'alta' };
const IMPACT_MAP = { '1': 'baixo', '2': 'medio', '3': 'alto' };

if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

// =============================================================================
// Flow config (mantido para compatibilidade com /api/whatsapp/flow legado)
// =============================================================================
let flowConfig = {
  welcome_message: `Olá {nome}! Seja bem vindo(a)! 🎉\n\nGostaríamos de te apresentar a *Fórmula do Boi*!\n\nAcesse nosso Marketplace e confira nossas ofertas exclusivas:\n👉 https://formuladoboi.com`,
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

setInterval(loadFlowConfig, 5 * 60 * 1000);

// =============================================================================
// Estado de criação de tarefas via grupo — fluxo multi-step
// =============================================================================
const pendingGroupTasks = new Map();
const GROUP_TASK_TIMEOUT_MS = 10 * 60 * 1000;

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

async function createGroupDecision(groupJid, state) {
  const { decision, reason, sender_name } = state;
  if (!NEXT_JS_URL || !GROUP_TASK_SECRET) return;

  try {
    const body = { decision };
    if (reason) body.reason = reason;
    const res = await fetch(`${NEXT_JS_URL}/api/whatsapp/group-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-webhook-secret': GROUP_TASK_SECRET },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const reasonText = reason ? `\n📝 Motivo: *${reason}*` : '';
      await sendGroupMsg(groupJid, `📒 Decisão registrada por *${sender_name}*:\n"${decision}"${reasonText}`);
    } else {
      await sendGroupMsg(groupJid, `❌ Não foi possível registrar a decisão. Tente novamente.`);
    }
  } catch (e) {
    console.error('[Grupo] Falha ao chamar API decision:', e.message);
  }
}

async function createGroupRisk(groupJid, state) {
  const { title, probability, impact, mitigation, sender_name } = state;
  if (!NEXT_JS_URL || !GROUP_TASK_SECRET) return;

  const probLabels = { 'baixa': 'Baixa', 'media': 'Média', 'alta': 'Alta' };
  const impactLabels = { 'baixo': 'Baixo', 'medio': 'Médio', 'alto': 'Alto' };

  try {
    const body = { title, probability, impact };
    if (mitigation) body.mitigation = mitigation;
    const res = await fetch(`${NEXT_JS_URL}/api/whatsapp/group-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-webhook-secret': GROUP_TASK_SECRET },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const mitigationText = mitigation ? `\n🛡️ Mitigação: *${mitigation}*` : '';
      await sendGroupMsg(groupJid,
        `⚠️ Risco registrado por *${sender_name}*:\n"${title}"\n🎲 Probabilidade: *${probLabels[probability] || probability}*\n💥 Impacto: *${impactLabels[impact] || impact}*${mitigationText}`
      );
    }
  } catch (e) {
    console.error('[Grupo] Falha ao chamar API risk:', e.message);
  }
}

async function askGroupAI(groupJid, question, senderName) {
  if (!NEXT_JS_URL || !GROUP_TASK_SECRET) return;
  console.log(`[Grupo IA] Pergunta de ${senderName}: "${question}"`);
  await sendGroupMsg(groupJid, `🤖 Processando pergunta de *${senderName}*...`);
  try {
    const res = await fetch(`${NEXT_JS_URL}/api/whatsapp/group-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-webhook-secret': GROUP_TASK_SECRET },
      body: JSON.stringify({ question, sender_name: senderName }),
      signal: AbortSignal.timeout(55000),
    });
    if (res.ok) {
      const json = await res.json();
      const answer = json.answer || 'Não consegui processar a pergunta.';
      await sendGroupMsg(groupJid, `🤖 *IA Fórmula do Boi*\n\n${answer}`);
    } else {
      await sendGroupMsg(groupJid, `❌ Não foi possível processar a pergunta. Tente novamente.`);
    }
  } catch (e) {
    console.error('[Grupo IA] Falha ao chamar API:', e.message);
  }
}

// =============================================================================
// Central WhatsApp — encaminha mensagens individuais para o Next.js classificar
// =============================================================================
async function notifyInboundToNextJs({ phone, name, body, message_id }) {
  if (!NEXT_JS_URL || !GROUP_TASK_SECRET) {
    console.warn('[Inbound] NEXT_JS_URL ou WHATSAPP_GROUP_TASK_SECRET não configurados.');
    return null;
  }
  try {
    const res = await fetch(`${NEXT_JS_URL}/api/whatsapp/inbound`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': GROUP_TASK_SECRET,
      },
      body: JSON.stringify({ phone, name, body, message_id }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      console.error(`[Inbound] /api/whatsapp/inbound respondeu ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error('[Inbound] Falha ao chamar API:', e.message);
    return null;
  }
}

// =============================================================================
// Estado global do socket
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
// Quanto tempo a fila espera reconexão antes de pausar (e devolver o item ao
// topo). Curto demais = fila vaza durante quedas reais; longo demais = trava
// envios depois de logout definitivo. 60s cobre quedas típicas do Baileys.
const QUEUE_WAIT_FOR_CONNECTION_MS = 60_000;

/**
 * Aguarda `currentStatus === 'connected'` até `timeoutMs`. Resolve `true` se
 * conectou dentro da janela, `false` caso contrário. Polling de 500ms para
 * não depender de event emitter (evita memory leak se chamarmos muitas vezes).
 */
function waitForConnection(timeoutMs) {
  if (currentStatus === 'connected') return Promise.resolve(true);
  return new Promise(resolve => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (currentStatus === 'connected') {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start >= timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, 500);
  });
}

async function runMsgQueue() {
  if (queueRunning) return;
  queueRunning = true;
  try {
    while (msgQueue.length > 0) {
      // Sem conexão? Espera até reconectar (ou desiste e pausa a fila).
      // Crucial: quando o WhatsApp derruba a sessão no meio de uma campanha,
      // não podemos consumir os itens restantes — eles seriam "enviados" para
      // um socket null e descartados silenciosamente.
      if (currentStatus !== 'connected') {
        console.warn(`[Queue] Sem conexão (status=${currentStatus}). Aguardando até ${QUEUE_WAIT_FOR_CONNECTION_MS / 1000}s.`);
        const ok = await waitForConnection(QUEUE_WAIT_FOR_CONNECTION_MS);
        if (!ok) {
          console.warn(`[Queue] Pausando: ${msgQueue.length} itens aguardam reconexão. Retoma automaticamente quando connection.open disparar.`);
          break;
        }
        console.log(`[Queue] Conexão restaurada. Retomando ${msgQueue.length} itens.`);
      }

      const item = msgQueue.shift();
      try {
        if (item.kind === 'welcome') {
          await _executeSend(item.phone, item.name);
        } else if (item.kind === 'direct') {
          await _executeSendDirect(item.phone, item.message, item.meta, item.media || null, item.poll || null);
        }
      } catch (err) {
        const msg = err?.message || String(err);
        // Se caiu a conexão DURANTE o envio (corrida entre shift e _execute),
        // devolve o item ao TOPO da fila pra tentar de novo quando reconectar.
        if (msg.includes('nao conectado') || msg.includes('Connection Closed')) {
          console.warn(`[Queue] Caiu durante envio para ${item.phone} — devolvendo item ao topo da fila.`);
          msgQueue.unshift(item);
          break;
        }
        console.error(`[Queue] Falha ao enviar para ${item.phone}: ${msg}`);
      }
      if (msgQueue.length > 0) {
        await new Promise(r => setTimeout(r, QUEUE_DELAY_MS));
      }
    }
  } finally {
    queueRunning = false;
  }
}

function enqueueSend(phone, name) {
  if (msgQueue.length >= 500) throw new Error('Fila de envio cheia (max 500).');
  msgQueue.push({ kind: 'welcome', phone, name });
  const position = msgQueue.length;
  const estimatedSeconds = (position - 1) * (QUEUE_DELAY_MS / 1000);
  runMsgQueue();
  return { queued: true, position, estimatedSeconds };
}

function enqueueSendDirect(phone, message, meta = null, media = null, poll = null) {
  if (msgQueue.length >= 500) throw new Error('Fila de envio cheia (max 500).');
  msgQueue.push({ kind: 'direct', phone, message, meta, media, poll });
  const position = msgQueue.length;
  const estimatedSeconds = (position - 1) * (QUEUE_DELAY_MS / 1000);
  runMsgQueue();
  return { queued: true, position, estimatedSeconds };
}

// =============================================================================
// Bootstrap do socket
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
        const err = lastDisconnect?.error;
        const statusCode = err?.output?.statusCode;
        const errMsg = err?.message || (err && String(err)) || 'sem mensagem';
        const loggedOut = statusCode === DisconnectReason.loggedOut;

        // Logging rico — antes só tinha statusCode, o que dificulta diagnosticar
        // por que o WhatsApp derrubou (timeout? stream conflict? ban temporário?).
        // Inclui também tamanho da fila no momento — útil pra correlacionar quedas
        // com bursts de envio.
        console.log(`[WA] Conexao fechada (code=${statusCode}, gen=${myGen}, queue=${msgQueue.length}, msg="${errMsg}")`);

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
            for (const f of files) fs.unlinkSync(path.join(AUTH_DIR, f));
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
        if (!lpGroupJid && LP_GROUP_INVITE_CODE) {
          sock.groupGetInviteInfo(LP_GROUP_INVITE_CODE)
            .then(info => {
              lpGroupJid = info.id;
              console.log(`[LP] Grupo da LP resolvido: ${lpGroupJid}`);
            })
            .catch(e => console.warn('[LP] Não foi possível resolver JID do grupo:', e.message));
        }
        // Retoma a fila se houver itens pendentes da queda anterior.
        // Sem isso, mensagens que foram devolvidas ao topo da fila ficariam
        // paradas até a próxima chamada externa de enqueueSend*.
        if (msgQueue.length > 0 && !queueRunning) {
          console.log(`[Queue] Conexão voltou — retomando ${msgQueue.length} itens pendentes.`);
          runMsgQueue();
        }
      }
    });

    // -----------------------------------------------------------------
    // Mensagens recebidas
    // -----------------------------------------------------------------
    sock.ev.on('messages.upsert', async ({ messages: msgs, type }) => {
      if (myGen !== socketGeneration) return;
      if (type !== 'notify') return;

      for (const msg of msgs) {
        if (msg.key.fromMe) continue;
        const remoteJid = msg.key.remoteJid;
        if (!remoteJid) continue;
        if (remoteJid === 'status@broadcast') continue;

        const text = (
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          ''
        ).trim();
        if (!text) continue;

        // ──────────────────────────────────────────────────────
        // Mensagens de GRUPO — comandos /tarefa, /decisao, /risco, /ia
        // ──────────────────────────────────────────────────────
        if (remoteJid.endsWith('@g.us')) {
          await handleGroupMessage(msg, remoteJid, text);
          continue;
        }

        // ──────────────────────────────────────────────────────
        // Mensagens INDIVIDUAIS — Central WhatsApp
        //   Encaminha tudo para o Next.js classificar e responder.
        // ──────────────────────────────────────────────────────
        await handleIndividualMessage(remoteJid, text, msg);
      }
    });

    // Votos em poll → vêm como messages.update com pollUpdates criptografado.
    // Decryptamos usando o messageSecret cacheado e disparamos /api/whatsapp/inbound
    // com o texto da opção votada, para o engine classificar normalmente.
    sock.ev.on('messages.update', async (updates) => {
      if (myGen !== socketGeneration) return;
      for (const u of updates) {
        const pollUpdates = u.update?.pollUpdates;
        if (!Array.isArray(pollUpdates) || pollUpdates.length === 0) continue;
        await handlePollVoteUpdates(u.key, pollUpdates).catch(e =>
          console.error('[Poll] handlePollVoteUpdates falhou:', e.message)
        );
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
// Handlers de mensagem (extraídos para clareza)
// =============================================================================

/**
 * Processa votes de poll.
 *
 * `pollKey` é a key da poll original (id == pollMsgId no nosso cache).
 * `pollUpdates` são os votos individuais; cada um tem o JID do votante em
 * pu.pollUpdateMessageKey.remoteJid e o vote criptografado em pu.vote.
 *
 * Para cada vote: decrypta → mapeia hash SHA256 → texto da opção → POSTa
 * para /api/whatsapp/inbound com o texto, como se fosse uma mensagem comum.
 */
async function handlePollVoteUpdates(pollKey, pollUpdates) {
  const pollMsgId = pollKey?.id;
  if (!pollMsgId) return;
  const cached = pollCache.get(pollMsgId);
  if (!cached) {
    console.warn('[Poll] vote em poll não cacheada:', pollMsgId);
    return;
  }
  if (!decryptPollVote) {
    console.warn('[Poll] decryptPollVote indisponível na lib Baileys');
    return;
  }
  if (!NEXT_JS_URL || !GROUP_TASK_SECRET) {
    console.warn('[Poll] NEXT_JS_URL/secret ausente — vote ignorado');
    return;
  }

  const myJid = sock?.user?.id;
  if (!myJid) {
    console.warn('[Poll] sock.user.id ausente — não dá para decryptar');
    return;
  }

  // Mapa hash -> texto para resolver as opções escolhidas
  const hashToText = new Map();
  for (const opt of cached.values) {
    hashToText.set(sha256Hex(opt), opt);
  }

  for (const pu of pollUpdates) {
    try {
      const voterJid = pu.pollUpdateMessageKey?.remoteJid;
      if (!voterJid || !pu.vote) continue;

      const decrypted = await decryptPollVote(pu.vote, {
        pollEncKey: cached.encKey,
        pollCreatorJid: myJid,
        pollMsgId,
        voterJid,
      });
      const selected = decrypted?.selectedOptions || [];
      // selectedOptions é array de Buffer (SHA256 raw bytes das opções)
      const texts = [];
      for (const sel of selected) {
        const hex = Buffer.from(sel).toString('hex');
        const text = hashToText.get(hex);
        if (text) texts.push(text);
      }
      if (texts.length === 0) {
        console.warn('[Poll] vote decryptado mas sem match de hash:', pollMsgId, voterJid);
        continue;
      }
      const phone = voterJid.replace(/@.*/, '');
      const body = texts.join(', ');
      console.log(`[Poll] vote ${voterJid} em poll ${pollMsgId}: "${body}"`);

      // Encaminha para o Next.js classificar (interesse_principal etc.)
      try {
        await fetch(`${NEXT_JS_URL}/api/whatsapp/inbound`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-webhook-secret': GROUP_TASK_SECRET },
          body: JSON.stringify({
            phone,
            name: '',
            body,
            message_id: pu.pollUpdateMessageKey?.id || null,
            poll_vote: true,
          }),
          signal: AbortSignal.timeout(10000),
        });
      } catch (e) {
        console.warn('[Poll] POST inbound falhou:', e.message);
      }
    } catch (e) {
      console.error('[Poll] decrypt falhou:', e.message);
    }
  }
}

async function handleGroupMessage(msg, remoteJid, text) {
  const lower = text.toLowerCase();
  const senderJid = msg.key.participant || '';
  const sender = senderJid.replace('@s.whatsapp.net', '');
  const senderName = msg.pushName || sender;
  const taskKey = `${senderJid}::${remoteJid}`;
  const skipWords = ['pular', 'nao', 'não', 'nenhum', '-', 'sem'];

  if (lower.startsWith(GROUP_AI_PREFIX)) {
    const question = text.slice(GROUP_AI_PREFIX.length).trim();
    if (!question) {
      await sendGroupMsg(remoteJid, '⚠️ Use: /ia <sua pergunta>\nEx: /ia quantos leads novos temos essa semana?');
      return;
    }
    askGroupAI(remoteJid, question, senderName);
    return;
  }

  if (lower.startsWith(GROUP_TASK_PREFIX)) {
    const title = text.slice(GROUP_TASK_PREFIX.length).trim();
    if (!title) {
      await sendGroupMsg(remoteJid, '⚠️ Use: /tarefa <descrição da tarefa>');
      return;
    }
    if (!NEXT_JS_URL || !GROUP_TASK_SECRET) return;
    pendingGroupTasks.set(taskKey, {
      flow_type: 'task', step: 'etapa', title,
      group_id: remoteJid, sender, sender_name: senderName,
      expires_at: Date.now() + GROUP_TASK_TIMEOUT_MS,
    });
    await sendGroupMsg(remoteJid,
      `📋 *Tarefa:* "${title}"\n\nEm qual etapa ficará?\n1️⃣ Idéias\n2️⃣ A fazer\n3️⃣ Em andamento`
    );
    return;
  }

  if (lower.startsWith(GROUP_DECISION_PREFIX)) {
    const decision = text.slice(GROUP_DECISION_PREFIX.length).trim();
    if (!decision) {
      await sendGroupMsg(remoteJid, '⚠️ Use: /decisao <texto da decisão>');
      return;
    }
    if (!NEXT_JS_URL || !GROUP_TASK_SECRET) return;
    pendingGroupTasks.set(taskKey, {
      flow_type: 'decision', step: 'motivo', decision,
      sender, sender_name: senderName,
      expires_at: Date.now() + GROUP_TASK_TIMEOUT_MS,
    });
    await sendGroupMsg(remoteJid, `📒 *Decisão:* "${decision}"\n\nQual o motivo?\n(Digite o motivo ou responda *pular*)`);
    return;
  }

  if (lower.startsWith(GROUP_RISK_PREFIX)) {
    const title = text.slice(GROUP_RISK_PREFIX.length).trim();
    if (!title) {
      await sendGroupMsg(remoteJid, '⚠️ Use: /risco <título do risco>');
      return;
    }
    if (!NEXT_JS_URL || !GROUP_TASK_SECRET) return;
    pendingGroupTasks.set(taskKey, {
      flow_type: 'risk', step: 'probabilidade', title,
      sender, sender_name: senderName,
      expires_at: Date.now() + GROUP_TASK_TIMEOUT_MS,
    });
    await sendGroupMsg(remoteJid, `⚠️ *Risco:* "${title}"\n\nQual a probabilidade?\n1️⃣ Baixa\n2️⃣ Média\n3️⃣ Alta`);
    return;
  }

  // Continuar fluxo pendente
  const pending = pendingGroupTasks.get(taskKey);
  if (!pending) return;
  if (pending.expires_at < Date.now()) {
    pendingGroupTasks.delete(taskKey);
    return;
  }
  pending.expires_at = Date.now() + GROUP_TASK_TIMEOUT_MS;

  if (pending.flow_type === 'task') {
    if (pending.step === 'etapa') {
      const etapa = ETAPA_MAP[text.trim()];
      if (!etapa) { await sendGroupMsg(remoteJid, '⚠️ Responda com *1*, *2* ou *3*.'); return; }
      pending.step = 'responsavel'; pending.status = etapa;
      await sendGroupMsg(remoteJid, `👤 Quem é o responsável?\n(Digite o nome ou responda *pular*)`);
      return;
    }
    if (pending.step === 'responsavel') {
      pending.assignee = skipWords.includes(text.toLowerCase().trim()) ? null : text.trim();
      pending.step = 'prazo';
      await sendGroupMsg(remoteJid, `📅 Qual o prazo?\n(Ex: *25/04* ou *sem prazo*)`);
      return;
    }
    if (pending.step === 'prazo') {
      const dueDate = parseDueDate(text);
      const lower2 = text.toLowerCase().trim();
      if (text.trim() && !skipWords.includes(lower2) && lower2 !== 'sem prazo' && !dueDate) {
        await sendGroupMsg(remoteJid, '⚠️ Formato inválido. Use *dd/mm* (ex: 25/04) ou *sem prazo*.');
        return;
      }
      pendingGroupTasks.delete(taskKey);
      await createGroupTask(remoteJid, pending, dueDate);
      return;
    }
  }

  if (pending.flow_type === 'decision' && pending.step === 'motivo') {
    pending.reason = skipWords.includes(text.toLowerCase().trim()) ? null : text.trim();
    pendingGroupTasks.delete(taskKey);
    await createGroupDecision(remoteJid, pending);
    return;
  }

  if (pending.flow_type === 'risk') {
    if (pending.step === 'probabilidade') {
      const prob = PROB_MAP[text.trim()];
      if (!prob) { await sendGroupMsg(remoteJid, '⚠️ Responda com *1*, *2* ou *3*.'); return; }
      pending.probability = prob; pending.step = 'impacto';
      await sendGroupMsg(remoteJid, `💥 Qual o impacto?\n1️⃣ Baixo\n2️⃣ Médio\n3️⃣ Alto`);
      return;
    }
    if (pending.step === 'impacto') {
      const imp = IMPACT_MAP[text.trim()];
      if (!imp) { await sendGroupMsg(remoteJid, '⚠️ Responda com *1*, *2* ou *3*.'); return; }
      pending.impact = imp; pending.step = 'mitigacao';
      await sendGroupMsg(remoteJid, `🛡️ Qual a mitigação?\n(Digite a ação ou responda *pular*)`);
      return;
    }
    if (pending.step === 'mitigacao') {
      pending.mitigation = skipWords.includes(text.toLowerCase().trim()) ? null : text.trim();
      pendingGroupTasks.delete(taskKey);
      await createGroupRisk(remoteJid, pending);
      return;
    }
  }
}

async function handleIndividualMessage(remoteJid, text, msg) {
  const phone = remoteJid.replace('@s.whatsapp.net', '');
  const senderName = msg.pushName || phone;
  const messageId = msg.key.id || null;

  console.log(`[Inbound] ${phone} (${senderName}): "${text.slice(0, 80)}"`);

  const result = await notifyInboundToNextJs({
    phone,
    name: senderName,
    body: text,
    message_id: messageId,
  });

  // Next.js diz qual é a próxima resposta a enviar (ou silêncio)
  if (!result) return;
  if (result.silent) {
    console.log(`[Inbound] ${phone} → silent (handoff/optout/ignore)`);
    return;
  }
  if (result.reply && currentStatus === 'connected' && sock) {
    try {
      await sock.sendMessage(remoteJid, { text: result.reply });
      console.log(`[Inbound] ${phone} → resposta enviada (${result.bot_step || 'reply'})`);
    } catch (e) {
      console.error(`[Inbound] Erro ao responder ${phone}:`, e.message);
    }
  }
}

// =============================================================================
// Helpers de envio
// =============================================================================
function formatBRNumber(phone) {
  let cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.startsWith('55')) cleaned = cleaned.substring(2);
  if (cleaned.length < 10 || cleaned.length > 11) return null;
  return `55${cleaned}@s.whatsapp.net`;
}

// Pequena pausa entre as mensagens compostas (mídia → texto → enquete) para
// que o WhatsApp processe cada bubble na ordem certa e o destinatário veja
// na ordem natural.
const COMPOSED_DELAY_MS = 1200;

// =============================================================================
// Poll vote tracking
// =============================================================================
// Quando enviamos uma poll, o WhatsApp envia o voto do destinatário como
// `messages.update` com `pollUpdates` criptografado — NÃO como mensagem de
// texto comum. Para classificar essas escolhas no /api/whatsapp/inbound,
// precisamos:
//   1. Guardar `messageSecret` + opções da poll quando ela foi enviada.
//   2. Quando o vote chega, decryptar com `decryptPollVote` e mapear o hash
//      SHA256 retornado de volta para o texto da opção.
//   3. POSTar o texto resultante no /api/whatsapp/inbound como se fosse uma
//      mensagem de texto comum, para o engine classificar normalmente.
//
// Cache em memória — perde no restart do container, mas votos típicos
// chegam segundos depois do envio. TTL de 7 dias para limitar growth.
const pollCache = new Map(); // pollMsgId -> { values, encKey, jid, sentAt }
const POLL_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const POLL_CACHE_MAX = 5000;
setInterval(() => {
  const cutoff = Date.now() - POLL_CACHE_TTL_MS;
  for (const [k, v] of pollCache.entries()) {
    if (v.sentAt < cutoff) pollCache.delete(k);
  }
  // Hard cap (LRU-ish: drop oldest when blown)
  while (pollCache.size > POLL_CACHE_MAX) {
    const oldestKey = pollCache.keys().next().value;
    if (!oldestKey) break;
    pollCache.delete(oldestKey);
  }
}, 60 * 60 * 1000);

// Pré-calcula SHA256 hex de cada opção para mapear hash -> texto no decrypt.
let _crypto;
function getCrypto() {
  if (!_crypto) _crypto = require('crypto');
  return _crypto;
}
function sha256Hex(input) {
  return getCrypto().createHash('sha256').update(Buffer.from(input, 'utf8')).digest('hex');
}

/**
 * Envia uma sequência composta para `jid`:
 *   1. Mídia (se `media.url`) com legenda opcional (caption).
 *   2. Texto (`body`) — só se vier separado da legenda da mídia.
 *   3. Enquete nativa (poll) com pergunta + opções.
 *
 * Regra de caption: se o template tem `media` E `body`:
 *   - quando `media.caption` veio explicitamente, usa esse texto como legenda
 *     da mídia e o `body` vai como mensagem separada (2 bubbles antes do poll).
 *   - quando `media.caption` é vazio e `body` é curto (≤ 1024 chars, limite do
 *     WhatsApp para caption), o `body` vira a legenda e enviamos só 1 bubble.
 *   - quando `body` excede o limite de caption ou está vazio, mídia vai
 *     sem caption e `body` separado (se houver).
 *
 * Retorna `{sent, ids[]}` ou propaga erro.
 */
async function _sendComposed(jid, body, media, poll) {
  const ids = [];
  let mediaSentWithCaption = false;

  if (media && media.url) {
    const captionExplicit = typeof media.caption === 'string' && media.caption.trim().length > 0;
    let caption;
    if (captionExplicit) {
      caption = media.caption;
    } else if (body && body.length <= 1024) {
      caption = body;
      mediaSentWithCaption = true;
    } else {
      caption = undefined;
    }

    let mediaPayload;
    switch (media.type) {
      case 'image':
        mediaPayload = { image: { url: media.url }, caption };
        break;
      case 'video':
        mediaPayload = { video: { url: media.url }, caption };
        break;
      case 'audio':
        // ptt=true para "voz" (mais natural em apresentação pessoal); o cliente
        // escolhe via media.mime se preferir document. Mantemos ptt=false aqui
        // para não simular voz quando o template é só áudio anexo.
        mediaPayload = { audio: { url: media.url }, mimetype: media.mime || 'audio/ogg; codecs=opus', ptt: false };
        break;
      case 'document':
        mediaPayload = {
          document: { url: media.url },
          mimetype: media.mime || 'application/octet-stream',
          fileName: media.filename || 'arquivo',
          caption,
        };
        break;
      default:
        throw new Error(`media.type inválido: ${media.type}`);
    }
    const r = await sock.sendMessage(jid, mediaPayload);
    ids.push(r?.key?.id);
    if ((body && !mediaSentWithCaption) || poll) await new Promise(r => setTimeout(r, COMPOSED_DELAY_MS));
  }

  if (body && !mediaSentWithCaption) {
    const r = await sock.sendMessage(jid, { text: body });
    ids.push(r?.key?.id);
    if (poll) await new Promise(r => setTimeout(r, COMPOSED_DELAY_MS));
  }

  if (poll && poll.question && Array.isArray(poll.options) && poll.options.length >= 2) {
    const r = await sock.sendMessage(jid, {
      poll: {
        name: poll.question,
        values: poll.options,
        selectableCount: Math.max(1, Math.min(poll.options.length, poll.selectable_count || 1)),
      },
    });
    ids.push(r?.key?.id);
    // Cacheia messageSecret + opções para conseguir decryptar votes depois.
    // O Baileys popula messageContextInfo.messageSecret na mensagem enviada.
    const pollMsgId = r?.key?.id;
    const messageSecret = r?.message?.messageContextInfo?.messageSecret
      || r?.message?.pollCreationMessage?.messageSecret
      || r?.message?.pollCreationMessageV3?.messageSecret;
    if (pollMsgId && messageSecret) {
      pollCache.set(pollMsgId, {
        values: poll.options.slice(),
        encKey: Buffer.from(messageSecret),
        jid,
        sentAt: Date.now(),
      });
    } else {
      console.warn('[Poll] enviado sem cache (messageSecret ausente) — votes não vão ser classificados.', { pollMsgId });
    }
  }

  return { sent: ids.length > 0, ids };
}

async function _executeSend(phone, name) {
  if (currentStatus !== 'connected' || !sock) {
    throw new Error(`WhatsApp nao conectado. Status: ${currentStatus}`);
  }

  const formattedPhone = formatBRNumber(phone);
  if (!formattedPhone) throw new Error(`Numero invalido: ${phone}`);

  // A mensagem de boas-vindas vem do Next.js (template welcome-default).
  // O endpoint `/api/whatsapp/render-welcome` pode responder:
  //   { body, media?, poll? } → renderizado; envia mídia+texto+enquete em ordem.
  //   { silent, reason }      → opt-out — NÃO enviar nada.
  //
  // Só caímos no fallback do flowConfig.welcome_message quando o Next.js está
  // INACESSÍVEL (timeout / 5xx / sem resposta) — nunca quando ele responde
  // explicitamente que é pra ficar em silêncio.
  let messageText = null;
  let mediaPayload = null;
  let pollPayload = null;
  let renderReachable = false;
  if (NEXT_JS_URL && GROUP_TASK_SECRET) {
    try {
      const r = await fetch(`${NEXT_JS_URL}/api/whatsapp/render-welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-webhook-secret': GROUP_TASK_SECRET },
        body: JSON.stringify({ phone, name }),
        signal: AbortSignal.timeout(8000),
      });
      if (r.ok) {
        renderReachable = true;
        const data = await r.json();
        if (data?.silent === true) {
          console.log(`[Welcome] ${formattedPhone} em opt-out (${data.reason || 'silent'}) — abortado.`);
          return { sent: false, reason: data.reason || 'optout' };
        }
        if (data?.body) messageText = data.body;
        if (data?.media?.url) mediaPayload = data.media;
        if (data?.poll?.question) pollPayload = data.poll;
      } else {
        console.warn(`[Welcome] render-welcome respondeu HTTP ${r.status} — usando fallback.`);
      }
    } catch (e) {
      console.warn('[Welcome] Falha ao renderizar via Next.js, usando fallback:', e.message);
    }
  }

  if (!messageText && !mediaPayload && !pollPayload) {
    if (renderReachable) {
      console.log(`[Welcome] ${formattedPhone} — render sem conteúdo, abortado.`);
      return { sent: false, reason: 'no_template' };
    }
    const template = flowConfig.welcome_message;
    messageText = template.replace(/\{nome\}/g, name).replace(/\{name\}/g, name);
  }

  const result = await sock.onWhatsApp(formattedPhone);
  if (!result || result.length === 0 || !result[0].exists) {
    console.log(`[Queue] ${formattedPhone} nao esta no WhatsApp.`);
    return { sent: false, reason: 'not_on_whatsapp' };
  }

  const jid = result[0].jid || formattedPhone;
  const out = await _sendComposed(jid, messageText, mediaPayload, pollPayload);
  console.log(`[Queue] Welcome enviado para ${jid} (${name}) — bubbles: ${out.ids.length} — ids: ${out.ids.join(',')}`);
  return { sent: true };
}

async function _executeAddToGroup(phone) {
  if (currentStatus !== 'connected' || !sock) {
    throw new Error(`WhatsApp nao conectado. Status: ${currentStatus}`);
  }
  if (!lpGroupJid) {
    throw new Error('JID do grupo ainda nao resolvido. Aguarde a conexao ou defina LP_GROUP_JID.');
  }
  const formattedPhone = formatBRNumber(phone);
  if (!formattedPhone) throw new Error(`Numero invalido: ${phone}`);

  const results = await sock.groupParticipantsUpdate(lpGroupJid, [formattedPhone], 'add');
  const result = results?.[0];
  const status = result?.status;

  if (status === '200') {
    console.log(`[LP] ${formattedPhone} adicionado ao grupo ${lpGroupJid}`);
    return { added: true };
  }
  console.warn(`[LP] Não foi possível adicionar ${formattedPhone} ao grupo. Status: ${status}`);
  return { added: false, status };
}

/**
 * Envia mensagem direta para um número. Aceita texto, mídia e/ou enquete.
 *
 * Argumentos:
 *   message — texto (pode ser string vazia se houver mídia ou poll)
 *   meta    — { report_url?, campaign_id?, recipient_id?, phone?, caption? }
 *             (caption sobrescreve a legenda da mídia para esta entrega)
 *   media   — { url, type, mime?, filename?, caption? } | null
 *   poll    — { question, options[], selectable_count } | null
 */
async function _executeSendDirect(phone, message, meta, media = null, poll = null) {
  if (currentStatus !== 'connected' || !sock) {
    throw new Error(`WhatsApp nao conectado. Status: ${currentStatus}`);
  }

  const formattedPhone = formatBRNumber(phone);
  if (!formattedPhone) throw new Error(`Numero invalido: ${phone}`);

  const result = await sock.onWhatsApp(formattedPhone);
  if (!result || result.length === 0 || !result[0].exists) {
    console.log(`[Queue] ${formattedPhone} nao esta no WhatsApp.`);
    if (meta?.report_url && NEXT_JS_URL && GROUP_TASK_SECRET) {
      fetch(meta.report_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-webhook-secret': GROUP_TASK_SECRET },
        body: JSON.stringify({ ...meta, status: 'falhou', error: 'not_on_whatsapp' }),
        signal: AbortSignal.timeout(5000),
      }).catch(() => {});
    }
    return { sent: false, reason: 'not_on_whatsapp' };
  }

  const jid = result[0].jid || formattedPhone;
  // meta.caption permite override da legenda por destinatário (campanhas
  // renderizam {nome} para cada um). Se vier, sobrescreve media.caption.
  const effectiveMedia = media
    ? { ...media, caption: meta?.caption ?? media.caption }
    : null;
  const out = await _sendComposed(jid, message, effectiveMedia, poll);
  console.log(`[Queue] Direta enviada para ${jid} — bubbles: ${out.ids.length} — ids: ${out.ids.join(',')}`);

  if (meta?.report_url && NEXT_JS_URL && GROUP_TASK_SECRET) {
    fetch(meta.report_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-webhook-secret': GROUP_TASK_SECRET },
      body: JSON.stringify({ ...meta, status: 'enviado', message_id: out.ids[0] || null, message_ids: out.ids }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => {});
  }

  return { sent: true };
}

// =============================================================================
// HTTP server
// =============================================================================
async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader('Content-Type', 'application/json');

  try {
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
      const { phone, name } = await readJsonBody(req);
      if (!phone || !name) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'phone e name sao obrigatorios' })); return;
      }
      const result = enqueueSend(phone, name);
      res.writeHead(200); res.end(JSON.stringify({ success: true, sent: true, ...result })); return;
    }

    if (req.method === 'POST' && url.pathname === '/send-direct') {
      const { phone, message, meta, media, poll } = await readJsonBody(req);
      // Aceita envio com APENAS mídia ou APENAS enquete (message pode ser vazio)
      if (!phone || (!message && !media && !poll)) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'phone obrigatório; message, media ou poll necessário' })); return;
      }
      const result = enqueueSendDirect(phone, message || '', meta, media || null, poll || null);
      res.writeHead(200); res.end(JSON.stringify({ success: true, ...result })); return;
    }

    if (req.method === 'POST' && url.pathname === '/campaign-send') {
      const { campaign_id, recipients, media, poll } = await readJsonBody(req);
      if (!campaign_id || !Array.isArray(recipients)) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'campaign_id e recipients[] são obrigatórios' }));
        return;
      }
      const queued = [];
      const reportUrl = `${NEXT_JS_URL}/api/whatsapp/campaign-callback`;
      for (const r of recipients) {
        // Aceita recipient sem `message` se a campanha tem mídia ou poll
        if (!r.phone) continue;
        if (!r.message && !media && !poll) continue;
        try {
          const meta = {
            report_url: reportUrl,
            campaign_id,
            recipient_id: r.recipient_id || null,
            phone: r.phone,
            // caption por destinatário (rendered no Next.js); o VPS prefere
            // este valor sobre media.caption do template.
            caption: r.caption || null,
          };
          const q = enqueueSendDirect(r.phone, r.message || '', meta, media || null, poll || null);
          queued.push({ recipient_id: r.recipient_id, ...q });
        } catch (e) {
          queued.push({ recipient_id: r.recipient_id, error: e.message });
        }
      }
      res.writeHead(200); res.end(JSON.stringify({ queued: queued.length, items: queued })); return;
    }

    if (req.method === 'POST' && url.pathname === '/add-to-group') {
      const { phone } = await readJsonBody(req);
      if (!phone) { res.writeHead(400); res.end(JSON.stringify({ error: 'phone e obrigatorio' })); return; }
      const result = await _executeAddToGroup(phone);
      res.writeHead(200); res.end(JSON.stringify({ success: true, ...result })); return;
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

    // /health — pensado pra ser monitorado externamente (UptimeRobot, Vercel
    // health probe, painel admin). Retorna 503 se a sessão não está conectada
    // OU se há fila acumulada sem progresso. 200 quando tudo nominal.
    if (req.method === 'GET' && url.pathname === '/health') {
      const healthy = currentStatus === 'connected';
      const code = healthy ? 200 : 503;
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        healthy,
        status: currentStatus,
        queue_size: msgQueue.length,
        queue_running: queueRunning,
        reconnect_attempts: reconnectAttempts,
        uptime_seconds: Math.floor(process.uptime()),
      }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/config') {
      res.writeHead(200);
      res.end(JSON.stringify({ ...flowConfig }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/reload-config') {
      await loadFlowConfig();
      res.writeHead(200); res.end(JSON.stringify({ success: true })); return;
    }

    res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    console.error('[HTTP] Erro:', error.message);
    res.writeHead(500); res.end(JSON.stringify({ error: error.message }));
  }
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
  decryptPollVote = baileys.decryptPollVote;

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
