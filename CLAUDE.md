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
| `erp.*` | `/web-erp` | Internal operations |
| Root domain | `/web-site` | Public marketplace |

### Core Services

- **Next.js (Vercel)** — App Router, deployed automatically on `git push` to `main`. Never run `vercel --prod` manually.
- **Supabase** — PostgreSQL with RLS, used for all data persistence and auth. Three client variants: `src/utils/supabase/server.ts` (server components), `src/utils/supabase/client.ts` (browser), `src/utils/supabase/middleware.ts` (auth refresh).
- **WhatsApp microservice** — Separate Docker container on DigitalOcean VPS (`165.232.142.37:3001`) running Baileys. Exists because Vercel serverless cannot maintain persistent WebSocket connections. Next.js proxies to it via `/api/whatsapp/*` routes.

### Key Data Flow: Lead Automation

Google Sheets → `POST /api/webhooks/google-sheets` (validates `x-webhook-secret`) → inserts to `crm_leads` → calls WhatsApp microservice `/send` → logs to `whatsapp_messages`.

### Database

Migrations are in `/database/` (90+ files, one per change). Key tables:
- `products` — livestock catalog (touros, matrizes, embriões, sêmen); `details` field is JSONB
- `crm_leads` — sales pipeline; `position` field drives Kanban ordering
- `profiles` — user roles (`admin` / `user`, references `auth.users`)
- `tactical_tasks` — ERP Kanban with checklist and attachment support
- `whatsapp_messages` — message send log
- `site_settings` — feature flags and configuration

### Notable Implementation Details

- **Genealogy/Genetic Evaluation parsing**: `src/lib/genealogy-parser.ts` and `src/lib/avaliacao-genetica-parser.ts` parse PDFs via `pdf-parse` and expose batch endpoints under `/api/parse-*`.
- **CRM Kanban**: built with `@dnd-kit` — drag updates `position` field in Supabase in real time.
- **Analytics**: GA4 data pulled via `@google-analytics/data` using a service account; configured with `GOOGLE_SERVICE_ACCOUNT_JSON` and `GOOGLE_GA4_PROPERTY_ID`.
- **Path alias**: `@/*` maps to `./src/*`.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SHEETS_WEBHOOK_SECRET
WHATSAPP_SERVER_URL          # default: http://localhost:3001
GOOGLE_GA4_PROPERTY_ID
GOOGLE_SERVICE_ACCOUNT_JSON
```

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
