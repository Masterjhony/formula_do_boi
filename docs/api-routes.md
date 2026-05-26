# Rotas API

Inventário das rotas em `src/app/api/`. Para detalhes operacionais de cada subsistema, ver os docs específicos em [docs/](./README.md).

## Auth & Users (admin)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/admin/auth/send-code` | POST | Gera código de 6 dígitos, grava SHA-256 em `signup_verification_codes`, envia por SMTP. Throttle 1/min/email. |
| `/api/admin/auth/verify-signup` | POST | Valida código (max 5 tentativas, 10min TTL) e cria usuário via `auth.admin.createUser` com `role='user'`. Promoção a admin segue manual via `/users`. |
| `/api/admin/users/[id]` | DELETE | Admin-only. Recusa auto-deleção. |
| `/api/admin/users/[id]/reset-password` | POST | Admin-only. |
| `/api/admin/backfill-utm-sheet` | POST | Manutenção one-shot: garante headers UTM (cols L..R) no Sheet `Pag-zap` e backfila linhas sem atribuição. |

## Lead Capture & Webhooks

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/lp/lead` | POST | LP form público; insere `crm_leads` (com UTM defaults), appenda Google Sheets `Pag-zap`, dispara welcome WhatsApp. |
| `/api/webhooks/google-sheets` | POST, GET | Recebe leads do Google Sheets (valida `x-webhook-secret`); insere `crm_leads`, dispara WhatsApp. |
| `/api/webhook/crm-lead` | POST | Webhook legacy; envia welcome via [src/lib/whatsapp.ts](../src/lib/whatsapp.ts). |

## WhatsApp

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/whatsapp/status` | GET | Proxy do VPS `/status` — `{status, qr}`. |
| `/api/whatsapp/messages` | GET | Últimas 50 + total do dia + conversas de `whatsapp_messages`. |
| `/api/whatsapp/flow` | GET, PUT | Legado. Central usa `whatsapp_templates` (slug `welcome-default`) como fonte do welcome. |
| `/api/whatsapp/inbound` | POST | **Central WhatsApp** — VPS encaminha toda inbound individual. Classifica intenção, atualiza `crm_leads`, loga `whatsapp_messages`, devolve `{reply, bot_step}` ou `{silent: true}`. |
| `/api/whatsapp/render-welcome` | POST | Renderiza template `welcome-default` para o VPS; respeita opt-out. |
| `/api/whatsapp/campaign-callback` | POST | Callback do VPS por destinatário — atualiza `whatsapp_campaign_recipients`. |
| `/api/whatsapp/central/inbox` | GET | Lista conversas (uma por número) com filtros `todos\|aguardando\|handoff\|optout\|interesse`. |
| `/api/whatsapp/central/thread/[phone]` | GET, POST | Histórico + lead vinculado / envio manual (bloqueado se opt-out). |
| `/api/whatsapp/central/lead-action` | POST | Ações rápidas no lead (`handoff_on/off`, `optout_on/off`, `set_interesse`). |
| `/api/whatsapp/central/templates` | GET, POST | CRUD da biblioteca de templates. |
| `/api/whatsapp/central/templates/[id]` | PUT, DELETE | Atualiza ou arquiva template. |
| `/api/whatsapp/central/campaigns` | GET, POST | Lista (com contadores agregados: `steps_count`, `replied_count`, `stopped_count`) e cria campanhas em rascunho. |
| `/api/whatsapp/central/campaigns/[id]` | GET, PUT, DELETE | Detalhe + recipients + steps. PUT edita rascunho. DELETE só em rascunho. |
| `/api/whatsapp/central/campaigns/[id]/steps` | GET, POST | Lista/cria passos (1+) da sequência. Só em rascunho. |
| `/api/whatsapp/central/campaigns/[id]/steps/[stepId]` | PUT, DELETE | Edita ou remove passo. Só em rascunho. |
| `/api/whatsapp/central/campaigns/[id]/send` | POST | Resolve segmento → materializa `whatsapp_campaign_recipients` → POST `/campaign-send` no VPS pro passo 0. |
| `/api/whatsapp/central/campaigns/cron` | GET | Cron externo (1-5min). Processa recipients com `next_send_at <= now()`. Auth via `x-webhook-secret`. Hobby Vercel não permite cron sub-diário — usar GitHub Actions / cron-job.org. |
| `/api/whatsapp/central/campaigns/preview` | POST | Pré-visualiza público (count + amostra) sem materializar. |
| `/api/whatsapp/central/metrics` | GET | Métricas operacionais (novos contatos 7d, opt-outs, distribuição de interesse). |
| `/api/whatsapp/central/flow` | GET, PUT, DELETE | **Legado**. Opera sobre fluxo ATIVO em `whatsapp_flows`. UIs novas devem usar `/flows`. |
| `/api/whatsapp/central/flows` | GET, POST | Lista fluxos nomeados (com `settings`, `last_activated_at`, `created_by`) / cria novo (com `clone_from` opcional). |
| `/api/whatsapp/central/flows/[id]` | GET, PUT, DELETE | Detalhe + grafo + settings / edita / deleta. PUT valida via `validateGraph()`. GET auto-cura grafo vazio com `buildDefaultGraph()`. Bloqueia delete do ativo e do último. |
| `/api/whatsapp/central/flows/[id]/activate` | POST | Torna esse fluxo o único ativo + grava `last_activated_at`. Valida grafo antes. |
| `/api/whatsapp/group-task` | POST | `/tarefa <desc>` do grupo → cria `tactical_tasks`. |
| `/api/whatsapp/group-decision` | POST | `/decisao <desc>` → `tactical_decisions`. |
| `/api/whatsapp/group-risk` | POST | `/risco <título>` → `tactical_risks` (default `media`/`medio`). |
| `/api/whatsapp/group-ai` | POST | `/ia <pergunta>` → GLM-4.7 com tool-calling contra 8-table allow-list; resposta empurrada de volta pelo VPS. |

