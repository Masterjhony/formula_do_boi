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
| Root domain (`formuladoboi.com`, `www.*`) + `app.*` (legacy) | `/web-site` | Public marketplace (touros, matrizes, embriões, sêmen) |
| `/grupo-vip[/...]` on the marketplace | `/web-lp[/...]` | Landing page (lead capture, "Pag-zap" funnel) — same content under `formuladoboi.com/grupo-vip` and `app.formuladoboi.com/grupo-vip` |
| `lp.*` | (301 → `/grupo-vip`) | Legacy LP subdomain — middleware emits a permanent redirect to `formuladoboi.com/grupo-vip${path}` |
| `admin.*` | `/web-admin` | CRM, products, analytics, WhatsApp, tactical plan, OKRs |
| `erp.*` | `/web-erp` | Internal ERP (financeiro, contábil, estoque, leilões) |
| `adminbula.*` | `/web-bula` | Bula auction platform (CRM, fechamentos, cronograma) |

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

**Landing-page lead capture** (`formuladoboi.com/grupo-vip`):
LP form → `POST /api/lp/lead` → applies UTM defaults → inserts into `crm_leads` → appends row to Google Sheets `Pag-zap` tab → triggers WhatsApp welcome. After submit, the browser is sent to `/grupo-vip/obrigado` (or `/obrigado` when accessed via the legacy `lp.*` subdomain — though that subdomain now 301-redirects to `/grupo-vip`).

**Google-Sheets webhook lead** (legacy/external integrations):
Sheet row → `POST /api/webhooks/google-sheets` (validates `x-webhook-secret`) → inserts to `crm_leads` → calls VPS `/send` → logs to `whatsapp_messages`.

**WhatsApp interactive flow**: the welcome message and numbered menu options are configured in the admin panel (`/web-admin/whatsapp`) and stored in `site_settings.whatsapp_flow`. When a lead replies with a menu option key, the VPS responds automatically (tracked in-memory with a configurable timeout).

### Database

Migrations live in [/database/](database/) (~120 files, one per change). They are run manually against Supabase — there is no migration runner. Key tables:

