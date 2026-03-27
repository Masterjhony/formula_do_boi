# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture Overview

**Formula do Boi** is a livestock genetics marketplace for Nelore cattle (PO). It has three distinct interfaces unified by subdomain routing via `src/middleware.ts`:

| Subdomain | Route prefix | Purpose |
|-----------|-------------|---------|
| `admin.*` | `/web-admin` | CRM, product management, analytics, WhatsApp |
| `erp.*` | `/web-erp` | Internal operations (tactical plan, contracts) |
| Root domain | `/web-site` | Public marketplace |

### Core Services

- **Next.js (Vercel)** — App Router, deployed automatically on `git push` to `main`. Never run `vercel --prod` manually.
- **Supabase** — PostgreSQL with RLS, used for all data persistence and auth. Three client variants: `src/utils/supabase/server.ts` (server components), `src/utils/supabase/client.ts` (browser), `src/utils/supabase/middleware.ts` (auth refresh).
- **WhatsApp microservice** — Separate Docker container on DigitalOcean VPS (`165.232.142.37:3001`) running Baileys. Exists because Vercel serverless cannot maintain persistent WebSocket connections. Next.js proxies to it via `/api/whatsapp/*` routes.

### Key Data Flow: Lead Automation

Google Sheets → `POST /api/webhooks/google-sheets` (validates `x-webhook-secret`) → inserts to `crm_leads` → calls WhatsApp microservice `/send` → logs to `whatsapp_messages`.

The welcome message and interactive menu options are configured via the admin panel (`/web-admin/whatsapp`) and stored in `site_settings` with key `whatsapp_flow`. When a lead replies with a menu option number, the server responds automatically (tracked in-memory with a configurable timeout).

### Database

Migrations are in `/database/` (100+ files, one per change). Key tables:

| Table | Purpose |
|-------|---------|
| `products` | Livestock catalog (touros, matrizes, embriões, sêmen); `details` JSONB, `genealogia_json` JSONB, `avaliacao_genetica_json` JSONB |
| `crm_leads` | Sales pipeline; `position` field drives Kanban ordering |
| `profiles` | User roles (`admin` / `user`, references `auth.users`) |
| `tactical_tasks` | ERP Kanban with `checklists` JSONB and `attachments` JSONB |
| `tactical_contracts` | Contract management |
| `whatsapp_messages` | WhatsApp message send log (status, phone, lead_id FK) |
| `site_settings` | Feature flags and configuration (key/JSONB value). Key `whatsapp_flow` stores the automation flow config. |
| `breeders` | Breeder registry |

### Notable Implementation Details

- **WhatsApp flow builder**: Admin can edit the welcome message (supports `{nome}` variable), define numbered menu options, and configure reply timeout — stored in `site_settings.whatsapp_flow`, applied to the VPS server live via `POST /reload-config`.
- **Genealogy/Genetic Evaluation parsing**: `src/lib/genealogy-parser.ts` and `src/lib/avaliacao-genetica-parser.ts` parse PDFs via `pdf-parse` and expose batch endpoints under `/api/parse-*`.
- **CRM Kanban**: built with `@dnd-kit` — drag updates `position` field in Supabase in real time.
- **Analytics**: GA4 data pulled via `@google-analytics/data` using a service account; configured with `GOOGLE_SERVICE_ACCOUNT_JSON` and `GOOGLE_GA4_PROPERTY_ID`.
- **Path alias**: `@/*` maps to `./src/*`.

## API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/webhooks/google-sheets` | POST, GET | Receives leads from Google Sheets, inserts to `crm_leads`, triggers WhatsApp send |
| `/api/webhook/crm-lead` | POST | Legacy webhook; sends welcome WhatsApp via `src/lib/whatsapp.ts` |
| `/api/whatsapp/status` | GET | Proxies to VPS `/status` — returns `{status, qr}` |
| `/api/whatsapp/messages` | GET | Fetches last 50 messages + today's count + conversations from `whatsapp_messages` |
| `/api/whatsapp/flow` | GET, PUT | Reads/saves WhatsApp flow config in `site_settings`; PUT also calls `/reload-config` on VPS |
| `/api/parse-genealogy` | POST | Parses genealogy from product PDF, saves to `products.genealogia_json` |
| `/api/parse-genealogy/batch` | GET, POST | Batch genealogy extraction (supports `dryRun`, `onlyMissing`) |
| `/api/parse-avaliacao-genetica` | POST | Parses genetic evaluation from PDF, saves to `products.avaliacao_genetica_json` |
| `/api/parse-avaliacao-genetica/batch` | GET, POST | Batch genetic evaluation extraction |

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL          # Supabase REST API endpoint
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase public anon key
SUPABASE_SERVICE_ROLE_KEY         # Supabase service role key (bypasses RLS)
SHEETS_WEBHOOK_SECRET             # Validates Google Sheets webhook requests
WHATSAPP_SERVER_URL               # default: http://localhost:3001
GOOGLE_GA4_PROPERTY_ID            # GA4 property (fallback: 483341191)
GOOGLE_SERVICE_ACCOUNT_JSON       # GA4 service account credentials (stringified JSON)
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

### WhatsApp Flow Config (site_settings key: `whatsapp_flow`)

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