Os quatro endpoints de grupo validam `x-webhook-secret: WHATSAPP_GROUP_TASK_SECRET` e chamam `revalidatePath('/web-admin/projetos')` onde aplicável.

## Catálogos WhatsApp (segunda sessão)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/whatsapp-catalogos/status` | GET | Proxy `GET ${WHATSAPP_CATALOGS_SERVER_URL}/status` |
| `/api/whatsapp-catalogos/active-groups` | GET | Lido pelo VPS (header `x-webhook-secret`) — JIDs ativos a monitorar |
| `/api/whatsapp-catalogos/webhook` | POST | VPS → Next.js: PDF detectado. Decide auto-anexar ou registrar pendente |
| `/api/whatsapp-catalogos/groups` | GET, POST | CRUD `whatsapp_catalog_groups` |
| `/api/whatsapp-catalogos/groups/[id]` | PUT, DELETE | Editar/remover grupo |
| `/api/whatsapp-catalogos/detections` | GET | Lista detecções (filtros: status, group_jid, q, limit/offset) |
| `/api/whatsapp-catalogos/detections/[id]` | GET, DELETE | Detalhe (com `file_url` presigned) e remoção |
| `/api/whatsapp-catalogos/detections/[id]/attach` | POST | Anexo manual `{cronograma_id, overwrite?}` |
| `/api/whatsapp-catalogos/cronograma-search` | GET | `?q=` — busca leilões pro modal de anexo manual |
| `/api/whatsapp-catalogos/pause` | GET, PUT | Toggle `whatsapp_catalogs_paused` |

## AI

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/ai/chat` | POST | GLM-4.7 chat usado por `/web-admin/ia` (tool-calling, 8-table allow-list). |
| `/api/ai/test` | GET | Smoke-test. |

## Cloudflare R2 (media library)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/r2/upload-url` | POST | Presigned PUT pra upload direto do browser. |
| `/api/r2/download-url` | GET | Presigned GET autenticado. |
| `/api/r2/list` | GET | Lista objetos com prefix filter. |
| `/api/r2/delete` | POST | Deleta objetos. |

## PDF Parsing (admin)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/parse-genealogy` | POST | PDF → `products.genealogia_json`. |
| `/api/parse-genealogy/batch` | GET, POST | Batch (`dryRun`, `onlyMissing`). |
| `/api/parse-avaliacao-genetica` | POST | PDF → `products.avaliacao_genetica_json`. |
| `/api/parse-avaliacao-genetica/batch` | GET, POST | Batch. |

