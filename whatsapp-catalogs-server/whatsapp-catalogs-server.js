/**
 * WhatsApp Catalogs Server — sessão Baileys dedicada a monitorar grupos
 * de WhatsApp em busca de PDFs de catálogo de leilão.
 *
 * Roda no MESMO VPS da Central, mas em container separado (porta 3002,
 * auth folder distinto, número diferente).
 *
 * Fluxo:
 *   1. Sobe Baileys com useMultiFileAuthState em /data/auth.
 *   2. Periodicamente (5min) pega a lista de JIDs monitorados do Next.js
 *      via GET /api/whatsapp-catalogos/active-groups.
 *   3. Em messages.upsert, filtra:
 *        - remoteJid endsWith('@g.us')
 *        - jid está na lista monitorada
 *        - mensagem é documentMessage com mimetype application/pdf
 *   4. Faz downloadMediaMessage, sobe pro R2 (PUT presigned próprio),
 *      e POSTa em /api/whatsapp-catalogos/webhook com r2_key + metadados.
 *   5. Next.js decide se anexa ao cronograma ou apenas registra.
 *
 * Não fala com o Supabase diretamente — toda lógica de matching e gravação
 * vive no Next.js. Aqui é só captura + upload + ping.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { AwsClient } = require('aws4fetch');

let makeWASocket, DisconnectReason, useMultiFileAuthState,
    fetchLatestBaileysVersion, downloadMediaMessage;

let cachedWAVersion = null;

const PORT = process.env.WHATSAPP_CATALOGS_SERVER_PORT || 3002;
const AUTH_DIR = process.env.AUTH_DIR || '/data/auth';
const NEXT_JS_URL = process.env.NEXT_JS_URL || '';
const GROUP_TASK_SECRET = process.env.WHATSAPP_GROUP_TASK_SECRET || '';
const POLL_GROUPS_EVERY_MS = parseInt(process.env.POLL_GROUPS_EVERY_MS || '300000', 10);

// R2 ───────────────────────────────────────────────────────────────────────
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_BUCKET = process.env.R2_BUCKET || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_ENDPOINT = (process.env.R2_ENDPOINT || '').replace(/\/+$/, '');
const R2_PREFIX = (process.env.R2_PREFIX || 'libmedia/').replace(/^\/+/, '');
const CATALOG_PREFIX = `${R2_PREFIX}catalogos-whatsapp/`;

const r2 = (R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY)
    ? new AwsClient({
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
        region: 'auto',
        service: 's3',
    })
    : null;

if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

// =============================================================================
// Sincronização com o Next.js: lista de JIDs monitorados
// =============================================================================
let monitoredJids = new Set();
let lastSync = null;
let lastSyncError = null;

async function syncMonitoredGroups() {
    if (!NEXT_JS_URL || !GROUP_TASK_SECRET) {
        console.warn('[Sync] NEXT_JS_URL / secret ausente — não consigo ler grupos ativos');
        return;
    }
    try {
        const res = await fetch(`${NEXT_JS_URL}/api/whatsapp-catalogos/active-groups`, {
            headers: { 'x-webhook-secret': GROUP_TASK_SECRET },
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
            lastSyncError = `HTTP ${res.status}`;
            return;
        }
        const j = await res.json();
        monitoredJids = new Set((j.groups || []).map(g => g.jid).filter(Boolean));
        lastSync = new Date().toISOString();
        lastSyncError = null;
        console.log(`[Sync] ${monitoredJids.size} grupo(s) monitorado(s)`);
    } catch (e) {
        lastSyncError = e.message;
        console.error('[Sync] erro:', e.message);
    }
}
setInterval(syncMonitoredGroups, POLL_GROUPS_EVERY_MS);

// =============================================================================
// R2 upload
// =============================================================================
function sanitize(name) {
    return name.replace(/[^a-zA-Z0-9._\-]/g, '_');
}

async function uploadPdfToR2(buffer, fileName, mime) {
    if (!r2 || !R2_ENDPOINT || !R2_BUCKET) {
        throw new Error('R2 não configurado (R2_ENDPOINT/BUCKET/credenciais)');
    }
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const uuid = crypto.randomUUID();
    const safeName = sanitize(fileName) || 'catalogo.pdf';
    const key = `${CATALOG_PREFIX}${yyyy}/${mm}/${uuid}_${safeName}`;
    const url = `${R2_ENDPOINT}/${R2_BUCKET}/${key.split('/').map(encodeURIComponent).join('/')}`;
    // aws4fetch assina o request; undici computa Content-Length automaticamente
    // a partir do Buffer (não setar manualmente pra não conflitar com a assinatura).
    const res = await r2.fetch(url, {
        method: 'PUT',
        body: buffer,
        headers: {
            'Content-Type': mime || 'application/pdf',
        },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`R2 PUT falhou (${res.status}): ${text.slice(0, 200)}`);
    }
    return key;
}

// =============================================================================
// Webhook → Next.js
// =============================================================================
async function notifyDetection(payload) {
    if (!NEXT_JS_URL || !GROUP_TASK_SECRET) {
        console.warn('[Webhook] NEXT_JS_URL/secret ausente — não consigo notificar');
        return null;
    }
    try {
        const res = await fetch(`${NEXT_JS_URL}/api/whatsapp-catalogos/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-webhook-secret': GROUP_TASK_SECRET,
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) {
            console.error(`[Webhook] /api/whatsapp-catalogos/webhook respondeu ${res.status}`);
            return null;
        }
        return await res.json();
    } catch (e) {
        console.error('[Webhook] falha:', e.message);
        return null;
    }
}

// =============================================================================
// Estado do socket
// =============================================================================
let sock = null;
let socketGeneration = 0;
let currentStatus = 'disconnected';
let currentQr = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;

function destroySocket(oldSock) {
    if (!oldSock) return;
    try { oldSock.ev.removeAllListeners(); } catch (_) { }
    try { oldSock.ws?.close(); } catch (_) { }
    try { oldSock.end(); } catch (_) { }
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
// Detecção e dedup
// =============================================================================
const processedMessageIds = new Set();
const MAX_PROCESSED = 5000;
function markProcessed(id) {
    if (!id) return;
    processedMessageIds.add(id);
    if (processedMessageIds.size > MAX_PROCESSED) {
        const first = processedMessageIds.values().next().value;
        processedMessageIds.delete(first);
    }
}

function extractDocument(msg) {
    const m = msg.message;
    if (!m) return null;
    // Pode vir direto ou embrulhado em viewOnce / ephemeral
    const doc = m.documentMessage
        || m.viewOnceMessage?.message?.documentMessage
        || m.viewOnceMessageV2?.message?.documentMessage
        || m.ephemeralMessage?.message?.documentMessage
        || m.documentWithCaptionMessage?.message?.documentMessage;
    if (!doc) return null;
    return doc;
}

function isPdf(doc) {
    const mime = doc.mimetype || '';
    const fileName = doc.fileName || '';
    if (mime.toLowerCase().includes('pdf')) return true;
    if (fileName.toLowerCase().endsWith('.pdf')) return true;
    return false;
}

async function handlePdfInGroup(msg, remoteJid, groupName) {
    const doc = extractDocument(msg);
    if (!doc || !isPdf(doc)) return;

    const messageId = msg.key.id;
    if (messageId && processedMessageIds.has(messageId)) {
        console.log(`[PDF] msg ${messageId} já processada nesta sessão`);
        return;
    }

    const fileName = doc.fileName || `catalogo-${Date.now()}.pdf`;
    const senderJid = msg.key.participant || msg.key.remoteJid || '';
    const senderName = msg.pushName || '';

    console.log(`[PDF] "${fileName}" em "${groupName || remoteJid}" (${senderName})`);

    let buffer;
    try {
        buffer = await downloadMediaMessage(
            msg,
            'buffer',
            {},
            { logger: console, reuploadRequest: sock.updateMediaMessage },
        );
    } catch (e) {
        console.error('[PDF] download falhou:', e.message);
        return;
    }

    let r2Key;
    try {
        r2Key = await uploadPdfToR2(buffer, fileName, doc.mimetype || 'application/pdf');
        console.log(`[PDF] R2 ok: ${r2Key} (${buffer.length} bytes)`);
    } catch (e) {
        console.error('[PDF] upload R2 falhou:', e.message);
        return;
    }

    const result = await notifyDetection({
        group_jid: remoteJid,
        group_name: groupName || null,
        sender_jid: senderJid,
        sender_name: senderName,
        message_id: messageId,
        file_name: fileName,
        file_mime: doc.mimetype || 'application/pdf',
        file_size: buffer.length,
        r2_key: r2Key,
    });
    if (result?.attached) {
        console.log(`[PDF] anexado automaticamente ao leilão ${result.cronograma_id}`);
    } else if (result) {
        console.log(`[PDF] não anexado (${result.match_status || 'unknown'})`);
    }
    markProcessed(messageId);
}

// =============================================================================
// Bootstrap do socket
// =============================================================================
async function startSocket() {
    if (sock) {
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
    console.log(`[WA] Iniciando conexão (gen=${myGen})...`);

    try {
        if (!cachedWAVersion) {
            try {
                const fetched = await fetchLatestBaileysVersion();
                cachedWAVersion = fetched.version;
                console.log(`[WA] Versão WA: ${cachedWAVersion.join('.')}`);
            } catch {
                cachedWAVersion = [2, 3000, 1023270955];
            }
        }

        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

        if (myGen !== socketGeneration) return;

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
                console.log(`[WA] Conexão fechada (code=${statusCode}, gen=${myGen})`);

                const old = sock;
                sock = null;
                currentQr = null;
                destroySocket(old);

                if (loggedOut) {
                    currentStatus = 'disconnected';
                    reconnectAttempts = 0;
                    try {
                        const files = fs.readdirSync(AUTH_DIR);
                        for (const f of files) fs.unlinkSync(path.join(AUTH_DIR, f));
                        console.log('[WA] Auth limpo após logout.');
                    } catch (e) {
                        console.error('[WA] erro ao limpar auth:', e.message);
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
                syncMonitoredGroups();
            }
        });

        sock.ev.on('messages.upsert', async ({ messages: msgs, type }) => {
            if (myGen !== socketGeneration) return;
            if (type !== 'notify') return;
            for (const msg of msgs) {
                if (msg.key.fromMe) continue;
                const remoteJid = msg.key.remoteJid;
                if (!remoteJid || !remoteJid.endsWith('@g.us')) continue;
                if (!monitoredJids.has(remoteJid)) continue;

                let groupName = '';
                try {
                    const meta = await sock.groupMetadata(remoteJid);
                    groupName = meta?.subject || '';
                } catch { /* ok */ }

                try {
                    await handlePdfInGroup(msg, remoteJid, groupName);
                } catch (e) {
                    console.error('[PDF] handler falhou:', e.message);
                }
            }
        });

    } catch (error) {
        console.error('[WA] erro ao iniciar:', error.message);
        if (sock) { destroySocket(sock); sock = null; }
        currentStatus = 'disconnected';
        const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), 60_000);
        reconnectAttempts = Math.min(reconnectAttempts + 1, 8);
        scheduleReconnect(Math.floor(delay));
    }
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

        if (req.method === 'GET' && url.pathname === '/groups') {
            if (currentStatus !== 'connected' || !sock) {
                res.writeHead(200);
                res.end(JSON.stringify({ groups: [], reason: 'not_connected' }));
                return;
            }
            try {
                const all = await sock.groupFetchAllParticipating();
                const list = Object.values(all).map(g => ({
                    id: g.id,
                    subject: g.subject,
                    size: g.participants?.length || 0,
                }));
                res.writeHead(200);
                res.end(JSON.stringify({ groups: list }));
                return;
            } catch (e) {
                res.writeHead(500);
                res.end(JSON.stringify({ groups: [], error: e.message }));
                return;
            }
        }

        if (req.method === 'GET' && url.pathname === '/config') {
            res.writeHead(200);
            res.end(JSON.stringify({
                monitored: Array.from(monitoredJids),
                last_sync: lastSync,
                last_sync_error: lastSyncError,
                next_js_url: NEXT_JS_URL,
                processed_count: processedMessageIds.size,
            }));
            return;
        }

        if (req.method === 'POST' && url.pathname === '/reload') {
            await syncMonitoredGroups();
            res.writeHead(200);
            res.end(JSON.stringify({ ok: true, monitored: Array.from(monitoredJids) }));
            return;
        }

        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    } catch (error) {
        console.error('[HTTP] erro:', error.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
    }
}

// =============================================================================
// Bootstrap
// =============================================================================
async function main() {
    console.log('[WA-Catalogs] Carregando Baileys...');
    console.log(`[WA-Catalogs] Auth dir: ${AUTH_DIR}`);
    console.log(`[WA-Catalogs] Auth files: ${fs.readdirSync(AUTH_DIR).length}`);

    const baileys = await import('@whiskeysockets/baileys');
    makeWASocket = baileys.default;
    DisconnectReason = baileys.DisconnectReason;
    useMultiFileAuthState = baileys.useMultiFileAuthState;
    fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
    downloadMediaMessage = baileys.downloadMediaMessage;

    await syncMonitoredGroups();
    await startSocket();

    const server = http.createServer(handleRequest);
    server.listen(PORT, () => {
        console.log(`[WA-Catalogs] HTTP na porta ${PORT}`);
    });

    const shutdown = () => {
        console.log('[WA-Catalogs] Encerrando...');
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        if (sock) { destroySocket(sock); sock = null; }
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 5000);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

main().catch(err => {
    console.error('[WA-Catalogs] Erro fatal:', err);
    process.exit(1);
});
