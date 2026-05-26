# Catálogos WhatsApp (segunda sessão Baileys)

Sessão independente da Central, no MESMO VPS mas em container separado. Captura PDFs de catálogo postados em grupos selecionados e anexa automaticamente ao leilão correspondente em `cronograma_leiloes`.

> Página admin: `/web-admin/catalogos-whatsapp`. APIs em [api-routes.md](./api-routes.md#catálogos-whatsapp-segunda-sessão).

## Topologia no VPS (não confunda com a Central)

| Recurso          | Central                          | Catálogos                                  |
|------------------|----------------------------------|--------------------------------------------|
| Container        | `formula_boi_whatsapp`           | `formula_boi_whatsapp_catalogs`            |
| Porta host       | 3001                             | 3002                                       |
| Auth folder      | `/opt/whatsapp-auth`             | `/opt/whatsapp-catalogs-auth`              |
| Código no VPS    | `/opt/whatsapp-server`           | `/opt/whatsapp-catalogs-server`            |
| Imagem           | `formula_boi_whatsapp_img`       | `formula_boi_whatsapp_catalogs_img`        |
| Número WhatsApp  | Sócio (comercial)                | Número dedicado (operacional)              |
| URL no Next.js   | `WHATSAPP_SERVER_URL`            | `WHATSAPP_CATALOGS_SERVER_URL` (default `http://localhost:3002`) |

## Fluxo de detecção (VPS → Next.js)

1. `messages.upsert` em grupo `@g.us` cujo JID está em `monitoredJids` (sincronizado a cada 5 min via `GET /api/whatsapp-catalogos/active-groups`).
2. Filtra: `documentMessage` com mime `application/pdf` OU extensão `.pdf`.
3. `downloadMediaMessage` → buffer.
4. PUT no R2 sob `libmedia/catalogos-whatsapp/yyyy/mm/<uuid>_<file>.pdf`.
5. `POST /api/whatsapp-catalogos/webhook` com `{group_jid, group_name, sender_*, message_id, file_*, r2_key}`.

## Decisão de auto-anexo

Implementação em [src/lib/whatsapp-catalogs.ts](../src/lib/whatsapp-catalogs.ts):

- Token-set similarity (normaliza acentos, remove stopwords, ignora ano).
- Candidatos restritos à janela `[hoje-7d, hoje+90d]` em `cronograma_leiloes`.
- Auto-anexo só se: `melhor_score >= 70` E `gap pro 2º >= 20` E leilão sem `catalogo_url` E flag global `whatsapp_catalogs_paused.paused = false`.
- Senão registra como `pending` / `ambiguous` / `no_match` em `whatsapp_catalog_detections`.

## Tabelas

- `whatsapp_catalog_groups` — JID, nome, slug, ativo (lido pelo VPS).
- `whatsapp_catalog_detections` — log de cada PDF + candidatos + status (`pending|matched|ambiguous|no_match|attached|manual`) + R2 key.
- `cronograma_leiloes` ganhou `catalogo_url`, `catalogo_anexado_em`, `catalogo_origem`.
- `site_settings.whatsapp_catalogs_paused` — pausa global do auto-anexo (`{paused, paused_at, paused_by}`).

Migration única: [database/whatsapp_catalogs.sql](../database/whatsapp_catalogs.sql).

## Página admin

[src/app/web-admin/(dashboard)/catalogos-whatsapp/page.tsx](../src/app/web-admin/(dashboard)/catalogos-whatsapp/page.tsx) tem 3 abas (deep-link via `?tab=`):

- **Detecções** (default, sem `?tab`) — lista todas as detecções, filtros por status, busca, modal de revisão com candidatos top-5 e busca manual em `cronograma_leiloes` pra anexo forçado.
- **Grupos monitorados** — CRUD de `whatsapp_catalog_groups`. Por **privacidade**, a UI nunca lista os grupos que o número da sessão participa (o número é pessoal do dono). Para descobrir o JID de um grupo novo, fazer `curl http://localhost:3002/groups` direto no VPS via SSH; nenhum endpoint público expõe essa lista.
- **Conexão** — status, QR code (proxy do VPS:3002/status) e toggle de pausa global.

## Deploy / operação

- Script idempotente: `python scripts/deploy-whatsapp-catalogs-server.py` (lê `VPS_PASSWORD`, `NEXT_JS_URL`, `WHATSAPP_GROUP_TASK_SECRET`, `R2_*` do ambiente). Faz upload via SFTP, escreve `.env` no VPS com `chmod 600`, build da imagem e `docker run` sem nunca tocar no container Central.
- `docker compose --env-file .env.local up -d --build` localmente sobe os DOIS containers (Central e Catálogos).
- Para iniciar pareamento do novo número: container roda → aba **Conexão** mostra QR → escanear pelo número operacional. Auth persiste no volume `/opt/whatsapp-catalogs-auth`.
