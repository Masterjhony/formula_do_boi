# WhatsApp Catalogs Server

Segunda sessão Baileys rodando no MESMO VPS da Central, mas em container e
porta separados (3002), com auth folder próprio e número de WhatsApp dedicado.

Responsabilidade única: monitorar grupos configurados em
`whatsapp_catalog_groups` (lidos do Next.js periodicamente), capturar anexos
PDF, subir ao R2 e chamar o webhook `/api/whatsapp-catalogos/webhook` com os
metadados — o Next.js decide se anexa ao cronograma.

## Variáveis de ambiente

```
WHATSAPP_CATALOGS_SERVER_PORT=3002
AUTH_DIR=/data/auth                          # mapeado para /opt/whatsapp-catalogs-auth
NEXT_JS_URL=https://admin.formuladoboi.com
WHATSAPP_GROUP_TASK_SECRET=<mesmo secret da Central>

# R2 (mesma conta da biblioteca de mídia)
R2_ACCOUNT_ID=...
R2_BUCKET=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_PREFIX=libmedia/                          # objetos vão sob libmedia/catalogos-whatsapp/

# Cadência
POLL_GROUPS_EVERY_MS=300000                  # 5 min
```

## Como rodar localmente

```bash
cd whatsapp-catalogs-server
npm install
WHATSAPP_CATALOGS_SERVER_PORT=3002 \
NEXT_JS_URL=http://localhost:3000 \
WHATSAPP_GROUP_TASK_SECRET=dev \
node whatsapp-catalogs-server.js
```

## Endpoints HTTP

| Endpoint  | Método | Função |
|-----------|--------|--------|
| `/status` | GET    | `{status, qr}` (QR data URL quando em pareamento) |
| `/groups` | GET    | Lista todos os grupos visíveis pelo número (jid + subject) |
| `/config` | GET    | Grupos atualmente sendo monitorados + última sincronização |
| `/reload` | POST   | Força refetch dos grupos ativos do Next.js |
