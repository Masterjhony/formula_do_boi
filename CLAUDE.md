# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured. `playwright` is in devDependencies but no test runner script is wired up.

## Architecture Overview

**Fórmula do Boi** is a livestock genetics platform for Nelore PO (Puro de Origem) cattle. The app is a single Next.js 16 (App Router) deployment that serves five distinct interfaces, multiplexed by subdomain in [src/middleware.ts](src/middleware.ts):

| Subdomain | Route prefix | Purpose |
|-----------|-------------|---------|
| Root domain (`formuladoboi.com`, `www.*`) and `lp.*` | `/web-lp` | Landing page (lead capture, "Pag-zap" funnel) |
| `admin.*` | `/web-admin` | CRM, products, analytics, WhatsApp, tactical plan, OKRs |
| `erp.*` | `/web-erp` | Internal ERP (financeiro, contábil, estoque, leilões) |
| `adminbula.*` | `/web-bula` | Bula auction platform (CRM, fechamentos, cronograma) |
| Anything else (e.g. `app.*` legacy) | `/web-site` | Public marketplace (touros, matrizes, embriões, sêmen) |

`/admin` and `/erp` paths on the marketplace subdomain are 302-redirected to `admin.*` / `erp.*`. API routes (`/api/*`) bypass the rewrite. The middleware also calls `updateSession()` from [src/utils/supabase/middleware.ts](src/utils/supabase/middleware.ts) to refresh Supabase auth cookies.

### Core Services

- **Next.js 16.1.4 / React 19.2.3 (Vercel)** — App Router, deployed automatically on `git push` to `main`. Never run `vercel --prod` manually.
- **Supabase** (`@supabase/supabase-js` 2.99 + `@supabase/ssr` 0.8) — PostgreSQL with RLS, used for all data persistence and auth. Three client variants: [src/utils/supabase/server.ts](src/utils/supabase/server.ts) (server components), [src/utils/supabase/client.ts](src/utils/supabase/client.ts) (browser), [src/utils/supabase/middleware.ts](src/utils/supabase/middleware.ts) (auth refresh).
- **WhatsApp microservice** — Separate Docker container on DigitalOcean VPS (`165.232.142.37:3001`) running Baileys. Exists because Vercel serverless cannot maintain persistent WebSocket connections. Next.js proxies to it via `/api/whatsapp/*` routes.
- **Cloudflare R2** (`aws4fetch`) — S3-compatible object storage for the media library; Next.js issues presigned URLs via `/api/r2/*` so the browser uploads/downloads directly.
- **Leilão server** — Optional external Python service proxied through `/api/leilao/[...path]` (`LEILAO_SERVER_URL`, default `http://localhost:8000`).
- **GLM-4.7 (Zhipu AI)** — Called over HTTP (no SDK) at `https://open.bigmodel.cn/api/paas/v4/chat/completions`. Powers the in-app AI assistant and the WhatsApp `/ia` command via tool-calling against a fixed allow-list of Supabase tables.
- **Asaas** — Brazilian payment processor; webhook validation only (`/api/asaas-webhook`).
- **ClickSign** — Brazilian e-signature platform. Auth via `?access_token=<TOKEN>` query param. Thin client in [src/lib/clicksign.ts](src/lib/clicksign.ts) wraps `documents`, `signers`, `lists`, `notifications`. The admin contracts panel sends, polls, and cancels documents; ClickSign pings `/api/clicksign/webhook` on signature events to update `tactical_contracts`.

### Key Data Flows

**Landing-page lead capture** (`lp.formuladoboi.com`):
LP form → `POST /api/lp/lead` → applies UTM defaults → inserts into `crm_leads` → appends row to Google Sheets `Pag-zap` tab → triggers WhatsApp welcome.

**Google-Sheets webhook lead** (legacy/external integrations):
Sheet row → `POST /api/webhooks/google-sheets` (validates `x-webhook-secret`) → inserts to `crm_leads` → calls VPS `/send` → logs to `whatsapp_messages`.

**WhatsApp interactive flow**: the welcome message and numbered menu options are configured in the admin panel (`/web-admin/whatsapp`) and stored in `site_settings.whatsapp_flow`. When a lead replies with a menu option key, the VPS responds automatically (tracked in-memory with a configurable timeout).

