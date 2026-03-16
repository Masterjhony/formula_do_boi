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
// Inicializar/Reconectar o Baileys
// =============================================================================
async function startSocket() {
  if (sock) return; // já iniciado

  currentStatus = 'connecting';
  currentQr = null;
  console.log('[WhatsApp Server] Iniciando conexão Baileys...');

  try {
    const { version } = await fetchLatestBaileysVersion();
    console.log(`[WhatsApp Server] Usando WA v${version.join('.')}`);

    const { state, saveCreds } = await useSupabaseAuthState();

    const pino = (await import('pino')).default;

    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: true,   // Mostra QR no terminal (e no Docker logs)
      auth: state,
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

        if (loggedOut) {
          console.log('[WhatsApp Server] Deslogado do WhatsApp. Limpando sessão...');
          // Apaga as credenciais para forçar novo QR
          supabase.from('whatsapp_auth').delete().neq('id', '').then(() => {
            console.log('[WhatsApp Server] Sessão limpa. Reconectando para novo QR...');
          });
        } else {
          console.log(`[WhatsApp Server] Conexão fechada (código ${statusCode}). Reconectando em 5s...`);
        }

        sock = null;
        currentStatus = 'disconnected';
        currentQr = null;

        // Reconecta automaticamente após 5 segundos
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(startSocket, 5000);
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
// Enviar mensagem de boas-vindas
// =============================================================================
async function sendWelcomeMessage(phone, name) {
  if (currentStatus !== 'connected' || !sock) {
    throw new Error(`WhatsApp não está conectado. Status atual: ${currentStatus}`);
  }

  const formattedPhone = formatBRNumber(phone);
  if (!formattedPhone) {
    throw new Error(`Número inválido: ${phone}`);
  }

  const messageText = `Olá ${name}! Seja bem vindo(a)! 🎉\n\nGostaríamos de te apresentar a *Fórmula do Boi*!\n\nAcesse nosso Marketplace e confira nossas ofertas exclusivas clicando no link abaixo:\n👉 https://app.formuladoboi.com`;

  // Verifica se o número existe no WhatsApp
  const result = await sock.onWhatsApp(formattedPhone);
  if (!result || result.length === 0 || !result[0].exists) {
    console.log(`[WhatsApp Server] Número ${formattedPhone} não encontrado no WhatsApp.`);
    return { sent: false, reason: 'not_on_whatsapp' };
  }

  await sock.sendMessage(formattedPhone, { text: messageText });
  console.log(`[WhatsApp Server] ✉️  Mensagem enviada para ${formattedPhone} (${name})`);
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

  // POST /send
  if (req.method === 'POST' && url.pathname === '/send') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { phone, name } = JSON.parse(body);
        if (!phone || !name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'phone e name são obrigatórios' }));
          return;
        }
        const result = await sendWelcomeMessage(phone, name);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, ...result }));
      } catch (error) {
        console.error('[WhatsApp Server] Erro ao enviar:', error.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      }
    });
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