## Search

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/search` | GET | Spotlight across `crm_leads`, `products`, `bula_leiloes`, `bula_leilao_fechamento`, `tactical_tasks`, `breeders`. Min 2 chars, 5 hits/tipo. |

## Bula (adminbula.*)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/bula/auth/signin` | POST | Sign-in via Supabase Auth. |
| `/api/bula/auth/signup` | POST | Signup. |
| `/api/bula/membros` | GET | Members. |
| `/api/bula/leiloes` | GET | Auctions. |
| `/api/bula/leiloes/[id]` | GET | Auction detail. |
| `/api/bula/leiloes/upload` | POST | Upload de dados. |
| `/api/bula/crm/funis` | GET | Funnels. |
| `/api/bula/crm/deals` | POST | Cria deal. |
| `/api/bula/crm/deals/[id]` | PUT | Atualiza deal. |
| `/api/bula/leads` | GET | Leads. |
| `/api/bula/leads/[id]` | PATCH | Atualiza lead. |
| `/api/bula/projetos/cards` | GET | Kanban cards. |
| `/api/bula/projetos/cards/[id]` | PUT | Atualiza card. |
| `/api/bula/cronograma` | GET | Cronograma. |
| `/api/bula/cronograma/[id]` | PUT | Atualiza cronograma. |
| `/api/bula/fechamento` | GET | Fechamentos. |
| `/api/bula/fechamento/[id]` | GET | Detalhe. |
| `/api/bula/marketing/config` | GET | Config marketing. |

## Payments

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/asaas-webhook` | POST, GET | Asaas validation webhook — auto-aprova `TRANSFER.CREATED`. |
| `/api/asaas-pix-test` | POST | Sandbox helper. |
| `/api/checkout-semen` | POST | Checkout público — appenda Sheets `Checkout-Semen`. |

## ClickSign

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/clicksign/send` | POST | Admin-only. `{contractId, signers[], deadlineAt?, message?, sequenceEnabled?}`. Baixa PDF de `tactical_contracts.file_url`, sobe pro ClickSign, persiste `clicksign_*`. |
| `/api/clicksign/sync/[contractId]` | POST | Admin-only. Busca documento e atualiza status/signatários/PDF assinado. |
| `/api/clicksign/cancel/[contractId]` | POST | Admin-only. Cancela documento e marca contrato como `Cancelado`. |
| `/api/clicksign/webhook` | POST, GET | Eventos do ClickSign. Valida `Content-Hmac: sha256=<hex>` se `CLICKSIGN_HMAC_SECRET` setado. |

## Central de E-mail

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/email/central/templates` | GET, POST | CRUD. POST gera `slug` do título se ausente. |
| `/api/email/central/templates/[id]` | PUT, DELETE | DELETE = soft delete via `archived=true`. |
| `/api/email/central/campaigns` | GET, POST | Lista (com contadores agregados) e cria rascunho. |
| `/api/email/central/campaigns/[id]` | GET, PUT, DELETE | Detalhe + recipients + steps. PUT/DELETE só em rascunho. |
| `/api/email/central/campaigns/[id]/steps` | GET, POST | Lista/cria passos. Só em rascunho. |
| `/api/email/central/campaigns/[id]/steps/[stepId]` | PUT, DELETE | Edita/remove passo. Só em rascunho. |
| `/api/email/central/campaigns/[id]/send` | POST | Resolve segmento → materializa → envia passo 0 sequencialmente (throttle 800ms). |
| `/api/email/central/campaigns/preview` | POST | Preview de público. |
| `/api/email/central/campaigns/cron` | GET | Cron externo. Lotes de 30. Auth via `Authorization: Bearer ${CRON_SECRET}` OU `x-webhook-secret: ${WHATSAPP_GROUP_TASK_SECRET}`. |
| `/api/email/central/metrics` | GET | Totais + taxa de entrega 7d. |
| `/api/email/unsubscribe` | GET | **Público.** `?email=...&token=...` (HMAC SHA-256 com `WHATSAPP_GROUP_TASK_SECRET`). |

## Agendamentos

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/agendamentos` | GET, POST | Lista (filtros: status, source, lead_id, q, from/to, limit/offset) e cria manual. |
| `/api/agendamentos/[id]` | PATCH, DELETE | Atualiza status/lead/responsável/notas/tags. DELETE local — Google reenvia no próximo sync se ainda existir. |
| `/api/agendamentos/sync` | GET (cron), POST (admin) | Puxa Google Calendar e materializa em `agendamentos`. GET aceita `Authorization: Bearer ${CRON_SECRET}` OU `x-webhook-secret: ${WHATSAPP_GROUP_TASK_SECRET}`. |
| `/api/agendamentos/settings` | GET, PUT | CRUD `site_settings.agendamentos_calendar`. GET também devolve `service_account_email` e `google_configured`. |

## External proxy

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/leilao/[...path]` | GET, POST, … | Catch-all proxy pra `LEILAO_SERVER_URL/api/<path>` (10s timeout, no-store). |
