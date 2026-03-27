# WhatsApp Server

Servidor dedicado para automacao de mensagens WhatsApp via [Baileys](https://github.com/WhiskeySockets/Baileys). Roda separado do Next.js em uma VPS DigitalOcean para manter a conexao WebSocket permanente.

## Arquitetura

```
┌──────────────────────┐       ┌──────────────────────────────┐
│   Vercel (Next.js)   │       │   VPS DigitalOcean           │
│                      │       │   165.232.142.37              │
│  /api/whatsapp/      │──────>│                              │
│    status (GET)      │ HTTP  │   Docker: formula_boi_       │
│                      │       │           whatsapp            │
│  /api/webhook/       │──────>│                              │
│    crm-lead (POST)   │       │   whatsapp-server.js :3001   │
│                      │       │                              │
│  /api/webhooks/      │──────>│   Auth: /opt/whatsapp-auth/  │
│    google-sheets     │       │         (Docker volume)      │
│                      │       │                              │
│  src/lib/whatsapp.ts │       │   Baileys WebSocket ────────>│ WhatsApp
│  (proxy HTTP puro)   │       │                              │
└──────────────────────┘       └──────────────────────────────┘
```

### Fluxo de uma mensagem

1. Lead entra via webhook (Google Sheets ou Supabase)
2. API route do Next.js chama `sendWelcomeMessage()` em `src/lib/whatsapp.ts`
3. `whatsapp.ts` faz POST HTTP para `http://165.232.142.37:3001/send`
4. O whatsapp-server enfileira a mensagem (4s entre envios)
5. Quando chegar a vez, verifica se o numero esta no WhatsApp e envia

## Endpoints

| Metodo | Path           | Descricao                                                  |
|--------|----------------|------------------------------------------------------------|
| GET    | /status        | Retorna `{status, qr}` — status da conexao                |
| POST   | /send          | Enfileira mensagem. Body: `{phone, name}`                  |
| GET    | /queue         | Retorna tamanho da fila e status de processamento          |
| GET    | /config        | Retorna config do fluxo em memória + contagem de pendentes |
| POST   | /reload-config | Força recarga da config do Supabase                        |

### Status possiveis

- `disconnected` — Sem conexao
- `connecting` — Tentando conectar/reconectar
- `qr` — QR code gerado, aguardando scan
- `connected` — Conectado e pronto para enviar

## Auth State (Persistencia)

A sessao do Baileys e persistida em **arquivos locais** via `useMultiFileAuthState`, montados como Docker volume:

```
Host:      /opt/whatsapp-auth/    (persiste entre restarts)
Container: /data/auth/
```

> **IMPORTANTE:** Nunca usar banco de dados (Supabase, etc.) para auth state do Baileys. A troca de chaves criptograficas precisa de microssegundos de latencia. Qualquer latencia de rede causa erro 440 (conflict:replaced) e desconexao sistematica.

## Deploy / Operacao

### Primeiro deploy

```bash
# Na VPS
mkdir -p /opt/whatsapp-server /opt/whatsapp-auth

# Copiar arquivos (ou fazer git clone)
scp whatsapp-server.js Dockerfile package.json root@165.232.142.37:/opt/whatsapp-server/

# Build da imagem
cd /opt/whatsapp-server
docker build -t formula_boi_whatsapp_img .

# Criar e iniciar container
docker run -d \
  --name formula_boi_whatsapp \
  --restart unless-stopped \
  -p 3001:3001 \
  -v /opt/whatsapp-auth:/data/auth \
  --env-file /opt/whatsapp-server/.env \
  formula_boi_whatsapp_img

# Escanear QR em admin.formuladoboi.com/whatsapp
```

### Atualizar codigo

```bash
# Copiar novo whatsapp-server.js para a VPS
scp whatsapp-server.js root@165.232.142.37:/opt/whatsapp-server/

# Na VPS: rebuild e restart
cd /opt/whatsapp-server
docker build -t formula_boi_whatsapp_img .
docker stop formula_boi_whatsapp && docker rm formula_boi_whatsapp
docker run -d \
  --name formula_boi_whatsapp \
  --restart unless-stopped \
  -p 3001:3001 \
  -v /opt/whatsapp-auth:/data/auth \
  --env-file /opt/whatsapp-server/.env \
  formula_boi_whatsapp_img
```

> A sessao e preservada no volume — nao precisa escanear QR novamente.

### Forcar novo QR (resetar sessao)

```bash
docker stop formula_boi_whatsapp
rm -rf /opt/whatsapp-auth/*
docker start formula_boi_whatsapp
# Escanear novo QR em admin.formuladoboi.com/whatsapp
```

### Logs e diagnostico

```bash
docker logs formula_boi_whatsapp --tail 50     # ultimos 50 logs
docker logs -f formula_boi_whatsapp             # logs em tempo real
curl http://165.232.142.37:3001/status          # status da conexao
curl http://165.232.142.37:3001/queue           # fila de envio
```

## Gestao de conexao

O servidor implementa reconexao automatica com as seguintes garantias:

- **`destroySocket()`** — Antes de qualquer reconexao, o WebSocket antigo e completamente destruido (`ev.removeAllListeners()`, `ws.close()`, `end()`). Isso evita sockets orfaos que causam erro 440.
- **`socketGeneration`** — Contador que invalida event handlers de sockets antigos, impedindo que fantasmas disparem reconexoes.
- **Backoff exponencial** — Delays de 5s, 10s, 20s, 40s, ate 60s entre tentativas de reconexao.
- **`--restart unless-stopped`** — Docker reinicia o container automaticamente em caso de crash.

## Comando de grupo: /tarefa

Membros de grupos WhatsApp conectados ao bot podem criar cards no Kanban tático digitando:

```
/tarefa <descrição da tarefa>
```

O servidor detecta o prefixo em mensagens de grupo (`@g.us`), chama `POST $NEXT_JS_URL/api/whatsapp/group-task` com o header `x-webhook-secret`, e responde no grupo confirmando a criação (ou reportando erro). Mensagens do próprio número do bot (`fromMe = true`) são ignoradas.

## Variaveis de ambiente

| Variavel                    | Default    | Descricao                                              |
|-----------------------------|------------|--------------------------------------------------------|
| WHATSAPP_SERVER_PORT        | 3001       | Porta HTTP do servidor                                 |
| AUTH_DIR                    | /data/auth | Diretorio dos arquivos de sessao                       |
| NEXT_PUBLIC_SUPABASE_URL    | —          | URL do Supabase (para carregar flow config)            |
| SUPABASE_SERVICE_ROLE_KEY   | —          | Chave service role do Supabase                         |
| NEXT_JS_URL                 | —          | URL base do Next.js (ex: https://admin.formuladoboi.com) |
| WHATSAPP_GROUP_TASK_SECRET  | —          | Segredo compartilhado com `/api/whatsapp/group-task`   |

## Vercel (Next.js)

O Next.js **nao** roda Baileys — apenas faz proxy HTTP para a VPS:

- `WHATSAPP_SERVER_URL=http://165.232.142.37:3001` (env var na Vercel)
- `src/lib/whatsapp.ts` — Proxy HTTP puro, zero imports de Baileys
- `@whiskeysockets/baileys` **nao** esta no package.json do Next.js

## Problemas conhecidos e solucoes

| Problema | Causa | Solucao |
|----------|-------|---------|
| Loop 440 (connect/disconnect) | Auth state via banco de dados (latencia) | Usar `useMultiFileAuthState` local |
| Deploy Vercel falhando | Baileys no package.json do Next.js | Manter Baileys apenas no whatsapp-server |
| Sockets fantasma | `sock = null` sem fechar WebSocket | Sempre usar `destroySocket()` |
| QR nao aparece | Sessao antiga corrompida | Limpar `/opt/whatsapp-auth/*` e reiniciar |
| /tarefa retorna 401 | `WHATSAPP_GROUP_TASK_SECRET` não carregado | Garantir `--env-file` no `docker run`; verificar comprimento (deve ser 64 chars — CLI do Vercel pode adicionar `\n`) |
| Bot nao responde a /tarefa | Mensagem enviada pelo proprio numero do bot | `fromMe = true` é ignorado por design |
| Bot nao responde a /tarefa | Container sem `NEXT_JS_URL` ou `WHATSAPP_GROUP_TASK_SECRET` | Checar `/opt/whatsapp-server/.env` e recriar container com `--env-file` |