| Table | Purpose |
|-------|---------|
| `products` | Livestock catalog (touros, matrizes, embriões, sêmen). `details`, `genealogia_json`, `avaliacao_genetica_json` are JSONB. |
| `crm_leads` | Sales pipeline. `position` drives Kanban ordering. UTM/attribution fields (`source`, `medium`, `campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, `referrer`, `landing_url`) are populated by `/api/lp/lead`. **Central WhatsApp** adiciona: `interesse_principal`, `tags_whatsapp` (JSONB), `last_whatsapp_at`, `handoff_humano`, `handoff_at`, `handoff_responsavel`, `optout_whatsapp`, `optout_at`. |
| `profiles` | User roles (`admin` / `user`); references `auth.users`. |
| `breeders` | Breeder registry. |
| `whatsapp_messages` | Log conversacional. Colunas-chave: `direction` (inbound/outbound), `body`, `origin` (lp\|webhook\|manual\|campanha\|central-bot), `bot_step`, `campaign_id`, `template_id`, `lead_id`. |
| `whatsapp_templates` | Biblioteca de mensagens prontas da Central (slug único, body com `{nome}`, category, archived, usage_count). |
| `whatsapp_campaigns` | Campanhas/listas de transmissão segmentadas. `segment` (JSONB) traz filtros aplicados a `crm_leads`. Status: `rascunho\|enviando\|concluida\|cancelada\|erro`. Inclui regras de parada (`stop_on_reply`, `stop_on_optout`, `stop_on_handoff`, `stop_on_interest`) e reação à resposta (`reply_tag`, `reply_handoff`) — migration `database/whatsapp_campaign_sequences.sql`. |
| `whatsapp_campaign_steps` | Passos adicionais (1+) da sequência de follow-up; o passo 0 vive na própria campanha. Cada step tem `delay_value`/`delay_unit` (minutes\|hours\|days) relativo ao passo anterior + conteúdo (template ou body ou mídia). |
| `whatsapp_campaign_recipients` | Destinatários materializados ao disparar a campanha. Status: `pendente\|enviado\|falhou\|optout`. Estado da sequência: `current_step`, `next_send_at`, `replied_at`, `stopped_at`, `stopped_reason` (`replied\|optout\|handoff\|interest\|completed\|cancelled\|error`). |
| `whatsapp_optouts` | Cache rápido de opt-outs por número (PK = phone). Espelhado em `crm_leads.optout_whatsapp`. |
| `site_settings` | Feature flags and configuration (key/JSONB). Key `whatsapp_flow` stores legacy automation config; key `whatsapp_flow_v2` é fallback do grafo (compat — fonte da verdade nova é `whatsapp_flows`). |
| `whatsapp_flows` | Múltiplos fluxos nomeados (grafos completos). Apenas UM `is_active=true` por vez (constraint UNIQUE parcial). Colunas-chave: `graph` (JSONB v2), `settings` (JSONB — parâmetros do fluxo: rate limit, horário permitido, fuso etc — lidos por `loadActiveFlowWithSettings()`), `last_activated_at` (timestamp de última ativação). Inbound e render-welcome consultam o ativo. Operador cria variantes e troca o ativo em 1 clique. Migrations: `database/whatsapp_flows.sql` + `database/whatsapp_flows_settings.sql`. |
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

- **WhatsApp flow engine (Central)**: a data-driven flow graph drives every Central WhatsApp inbound. Stored in `site_settings.whatsapp_flow_v2` as JSON (nodes + edges). The engine in [src/lib/whatsapp-flow-engine.ts](src/lib/whatsapp-flow-engine.ts) interprets it: node types are `start`, `classify` (5 outputs by classification kind), `condition` (true/false), `action` (apply_optout / apply_resubscribe / apply_handoff / apply_interest / add_tag), `send_template` (slug fixed or dynamic `triagem_by_interesse`), `silence` (terminal silent), `end` (terminal reply). Visual editor at admin `/whatsapp` → tab "Fluxo" uses `@xyflow/react`; saving validates and writes back. If the row doesn't exist, `buildDefaultGraph()` is used as fallback — it mirrors the previous hardcoded behavior. `/api/whatsapp/flow` (legacy `whatsapp_flow` key) is deprecated for the Central but remains for backward compatibility.
- **WhatsApp group commands**: members of a connected group (`@g.us`) can run `/tarefa`, `/decisao`, `/risco`, and `/ia`. The VPS detects the prefix in `messages.upsert` (ignoring `fromMe`), POSTs to the corresponding Next.js endpoint with `x-webhook-secret`, and replies in the group on success/failure. See [WhatsApp Group Commands](#whatsapp-group-commands) below.
- **AI assistant (GLM-4.7)**: same model is shared by the in-app `/web-admin/ia` page (`/api/ai/chat`) and the WhatsApp `/ia` command (`/api/whatsapp/group-ai`). Both use tool-calling against an 8-table allow-list (`products`, `crm_leads`, `profiles`, `tactical_tasks`, `tactical_contracts`, `whatsapp_messages`, `site_settings`, `breeders`).
- **Genealogy / Genetic Evaluation parsing**: [src/lib/genealogy-parser.ts](src/lib/genealogy-parser.ts) and [src/lib/avaliacao-genetica-parser.ts](src/lib/avaliacao-genetica-parser.ts) parse PDFs via `pdf-parse` and back the batch endpoints under `/api/parse-*`.
- **CRM Kanban**: built with `@dnd-kit` — drag updates the `position` field in Supabase in real time.
- **Deep-link URL params (admin panel)**: telas com aba+detalhe usam `useSearchParams`/`router.replace` (não `push`) como fonte de verdade para o estado visível, permitindo compartilhar a URL exata. Aba default não emite param (mantém URL limpa). Convenções:
  - `/leiloes/fechamento?id=<uuid>` — modal de detalhe ([src/app/web-admin/(dashboard)/leiloes/FechamentoView.tsx](src/app/web-admin/(dashboard)/leiloes/FechamentoView.tsx)).
  - `/whatsapp?tab=<inbox|fluxo|templates|campanhas|metricas|conexao>` — `inbox` é default ([src/app/web-admin/(dashboard)/whatsapp/page.tsx](src/app/web-admin/(dashboard)/whatsapp/page.tsx)).
  - `/tactical-plan?view=<kanban|gantt|whiteboard|dashboard|members>&task=<uuid>` — `kanban` é default. Modal "nova tarefa" é estado local, não vai pra URL ([src/components/admin/kanban/KanbanBoard.tsx](src/components/admin/kanban/KanbanBoard.tsx)).
  - `/crm?view=<qualificacao|kanban|configuracoes>&lead=<uuid>` — `qualificacao` é default. Modal "novo lead" é estado local ([src/components/admin/crm/CRMDashboardClient.tsx](src/components/admin/crm/CRMDashboardClient.tsx)).
  - Todas as páginas que consomem `useSearchParams` envolvem o cliente em `<Suspense>` (Next 16 exige para build estático).
  - IDs inexistentes (registro deletado) não quebram — modal fica fechado, página carrega normal.
- **Paginação compartilhada**: [src/components/admin/Pagination.tsx](src/components/admin/Pagination.tsx) fornece controles `« ‹ 1 2 3 › »` + dropdown "Por página" (default `25 / 50 / 100 / 200`). Quem consome controla `page` e `pageSize` por props. Usado em `/leads` ([CRMLeadsView](src/components/admin/crm/CRMLeadsView.tsx)) e na aba Qualificação do CRM ([CRMQualificacaoView](src/components/admin/crm/CRMQualificacaoView.tsx)).
- **Global search**: `/api/search?q=...` returns categorized hits (`lead`, `product`, `leilao`, `fechamento`, `task`, `breeder`) for the spotlight UI in [src/components/admin/GlobalSearch.tsx](src/components/admin/GlobalSearch.tsx).
- **Analytics**: GA4 data pulled via `@google-analytics/data` using a service account; configured with `GOOGLE_SERVICE_ACCOUNT_JSON` and `GOOGLE_GA4_PROPERTY_ID` (fallback `483341191`).
- **Media library**: stored on Cloudflare R2 with prefix `R2_PREFIX` (default `libmedia/`). Browser uploads via presigned PUT issued by `/api/r2/upload-url`; downloads via presigned GET from `/api/r2/download-url`.
- **Bula sistema**: `/web-bula/sistema` and `/web-bula/login.html` are static HTML SPAs served via tiny `route.ts` handlers that stream the file. They consume the `/api/bula/*` JSON endpoints.
- **Path alias**: `@/*` maps to `./src/*`.

## Page Routes

### `/web-lp` (mounted at `/grupo-vip` on the marketplace)
- `/grupo-vip` (landing page form)
- `/grupo-vip/obrigado` (post-signup thank-you)

The route handler at [src/app/web-lp/route.ts](src/app/web-lp/route.ts) streams `public/lp/index.html` and injects the WhatsApp group link from `site_settings.whatsapp_group_link`. Middleware rewrites `/grupo-vip${sub}` → `/web-lp${sub}` on the root, www, and `app.*` hosts. The form submit detects the current path and redirects accordingly (`/grupo-vip/obrigado` under the new mount; bare `/obrigado` only on direct `/web-lp` hits — kept as a safety net).

### `/web-site` (root domain `formuladoboi.com`, www + `app.*` legacy)
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
| `/api/whatsapp/flow` | GET, PUT | Legado. A Central WhatsApp usa `whatsapp_templates` (slug `welcome-default`) como fonte do welcome. |
| `/api/whatsapp/inbound` | POST | **Central WhatsApp** — VPS encaminha toda inbound individual aqui. Classifica intenção, atualiza `crm_leads`, loga `whatsapp_messages`, devolve `{reply, bot_step}` ou `{silent: true}`. |
| `/api/whatsapp/render-welcome` | POST | Renderiza template `welcome-default` para o VPS antes de disparar; respeita opt-out. |
| `/api/whatsapp/campaign-callback` | POST | Callback do VPS por destinatário — atualiza `whatsapp_campaign_recipients` e contadores. |
| `/api/whatsapp/central/inbox` | GET | Lista de conversas (uma por número) com filtros `todos\|aguardando\|handoff\|optout\|interesse`. |
| `/api/whatsapp/central/thread/[phone]` | GET, POST | Histórico completo + lead vinculado / envio manual (bloqueado se opt-out). |
| `/api/whatsapp/central/lead-action` | POST | Ações rápidas no lead (`handoff_on/off`, `optout_on/off`, `set_interesse`). |
| `/api/whatsapp/central/templates` | GET, POST | CRUD da biblioteca de templates. |
| `/api/whatsapp/central/templates/[id]` | PUT, DELETE | Atualiza ou arquiva template. |
| `/api/whatsapp/central/campaigns` | GET, POST | Lista e cria campanhas em rascunho. GET retorna contadores agregados (`steps_count`, `replied_count`, `stopped_count`). |
| `/api/whatsapp/central/campaigns/[id]` | GET, PUT, DELETE | Detalhe + recipients + steps. PUT edita rascunho (regras de parada / reply). DELETE só em rascunho. |
| `/api/whatsapp/central/campaigns/[id]/steps` | GET, POST | Lista/cria passos (1+) da sequência (delay relativo + template/body/mídia). Só em rascunho. |
| `/api/whatsapp/central/campaigns/[id]/steps/[stepId]` | PUT, DELETE | Edita ou remove um passo (reordena os sucessores). Só em rascunho. |
| `/api/whatsapp/central/campaigns/[id]/send` | POST | Resolve segmento → materializa em `whatsapp_campaign_recipients` (com `current_step=1`, `next_send_at` se houver follow-up) → POST `/campaign-send` no VPS pro passo 0. |
| `/api/whatsapp/central/campaigns/cron` | GET | Cron externo (GitHub Actions, cron-job.org etc — a cada 1-5min). Processa recipients com `next_send_at <= now()`: aplica regras de parada, envia próximo step, avança `current_step`. Auth via `x-webhook-secret`. Plano Hobby da Vercel não permite cron sub-diário, por isso não usamos `vercel.json`. |
| `/api/whatsapp/central/campaigns/preview` | POST | Pré-visualiza público (count + amostra) sem materializar. |
| `/api/whatsapp/central/metrics` | GET | Métricas operacionais (novos contatos 7d, opt-outs, distribuição de interesse). |
| `/api/whatsapp/central/flow` | GET, PUT, DELETE | **Legado**. Hoje opera sobre o fluxo ATIVO em `whatsapp_flows`. Mantido pra compat; UIs novas devem usar `/flows`. |
| `/api/whatsapp/central/flows` | GET, POST | Lista fluxos nomeados / cria novo (com `clone_from` opcional pra duplicar). |
| `/api/whatsapp/central/flows/[id]` | GET, PUT, DELETE | Detalhe + grafo / edita nome/descrição/grafo / deleta (não permite deletar o ativo nem o último restante). PUT valida via `validateGraph()`. |
| `/api/whatsapp/central/flows/[id]/activate` | POST | Torna esse fluxo o único ativo. Valida o grafo antes de ativar (não deixa colocar fluxo quebrado em produção). |
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
WHATSAPP_GROUP_TASK_SECRET        # Shared secret for /tarefa, /decisao, /risco, /ia + inbound + render-welcome (Production only in Vercel)
# (Cron de campanhas usa WHATSAPP_GROUP_TASK_SECRET via header x-webhook-secret — não há CRON_SECRET separado porque o plano Hobby da Vercel não permite cron sub-diário; usamos cron externo.)

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

### Central WhatsApp — Fluxo default (voz do Matheus, 1ª pessoa)

A partir de 2026-05-12, o welcome padrão e toda a triagem subsequente são
escritos em primeira pessoa, como se o Matheus (diretor) estivesse falando.
Mudança aplicada via [database/seed_welcome_default_matheus_1p.sql](database/seed_welcome_default_matheus_1p.sql).

**Welcome `welcome-default`** — apresentação do Matheus + 3 frentes da empresa
(Aceleradora de Touros, Central de Embriões, Assessoria em Leilões) + menu
enxuto de 4 opções:

```
1 — Sêmen
2 — Embriões
3 — Compra e venda de genética Nelore P.O
4 — Todos
```

**Mapeamento numérico default** (`DEFAULT_NUMERIC_MAP` em [src/lib/whatsapp-central.ts](src/lib/whatsapp-central.ts)):

| Tecla | `Classification`                                         | Template de triagem               |
|-------|----------------------------------------------------------|-----------------------------------|
| `1`   | `interest` → `semen`                                     | `triagem-semen`                   |
| `2`   | `interest` → `embrioes`                                  | `triagem-embrioes`                |
| `3`   | `interest` → `compra_venda_genetica`                     | `triagem-compra-venda-genetica`   |
| `4`   | `interest` → `interesse_amplo`                           | `triagem-interesse-amplo`         |

> Leads históricos que receberam o welcome antigo (menu 1..7) e respondem
> `5/6/7` agora caem em `unknown` no classifier default — o bot fica em
> silêncio nesses casos. Não é problema na prática porque o gate
> `welcome_eligible` impede re-welcome, e o operador atende manualmente pelo
> Inbox.

**Cobertura por palavra-chave** continua ativa para os interesses fora do
menu enxuto (touros, matrizes, central de embriões, leilões, oferta de
genética, oportunidades). Todos têm template de triagem em 1ª pessoa
Matheus no seed.

**Tom canônico do fluxo default**:
- Sempre 1ª pessoa singular ("vou anotar", "eu te chamo", "me responde").
- Sem emojis no welcome e nas triagens default.
- Encerramentos prometem ação direta do Matheus ("eu te chamo aqui mesmo",
  "agendamos uma conversa direta"), não "vou te encaminhar para um
  consultor".
- Opt-out e re-subscribe seguem o mesmo tom — `optout-confirmacao` e
  `resubscribe-msg` foram reescritos no mesmo seed.

**Overrides de audiência** (continuam funcionando, intocados):

| Tag no lead                       | Welcome usado                      | Menu      | Slugs preferenciais          |
|-----------------------------------|------------------------------------|-----------|------------------------------|
| _(sem tag)_ — default             | `welcome-default`                  | 1..4      | `triagem-*` padrão (Matheus) |
| `grupo_academia_nelore_po`        | `welcome-academia-nelore-po`       | 1..6      | `triagem-*-academia`         |
| `lista_matheus_personalizada`     | `welcome-matheus-institucional`    | 1..6      | (mesmos `triagem-*` default) |

O override Academia é aplicado em [src/lib/whatsapp-flow-engine.ts](src/lib/whatsapp-flow-engine.ts)
via `ACADEMIA_SLUG_OVERRIDES`; o classifier resolve a audiência (Lista
Matheus > Academia > default) no [src/lib/whatsapp-central.ts:206](src/lib/whatsapp-central.ts#L206).

**Para alterar o fluxo default**: edite os bodies em
[database/seed_welcome_default_matheus_1p.sql](database/seed_welcome_default_matheus_1p.sql)
e reaplique (idempotente — usa `ON CONFLICT (slug) DO UPDATE`). Se a lista
de opções mudar, atualize também `DEFAULT_NUMERIC_MAP` em sincronia. O grafo
em si (gates de opt-out / handoff) não precisa de mudança — vive em
`site_settings.whatsapp_flow_v2` e é editável pela aba "Fluxo" da Central.

**Pausa global**: a aba **Conexão** tem o botão "Pausar fluxo" — quando
ativo, o número segue conectado e o Inbox segue logando inbound, mas
welcome e fluxo são bloqueados (`{ silent: true, reason: 'paused' }`).
Estado em `site_settings.whatsapp_central_paused`, helper em
[src/lib/whatsapp-pause.ts](src/lib/whatsapp-pause.ts).