### Database

Migrations live in [/database/](database/) (~120 files, one per change). They are run manually against Supabase — there is no migration runner. Key tables:

| Table | Purpose |
|-------|---------|
| `products` | Livestock catalog (touros, matrizes, embriões, sêmen). `details`, `genealogia_json`, `avaliacao_genetica_json` are JSONB. |
| `crm_leads` | Sales pipeline. `position` drives Kanban ordering. UTM/attribution fields (`source`, `medium`, `campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, `referrer`, `landing_url`) are populated by `/api/lp/lead`. |
| `profiles` | User roles (`admin` / `user`); references `auth.users`. |
| `breeders` | Breeder registry. |
| `whatsapp_messages` | WhatsApp send log (status, phone, lead_id FK). |
| `site_settings` | Feature flags and configuration (key/JSONB). Key `whatsapp_flow` stores the automation flow config. |
| `signup_verification_codes` | 6-digit signup codes (SHA-256 hash, expires_at, attempts). |
| `tactical_tasks` | ERP/Admin Kanban with `checklists` and `attachments` JSONB. WhatsApp-origin columns: `whatsapp_group_id`, `whatsapp_group_name`, `whatsapp_sender`, `whatsapp_sender_name`. |
| `tactical_task_attachments`, `tactical_task_comments`, `tactical_kanban_columns` | Companion tables for the Kanban. |
| `tactical_contracts` | Contract management (also stores ClickSign integration: `clicksign_document_key`, `clicksign_status`, `clicksign_signers` JSONB, `clicksign_signed_url`, etc — migration `database/add_clicksign_to_tactical_contracts.sql`). |
| `tactical_members` | Team registry for the tactical plan. |
| `tactical_objectives`, `tactical_key_results`, `tactical_task_kr_links` | OKR layer (`/web-admin/okr`). |
| `tactical_risks` | Risk register; populated by the WhatsApp `/risco` command. |
| `tactical_decisions` | Decision log; populated by the WhatsApp `/decisao` command. |
| `strategic_flows`, `strategic_stages` | Strategic-plan layer above the tactical Kanban. |
| `cronograma_leiloes` | Auction schedule (admin/site). |
| `erp_finance_accounts`, `erp_finance_categories`, `erp_finance_transactions` | ERP financeiro module. |
| `erp_accounting_accounts`, `erp_accounting_journals`, `erp_accounting_journal_lines` | ERP contábil module. |
| `erp_inventory_warehouses`, `erp_inventory_products`, `erp_inventory_stock`, `erp_inventory_movements` | ERP estoque module. |
| `bula_membros`, `bula_leiloes`, `bula_leilao_assessores`, `bula_leilao_fechamento` | Bula auction core. |
| `bula_projeto_cards`, `bula_card_responsaveis` | Bula project Kanban cards. |
| `bula_crm_funis`, `bula_crm_deals`, `bula_leads`, `bula_marketing_config` | Bula CRM and marketing. |

### Notable Implementation Details

- **WhatsApp flow builder**: admin can edit the welcome message (supports `{nome}` variable), define numbered menu options, and configure reply timeout — stored in `site_settings.whatsapp_flow`, applied to the VPS live via `POST /reload-config`.
- **WhatsApp group commands**: members of a connected group (`@g.us`) can run `/tarefa`, `/decisao`, `/risco`, and `/ia`. The VPS detects the prefix in `messages.upsert` (ignoring `fromMe`), POSTs to the corresponding Next.js endpoint with `x-webhook-secret`, and replies in the group on success/failure. See [WhatsApp Group Commands](#whatsapp-group-commands) below.
- **AI assistant (GLM-4.7)**: same model is shared by the in-app `/web-admin/ia` page (`/api/ai/chat`) and the WhatsApp `/ia` command (`/api/whatsapp/group-ai`). Both use tool-calling against an 8-table allow-list (`products`, `crm_leads`, `profiles`, `tactical_tasks`, `tactical_contracts`, `whatsapp_messages`, `site_settings`, `breeders`).
- **Genealogy / Genetic Evaluation parsing**: [src/lib/genealogy-parser.ts](src/lib/genealogy-parser.ts) and [src/lib/avaliacao-genetica-parser.ts](src/lib/avaliacao-genetica-parser.ts) parse PDFs via `pdf-parse` and back the batch endpoints under `/api/parse-*`.
- **CRM Kanban**: built with `@dnd-kit` — drag updates the `position` field in Supabase in real time.
- **Global search**: `/api/search?q=...` returns categorized hits (`lead`, `product`, `leilao`, `fechamento`, `task`, `breeder`) for the spotlight UI in [src/components/admin/GlobalSearch.tsx](src/components/admin/GlobalSearch.tsx).
- **Analytics**: GA4 data pulled via `@google-analytics/data` using a service account; configured with `GOOGLE_SERVICE_ACCOUNT_JSON` and `GOOGLE_GA4_PROPERTY_ID` (fallback `483341191`).
- **Media library**: stored on Cloudflare R2 with prefix `R2_PREFIX` (default `libmedia/`). Browser uploads via presigned PUT issued by `/api/r2/upload-url`; downloads via presigned GET from `/api/r2/download-url`.
- **Bula sistema**: `/web-bula/sistema` and `/web-bula/login.html` are static HTML SPAs served via tiny `route.ts` handlers that stream the file. They consume the `/api/bula/*` JSON endpoints.
- **Path alias**: `@/*` maps to `./src/*`.

## Page Routes

### `/web-lp` (root domain + `lp.*`)
- `/` (landing page form)
- `/obrigado` (post-signup thank-you)

### `/web-site` (legacy/non-matching subdomains)
`agenda`, `animais`, `atacante`, `auth`, `dashboard`, `embrioes`, `login`, `lote`, `matrizes`, `parceiros`, `pix-teste`, `quem-somos`, `rankings`, `semen`, `sertanejo`, `top-criadores`, `touros`, `venda-conosco`.

### `/web-admin` (`admin.*`)
Dashboard segments under `(dashboard)`: `analytics`, `animal-availability`, `biblioteca-midia`, `breeders`, `central-bela-vista`, `contratos`, `crm`, `genealogia`, `ia`, `leads`, `leiloes`, `lotes-doadoras`, `lotes-touros`, `okr`, `products`, `settings`, `tactical-plan`, `users`, `vendas-marketing`, `whatsapp`. Auth pages live under `(auth)`. Server actions in [src/app/web-admin/actions/](src/app/web-admin/actions/).

### `/web-erp` (`erp.*`)
Main segments under `(main)`: `configuracoes`, `contabil`, `estoque`, `financeiro`, `leiloes`. Auth under `(auth)`.

### `/web-bula` (`adminbula.*`)
- `/cadastro` (signup)
- `/sistema` (single-page app served from `sistema.html`)
- `/login.html` (login SPA shell)

## API Routes

### Auth & Users (admin panel)
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/admin/auth/send-code` | POST | Generates a 6-digit code, stores SHA-256 hash in `signup_verification_codes`, sends email via SMTP. Throttled 1/min/email. |
| `/api/admin/auth/verify-signup` | POST | Validates code (max 5 attempts, 10min TTL) and creates the user via `auth.admin.createUser` with `role='user'` (admin promotion stays manual via `/users`). |
| `/api/admin/users/[id]` | DELETE | Admin-only: deletes a user (refuses self-deletion). |
| `/api/admin/users/[id]/reset-password` | POST | Admin-only: resets a user's password. |
| `/api/admin/backfill-utm-sheet` | POST | One-shot maintenance: ensures UTM headers (cols L..R) on the `Pag-zap` Sheet and backfills missing rows with default attribution. |

### Lead Capture & Webhooks
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/lp/lead` | POST | Public LP form submission; inserts to `crm_leads` (with UTM/attribution defaults), appends to Google Sheets `Pag-zap`, triggers WhatsApp welcome. |
| `/api/webhooks/google-sheets` | POST, GET | Receives leads from Google Sheets (validates `x-webhook-secret`); inserts to `crm_leads`, triggers WhatsApp send. |
| `/api/webhook/crm-lead` | POST | Legacy webhook; sends welcome WhatsApp via [src/lib/whatsapp.ts](src/lib/whatsapp.ts). |

### WhatsApp
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/whatsapp/status` | GET | Proxies VPS `/status` — returns `{status, qr}`. |
| `/api/whatsapp/messages` | GET | Last 50 messages + today's count + conversations from `whatsapp_messages`. |
| `/api/whatsapp/flow` | GET, PUT | Reads/saves WhatsApp flow config in `site_settings`; PUT also calls `/reload-config` on the VPS. |
| `/api/whatsapp/group-task` | POST | `/tarefa <desc>` from a group → creates `tactical_tasks` card with WhatsApp origin fields. |
| `/api/whatsapp/group-decision` | POST | `/decisao <desc>` from a group → inserts into `tactical_decisions`. |
| `/api/whatsapp/group-risk` | POST | `/risco <title>` from a group → inserts into `tactical_risks` with default `media`/`medio`. |
| `/api/whatsapp/group-ai` | POST | `/ia <pergunta>` from a group → GLM-4.7 with tool-calling answers via tables; reply pushed back to the group by the VPS. |

All four group endpoints validate `x-webhook-secret: WHATSAPP_GROUP_TASK_SECRET` and call `revalidatePath('/web-admin/tactical-plan')` (where applicable).

### AI (admin)
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/ai/chat` | POST | GLM-4.7 chat used by `/web-admin/ia` (tool-calling, 8-table allow-list). |
| `/api/ai/test` | GET | Smoke-test endpoint for AI configuration. |

### Cloudflare R2 (media library)
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/r2/upload-url` | POST | Presigned PUT URL (S3-compatible) for browser direct upload. |
| `/api/r2/download-url` | GET | Presigned GET URL for authenticated download. |
| `/api/r2/list` | GET | Lists objects in the R2 bucket with a prefix filter. |
| `/api/r2/delete` | POST | Deletes objects from the R2 bucket. |

### PDF Parsing (admin only)
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/parse-genealogy` | POST | Parses genealogy from a product PDF, saves to `products.genealogia_json`. |
| `/api/parse-genealogy/batch` | GET, POST | Batch genealogy extraction (`dryRun`, `onlyMissing`). |
| `/api/parse-avaliacao-genetica` | POST | Parses genetic evaluation, saves to `products.avaliacao_genetica_json`. |
| `/api/parse-avaliacao-genetica/batch` | GET, POST | Batch genetic-evaluation extraction. |

### Search
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/search` | GET | Spotlight search across `crm_leads`, `products`, `bula_leiloes`, `bula_leilao_fechamento`, `tactical_tasks`, `breeders`. Min 2 chars, 5 hits per type. |

### Bula auction platform (`adminbula.*`)
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/bula/auth/signin` | POST | Email+password sign-in via Supabase Auth. |
| `/api/bula/auth/signup` | POST | Bula user signup. |
| `/api/bula/membros` | GET | Member list. |
| `/api/bula/leiloes` | GET | Auction list. |
| `/api/bula/leiloes/[id]` | GET | Auction detail. |
| `/api/bula/leiloes/upload` | POST | Upload auction data. |
| `/api/bula/crm/funis` | GET | CRM funnel definitions. |
| `/api/bula/crm/deals` | POST | Create a CRM deal. |
| `/api/bula/crm/deals/[id]` | PUT | Update a CRM deal. |
| `/api/bula/leads` | GET | Bula lead list. |
| `/api/bula/leads/[id]` | PATCH | Update a Bula lead. |
| `/api/bula/projetos/cards` | GET | Project Kanban cards. |
| `/api/bula/projetos/cards/[id]` | PUT | Update a project card. |
| `/api/bula/cronograma` | GET | Auction schedule. |
| `/api/bula/cronograma/[id]` | PUT | Update a cronograma item. |
| `/api/bula/fechamento` | GET | Auction closings/results. |
| `/api/bula/fechamento/[id]` | GET | Closing detail. |
| `/api/bula/marketing/config` | GET | Marketing configuration. |

### Payments
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/asaas-webhook` | POST, GET | Asaas validation webhook — auto-approves `TRANSFER.CREATED` so the platform can issue API keys for withdrawals. |
| `/api/asaas-pix-test` | POST | Sandbox helper to issue a test PIX charge. |
| `/api/checkout-semen` | POST | Public sêmen checkout: appends row to Google Sheets `Checkout-Semen` tab. |

### ClickSign (e-signature, admin)
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/clicksign/send` | POST | Admin-only. Body `{ contractId, signers[], deadlineAt?, message?, sequenceEnabled? }`. Baixa o PDF de `tactical_contracts.file_url`, sobe para o ClickSign, cria signatários, vincula e dispara as notificações. Persiste `clicksign_*` no contrato. |
| `/api/clicksign/sync/[contractId]` | POST | Admin-only. Busca o documento atual no ClickSign e atualiza status/signatários/PDF assinado no contrato local. |
| `/api/clicksign/cancel/[contractId]` | POST | Admin-only. Cancela o documento no ClickSign e marca o contrato como `Cancelado`. |
| `/api/clicksign/webhook` | POST, GET | Recebe eventos do ClickSign (assinatura, recusa, auto_close, cancel). Valida `Content-Hmac: sha256=<hex>` se `CLICKSIGN_HMAC_SECRET` estiver configurado. Atualiza `tactical_contracts` automaticamente. |

### External proxy
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/leilao/[...path]` | GET, POST, … | Catch-all proxy to `LEILAO_SERVER_URL/api/<path>` (10s timeout, no-store). |

## Library code (`src/lib/`)

| File | Purpose |
|------|---------|
| `whatsapp.ts` | Thin HTTP client for the VPS — `sendWelcomeMessage(phone, name)`. |
| `clicksign.ts` | Thin HTTP client for ClickSign API v1: `sendDocumentForSignature`, `getDocument`, `cancelDocument`, `fileUrlToBase64DataUri`, `verifyWebhookHmac`. Auth via `?access_token=` query param. |
| `genealogy-parser.ts` | PDF → genealogia_json. |
| `avaliacao-genetica-parser.ts` | PDF → avaliacao_genetica_json. |
| `auth-helpers.ts` | `requireAdmin()` and friends for API routes. |
| `email.ts` | Nodemailer SMTP client; renders verification-code and password-reset emails. |
| `r2.ts` | Cloudflare R2 (S3-compatible) client; presigned URLs, list, delete. |
| `crm-types.ts` | CRM TypeScript interfaces. |
| `bula/queries.ts`, `bula/types.ts` | Shared Supabase queries and types for the Bula APIs. |

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL          # Supabase REST API endpoint
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase public anon key
SUPABASE_SERVICE_ROLE_KEY         # Supabase service role key (bypasses RLS)

# Webhooks & WhatsApp
SHEETS_WEBHOOK_SECRET             # Validates Google Sheets webhook requests
WHATSAPP_SERVER_URL               # default: http://localhost:3001
WHATSAPP_GROUP_TASK_SECRET        # Shared secret for /tarefa, /decisao, /risco, /ia (Production only in Vercel)

# AI (GLM-4.7 / Zhipu)
GLM_API_KEY                       # Zhipu API key
GLM_MODEL                         # default: glm-4.7

# Analytics (GA4)
GOOGLE_GA4_PROPERTY_ID            # GA4 property (fallback: 483341191)
GOOGLE_SERVICE_ACCOUNT_JSON       # GA4 + Sheets service account credentials (stringified JSON)

# SMTP (signup codes & resets)
SMTP_HOST                         # default: smtp.hostinger.com
SMTP_PORT                         # default: 465
SMTP_USER                         # mailbox (e.g. contato@formuladoboi.com)
SMTP_PASS                         # mailbox password
SMTP_FROM                         # optional; default: "Fórmula do Boi <SMTP_USER>"

# Cloudflare R2 (media library)
R2_ACCOUNT_ID                     # R2 account ID
R2_BUCKET                         # R2 bucket name
R2_ACCESS_KEY_ID                  # R2 access key
R2_SECRET_ACCESS_KEY              # R2 secret
R2_PREFIX                         # default: "libmedia/"

# Asaas (payments)
ASAAS_API_KEY                     # Production/sandbox API key
ASAAS_SANDBOX                     # "true" to hit the sandbox

# ClickSign (e-signature)
CLICKSIGN_ACCESS_TOKEN            # token UUID gerado em Configurações → API
CLICKSIGN_API_URL                 # default: https://app.clicksign.com/api/v1 (sandbox: https://sandbox.clicksign.com/api/v1)
CLICKSIGN_HMAC_SECRET             # opcional; valida o cabeçalho Content-Hmac do webhook

# External services
LEILAO_SERVER_URL                 # default: http://localhost:8000
```

The WhatsApp server (VPS) uses the same Supabase variables to load flow config from `site_settings` at startup and every 5 minutes.

## WhatsApp Server (VPS Operations)

```bash
# SSH into VPS
ssh root@165.232.142.37

# View logs
docker logs formula_boi_whatsapp --tail 50 -f

# Restart container
docker restart formula_boi_whatsapp

# Rebuild after code change
cd /opt/whatsapp-server && docker-compose up -d --build
```

Session state is persisted in the Docker volume `/opt/whatsapp-auth/`. If the QR code needs to be re-scanned, delete the auth files and restart the container.

### WhatsApp Server HTTP Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/status` | GET | Connection status + QR code data URL |
| `/send` | POST | Enqueue message `{phone, name}` — returns `{sent, queued, position}` |
| `/queue` | GET | Queue size and processing status |
| `/config` | GET | Current in-memory flow config + pending reply count |
| `/reload-config` | POST | Force reload flow config from Supabase |

### WhatsApp Group Commands

When a member of a connected group (`@g.us`, `fromMe = false`) sends one of the prefixes below, the VPS POSTs to the matching Next.js endpoint with `x-webhook-secret: WHATSAPP_GROUP_TASK_SECRET` and replies in the group with the result.

| Prefix | Endpoint | Effect | Success / failure reply |
|--------|----------|--------|------------------------|
| `/tarefa <descrição>` | `/api/whatsapp/group-task` | Creates a `tactical_tasks` card with WhatsApp origin fields. Card shows a green "WhatsApp" badge in the ERP Kanban. | `✅ Tarefa criada por *Name*: "..."` / `❌ Não foi possível criar a tarefa.` |
| `/decisao <texto>` | `/api/whatsapp/group-decision` | Inserts into `tactical_decisions` (`decided_at = today`). | success/failure reply |
| `/risco <título>` | `/api/whatsapp/group-risk` | Inserts into `tactical_risks` with default `probability=media`, `impact=medio`, `status=active`. | success/failure reply |
| `/ia <pergunta>` | `/api/whatsapp/group-ai` | Sends a "processing…" message, calls GLM-4.7 with tool-calling against the 8-table allow-list, replies with the answer (max ~1000 chars, WhatsApp formatting). 30s timeout. Fire-and-forget on the VPS so it doesn't block other group commands. | answer / `❌ Não foi possível processar a pergunta.` |

VPS env vars required: `NEXT_JS_URL=https://admin.formuladoboi.com`, `WHATSAPP_GROUP_TASK_SECRET=<secret>` (same value as Vercel Production).

> **Pitfall**: when adding `WHATSAPP_GROUP_TASK_SECRET` via `vercel env add`, paste the value carefully — the CLI may append a trailing newline making the length 65 instead of 64, causing all requests to fail with 401.

### WhatsApp Flow Config (`site_settings.whatsapp_flow`)

```json
{
  "welcome_message": "Olá {nome}! ...",
  "options": [
    { "key": "1", "label": "Ver catálogo", "response": "Acesse: https://..." },
    { "key": "2", "label": "Falar com consultor", "response": "Em breve..." }
  ],
  "flow_timeout_minutes": 60
}
```

- `{nome}` in `welcome_message` is replaced with the lead's name at send time.
- After sending the welcome message, the server tracks the contact as "awaiting reply" for `flow_timeout_minutes` minutes.
- If the contact replies with a matching `key`, the corresponding `response` is sent automatically.
- With zero options configured, only the welcome message is sent (no reply tracking).

To apply changes: save via the admin panel or `PUT /api/whatsapp/flow` — this triggers `POST /reload-config` on the VPS automatically.
