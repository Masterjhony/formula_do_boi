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

> **Central de E-mail Marketing.** A página `/web-admin/email` é o espelho da Central WhatsApp para campanhas por e-mail. Usa o SMTP da Hostinger já configurado em [src/lib/email.ts](src/lib/email.ts) — **não** depende de microserviço externo nem de provedor SaaS (sem Resend/SES). Tabelas próprias (`email_templates`, `email_campaigns`, `email_campaign_steps`, `email_campaign_recipients`, `email_optouts`, `email_messages`), sequência multi-step com `next_send_at` processada pelo cron `/api/email/central/campaigns/cron`, link de unsubscribe assinado (HMAC) em todo rodapé. **Limite operacional**: SMTP Hostinger compartilhado capa em ~100-300 e-mails/dia — o cron processa em lotes de 30 com 800ms entre envios. Detalhes na seção *Central de E-mail Marketing* no fim deste arquivo.

> **Catálogos WhatsApp (segunda sessão Baileys, mesmo VPS).** A página `/web-admin/catalogos-whatsapp` controla um SEGUNDO container Baileys (`formula_boi_whatsapp_catalogs`, porta 3002, auth folder `/opt/whatsapp-catalogs-auth`, número WhatsApp DIFERENTE da Central). Esse container monitora grupos configurados em `whatsapp_catalog_groups`, baixa PDFs anexados, sobe ao R2 e chama `/api/whatsapp-catalogos/webhook`. O Next.js casa o nome do arquivo com `cronograma_leiloes.nome` (fuzzy match, ver `src/lib/whatsapp-catalogs.ts`) e, quando há match confiante, escreve `cronograma_leiloes.catalogo_url` automaticamente. As detecções ambíguas/sem match ficam pendentes pro operador resolver pela aba Detecções. Detalhes operacionais na seção *Catálogos WhatsApp (segunda sessão Baileys)* no fim deste arquivo.

> **PostHog (Product Analytics + Session Replay).** Roda **apenas** no site público (`/web-site`) e na LP (`/web-lp`) — `admin.*`, `erp.*` e `adminbula.*` ficam de fora por privacidade do operador. Provider React em [src/providers/PostHogProvider.tsx](src/providers/PostHogProvider.tsx); HTMLs estáticos da LP recebem snippet inline via [src/lib/posthog-snippet.ts](src/lib/posthog-snippet.ts). Eventos custom (`lp_form_submit`, `whatsapp_cta_click`, `lote_view`, `lote_reserva_click`) declarados em [`EventName`](src/lib/posthog-client.ts). Painel `/web-admin/analytics` consome HogQL via `POSTHOG_PERSONAL_API_KEY`. Detalhes na seção *PostHog — instrumentação* no fim deste arquivo.

> **Agendamentos (Calendly Free × Google Calendar).** A página `/web-admin/agendamentos` lista reuniões marcadas via Calendly sem precisar de plano pago. Como o Calendly Free não dá PAT/webhook/redirect, usamos o **Google Calendar como ponte**: o Calendly cria os eventos num Google Calendar do dono → service account (`GOOGLE_SERVICE_ACCOUNT_JSON`, mesma usada em GA4/Sheets) lê via Google Calendar API → cron `/api/agendamentos/sync` materializa em `agendamentos`. Auto-vínculo ao `crm_leads` por e-mail e telefone (parseado da descrição do Calendly). Template WhatsApp `agendamento-link` envia o link pro lead. Detalhes na seção *Agendamentos (Calendly × Google Calendar)* no fim deste arquivo.

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
- **PostHog** (`posthog-js` + `posthog-node`) — Product Analytics + Session Replay + Web Analytics em US Cloud (projeto `430113`, host `us.i.posthog.com`). Roda **apenas** no site público e na LP (`/web-site`, `/web-lp`); painéis internos (`admin`, `erp`, `adminbula`) ficam de fora por privacidade do operador. Detalhes na seção *PostHog — instrumentação* no fim deste arquivo.

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
| `crm_leads` | Sales pipeline. `position` drives Kanban ordering. UTM/attribution fields (`source`, `medium`, `campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, `referrer`, `landing_url`) are populated by `/api/lp/lead`. **Central WhatsApp** adiciona: `interesse_principal`, `tags_whatsapp` (JSONB), `last_whatsapp_at`, `handoff_humano`, `handoff_at`, `handoff_responsavel`, `optout_whatsapp`, `optout_at`. **Central de E-mail** adiciona: `optout_email`, `optout_email_at`, `last_email_at`. |
| `profiles` | User roles (`admin` / `user`); references `auth.users`. |
| `breeders` | Breeder registry. |
| `whatsapp_messages` | Log conversacional. Colunas-chave: `direction` (inbound/outbound), `body`, `origin` (lp\|webhook\|manual\|campanha\|central-bot), `bot_step`, `campaign_id`, `template_id`, `lead_id`. |
| `whatsapp_templates` | Biblioteca de mensagens prontas da Central (slug único, body com `{nome}`, category, archived, usage_count). |
| `whatsapp_campaigns` | Campanhas/listas de transmissão segmentadas. `segment` (JSONB) traz filtros aplicados a `crm_leads`. Status: `rascunho\|enviando\|concluida\|cancelada\|erro`. Inclui regras de parada (`stop_on_reply`, `stop_on_optout`, `stop_on_handoff`, `stop_on_interest`) e reação à resposta (`reply_tag`, `reply_handoff`) — migration `database/whatsapp_campaign_sequences.sql`. |
| `whatsapp_campaign_steps` | Passos adicionais (1+) da sequência de follow-up; o passo 0 vive na própria campanha. Cada step tem `delay_value`/`delay_unit` (minutes\|hours\|days) relativo ao passo anterior + conteúdo (template ou body ou mídia). |
| `whatsapp_campaign_recipients` | Destinatários materializados ao disparar a campanha. Status: `pendente\|enviado\|falhou\|optout`. Estado da sequência: `current_step`, `next_send_at`, `replied_at`, `stopped_at`, `stopped_reason` (`replied\|optout\|handoff\|interest\|completed\|cancelled\|error`). |
| `whatsapp_optouts` | Cache rápido de opt-outs por número (PK = phone). Espelhado em `crm_leads.optout_whatsapp`. |
| `email_templates` | Biblioteca de templates HTML reutilizáveis da Central de E-mail (slug único, subject, body_html, body_text, variables, category, archived, usage_count). |
| `email_campaigns` | Campanhas segmentadas por e-mail. Mesmo padrão de `whatsapp_campaigns` mas com `subject`/`body_html`/`body_text`/`from_name`/`reply_to`. Status: `rascunho\|enviando\|concluida\|cancelada\|erro`. Regras de parada: `stop_on_optout`, `stop_on_interest`. `audience_tag` (string) é aplicada em `crm_leads.tags_whatsapp` ao disparar. |
| `email_campaign_steps` | Passos 1+ da sequência de follow-up por e-mail. Mesmo modelo de `whatsapp_campaign_steps` (`delay_value`/`delay_unit` relativo ao passo anterior, conteúdo via `template_id` OU `subject`+`body_html`). |
| `email_campaign_recipients` | Destinatários materializados ao disparar. Status: `pendente\|enviado\|falhou\|optout`. Sequência: `current_step`, `next_send_at`, `stopped_at`, `stopped_reason` (`optout\|interest\|completed\|cancelled\|error\|bounce`). |
| `email_optouts` | Cache rápido de opt-outs por endereço de e-mail (PK = email lowercased). Espelhado em `crm_leads.optout_email`. |
| `email_messages` | Log conversacional de envios por e-mail. Colunas: `direction` (sempre `outbound` por enquanto — Hostinger não dá inbound webhook), `subject`, `body_html`, `body_text`, `status` (`queued\|sent\|failed`), `origin` (`campanha\|template\|manual\|sistema`), `campaign_id`, `template_id`, `recipient_id`. |
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
| `agendamentos` | Reuniões marcadas via Calendly (ponte Google Calendar) ou manualmente. Idempotência por `google_event_id`. Colunas-chave: `source` (calendly\|google\|manual), `google_event_id`, `calendly_event_uri`, `summary`, `start_at`, `end_at`, `invitee_name/email/phone`, `status` (agendado\|confirmado\|concluido\|cancelado\|nao_compareceu), `meeting_url`, `lead_id` (FK `crm_leads`), `responsible_member_id`, `notes`, `tags` (JSONB), `cancelled_at`, `cancel_reason`, `raw_payload` (JSONB do Google pra debug), `last_synced_at`. Settings em `site_settings.agendamentos_calendar`. |

### Notable Implementation Details

- **WhatsApp flow engine (Central)**: a data-driven flow graph drives every Central WhatsApp inbound. Fonte da verdade é a tabela `whatsapp_flows` (múltiplos fluxos nomeados, 1 ativo por vez); `site_settings.whatsapp_flow_v2` segue como fallback de compatibilidade. O engine em [src/lib/whatsapp-flow-engine.ts](src/lib/whatsapp-flow-engine.ts) interpreta o grafo: node types são `start` (com `data.trigger` = `inbound` ou `new_lead`), `classify` (5 saídas por kind), `condition` (true/false), `action` (apply_optout / apply_resubscribe / apply_handoff / apply_interest / add_tag), `send_template` (slug fixo ou dinâmico `triagem_by_interesse`), `silence` (terminal silent), `end` (terminal reply). O subgrafo `new_lead` é percorrido por `resolveWelcomeDispatch()` quando o VPS chama `/render-welcome` — anda só por `condition` e termina num `send_template`, devolvendo o slug ao caller. Editor visual em admin `/whatsapp` → aba "Fluxo" usa `@xyflow/react`; salvar valida via `validateGraph()` e grava. Se a linha ativa do `whatsapp_flows` tiver grafo vazio (placeholder de migration), o GET de `/api/whatsapp/central/flows/[id]` auto-cura gravando `buildDefaultGraph()`. `/api/whatsapp/flow` (legacy `whatsapp_flow` key) é deprecated mas mantido por compat.
- **Parâmetros do fluxo (`whatsapp_flows.settings`)**: JSONB por fluxo com configurações que afetam o engine *antes* de entrar no grafo (rate limit, compliance, horário). Lidos por `loadActiveFlowWithSettings()` em [src/lib/whatsapp-flows.ts](src/lib/whatsapp-flows.ts), tipos e defaults em [src/lib/whatsapp-flow-settings.ts](src/lib/whatsapp-flow-settings.ts). Editor na aba "Fluxo" → botão **Configurações** (3 abas internas: Geral / Gatilhos / Parâmetros). Cada parâmetro carrega badge **ativo** ou **pendente** indicando se o engine já consome. **Ativos hoje**: `welcome_dedup_hours`, `send_welcome_on_unknown`, `menu_sent_tag`, `fallback_template`, `optout_blocks_automation`, `handoff_blocks_automation`, e o trio `allowed_hours_*` + `timezone` — quando `allowed_hours_enabled=true`, `/api/whatsapp/inbound` e `/api/whatsapp/render-welcome` respondem `{ silent: true, reason: 'outside_allowed_hours' }` fora da janela (`isWithinAllowedHours()` resolve hora atual no fuso IANA e aceita janelas cruzando meia-noite). **Pendentes** (UI persiste mas engine ignora): `max_auto_replies_per_lead_per_day`, `min_interval_minutes_between_replies`, `resend_menu_after_days`, `send_menu_if_interest_already_set`, `handoff_auto_expire_hours`. Adicionar um setting novo: declare no `FlowSettings`, ponha default em `FLOW_SETTINGS_DEFAULTS`, leia onde fizer sentido, e atualize o badge na UI ([ParamRow](src/components/admin/central-whatsapp/FluxoTab.tsx)) pra "ativo".
- **WhatsApp group commands**: members of a connected group (`@g.us`) can run `/tarefa`, `/decisao`, `/risco`, and `/ia`. The VPS detects the prefix in `messages.upsert` (ignoring `fromMe`), POSTs to the corresponding Next.js endpoint with `x-webhook-secret`, and replies in the group on success/failure. See [WhatsApp Group Commands](#whatsapp-group-commands) below.
- **AI assistant (GLM-4.7)**: same model is shared by the in-app `/web-admin/ia` page (`/api/ai/chat`) and the WhatsApp `/ia` command (`/api/whatsapp/group-ai`). Both use tool-calling against an 8-table allow-list (`products`, `crm_leads`, `profiles`, `tactical_tasks`, `tactical_contracts`, `whatsapp_messages`, `site_settings`, `breeders`).
- **Genealogy / Genetic Evaluation parsing**: [src/lib/genealogy-parser.ts](src/lib/genealogy-parser.ts) and [src/lib/avaliacao-genetica-parser.ts](src/lib/avaliacao-genetica-parser.ts) parse PDFs via `pdf-parse` and back the batch endpoints under `/api/parse-*`.
- **CRM Kanban**: built with `@dnd-kit` — drag updates the `position` field in Supabase in real time.
- **Deep-link URL params (admin panel)**: telas com aba+detalhe usam `useSearchParams`/`router.replace` (não `push`) como fonte de verdade para o estado visível, permitindo compartilhar a URL exata. Aba default não emite param (mantém URL limpa). Convenções:
  - `/leiloes/fechamento?id=<uuid>` — modal de detalhe ([src/app/web-admin/(dashboard)/leiloes/FechamentoView.tsx](src/app/web-admin/(dashboard)/leiloes/FechamentoView.tsx)).
  - `/whatsapp?tab=<inbox|fluxo|templates|campanhas|metricas|conexao>` — `inbox` é default ([src/app/web-admin/(dashboard)/whatsapp/page.tsx](src/app/web-admin/(dashboard)/whatsapp/page.tsx)).
  - `/projetos?view=<kanban|gantt|whiteboard|dashboard|members>&task=<uuid>` — `kanban` é default. Modal "nova tarefa" é estado local, não vai pra URL ([src/components/admin/kanban/KanbanBoard.tsx](src/components/admin/kanban/KanbanBoard.tsx)).
  - `/crm?view=<qualificacao|kanban|configuracoes>&lead=<uuid>` — `qualificacao` é default. Modal "novo lead" é estado local ([src/components/admin/crm/CRMDashboardClient.tsx](src/components/admin/crm/CRMDashboardClient.tsx)).
  - Todas as páginas que consomem `useSearchParams` envolvem o cliente em `<Suspense>` (Next 16 exige para build estático).
  - IDs inexistentes (registro deletado) não quebram — modal fica fechado, página carrega normal.
- **Paginação compartilhada**: [src/components/admin/Pagination.tsx](src/components/admin/Pagination.tsx) fornece controles `« ‹ 1 2 3 › »` + dropdown "Por página" (default `25 / 50 / 100 / 200`). Quem consome controla `page` e `pageSize` por props. Usado em `/leads` ([CRMLeadsView](src/components/admin/crm/CRMLeadsView.tsx)) e na aba Qualificação do CRM ([CRMQualificacaoView](src/components/admin/crm/CRMQualificacaoView.tsx)).
- **Global search**: `/api/search?q=...` returns categorized hits (`lead`, `product`, `leilao`, `fechamento`, `task`, `breeder`) for the spotlight UI in [src/components/admin/GlobalSearch.tsx](src/components/admin/GlobalSearch.tsx).
- **Analytics**: dois provedores em paralelo no painel `/web-admin/analytics`. (1) **GA4** via `@google-analytics/data` com service account (`GOOGLE_SERVICE_ACCOUNT_JSON` + `GOOGLE_GA4_PROPERTY_ID`, fallback `483341191`) — alimenta histórico de acessos, tempo médio, top páginas, canais de tráfego. Server actions em [src/actions/analytics.ts](src/actions/analytics.ts). (2) **PostHog** via HogQL Query API (`POSTHOG_PERSONAL_API_KEY`, project `430113` hardcoded) — alimenta KPIs custom (pageviews, visitantes únicos, sessões, replays), eventos custom, browsers e devices. Server actions em [src/actions/posthog.ts](src/actions/posthog.ts). Se `POSTHOG_PERSONAL_API_KEY` não estiver setada, a seção PostHog degrada pra placeholder com link pro projeto. Ver seção dedicada *PostHog — instrumentação* abaixo.
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
Dashboard segments under `(dashboard)`: `agenda`, `agendamentos`, `analytics`, `animal-availability`, `biblioteca-midia`, `breeders`, `catalogos-whatsapp`, `central-bela-vista`, `contratos`, `crm`, `email`, `genealogia`, `ia`, `leads`, `leiloes`, `lotes-doadoras`, `lotes-touros`, `okr`, `products`, `projetos`, `reservas`, `settings`, `users`, `vendas-marketing`, `whatsapp`. Auth pages live under `(auth)`. Server actions in [src/app/web-admin/actions/](src/app/web-admin/actions/).

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
| `/api/whatsapp/central/flows` | GET, POST | Lista fluxos nomeados (com `settings`, `last_activated_at`, `created_by`) / cria novo (com `clone_from` opcional pra duplicar). |
| `/api/whatsapp/central/flows/[id]` | GET, PUT, DELETE | Detalhe + grafo + settings / edita `name`/`description`/`graph`/`settings` (qualquer combinação) / deleta. PUT valida via `validateGraph()`. GET auto-cura grafo vazio escrevendo `buildDefaultGraph()`. Bloqueia delete do ativo e do último restante. |
| `/api/whatsapp/central/flows/[id]/activate` | POST | Torna esse fluxo o único ativo + grava `last_activated_at`. Valida o grafo antes (não deixa colocar fluxo quebrado em produção). |
| `/api/whatsapp/group-task` | POST | `/tarefa <desc>` from a group → creates `tactical_tasks` card with WhatsApp origin fields. |
| `/api/whatsapp/group-decision` | POST | `/decisao <desc>` from a group → inserts into `tactical_decisions`. |
| `/api/whatsapp/group-risk` | POST | `/risco <title>` from a group → inserts into `tactical_risks` with default `media`/`medio`. |
| `/api/whatsapp/group-ai` | POST | `/ia <pergunta>` from a group → GLM-4.7 with tool-calling answers via tables; reply pushed back to the group by the VPS. |

All four group endpoints validate `x-webhook-secret: WHATSAPP_GROUP_TASK_SECRET` and call `revalidatePath('/web-admin/projetos')` (where applicable).

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

### Central de E-mail Marketing
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/email/central/templates` | GET, POST | Lista/cria templates HTML. POST gera `slug` a partir do título se não informado. |
| `/api/email/central/templates/[id]` | PUT, DELETE | Atualiza ou arquiva template (DELETE = soft delete via `archived=true` pra preservar referências em campanhas concluídas). |
| `/api/email/central/campaigns` | GET, POST | Lista campanhas com contadores agregados (`steps_count`, `stopped_count`) / cria campanha em rascunho. |
| `/api/email/central/campaigns/[id]` | GET, PUT, DELETE | Detalhe + recipients + steps. PUT/DELETE só em rascunho. |
| `/api/email/central/campaigns/[id]/steps` | GET, POST | Lista/cria passos (1+) da sequência. Só em rascunho. |
| `/api/email/central/campaigns/[id]/steps/[stepId]` | PUT, DELETE | Edita ou remove um passo (reordena os sucessores). Só em rascunho. |
| `/api/email/central/campaigns/[id]/send` | POST | Resolve segmento → materializa em `email_campaign_recipients` (com `current_step=1`, `next_send_at` se houver follow-up) → envia passo 0 sequencialmente via SMTP (throttle 800ms). |
| `/api/email/central/campaigns/preview` | POST | Pré-visualiza público (count + amostra) sem materializar. |
| `/api/email/central/campaigns/cron` | GET | Cron externo (mesmo padrão WhatsApp). Processa recipients com `next_send_at <= now()` em lotes de **30** (conservador pro SMTP Hostinger). Aplica regras de parada, envia próximo step pelo SMTP, avança `current_step`. Auth via `Authorization: Bearer ${CRON_SECRET}` OU `x-webhook-secret: ${WHATSAPP_GROUP_TASK_SECRET}`. |
| `/api/email/central/metrics` | GET | Métricas operacionais (campanhas totais/ativas, enviados/falhas 7d, opt-outs, leads com e-mail). |
| `/api/email/unsubscribe` | GET | **Público.** Recebe `?email=...&token=...` (HMAC SHA-256 com `WHATSAPP_GROUP_TASK_SECRET`). Valida o token e marca `email_optouts` + `crm_leads.optout_email=true`. Renderiza HTML simples de confirmação. |

### Agendamentos (Calendly × Google Calendar)
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/agendamentos` | GET, POST | Lista (filtros: status, source, lead_id, q, from/to, limit/offset) e cria manual (`source='manual'`). |
| `/api/agendamentos/[id]` | PATCH, DELETE | Atualiza status, lead, responsável, notas, tags. DELETE remove local — se ainda existir no Google, próximo sync recria. |
| `/api/agendamentos/sync` | GET (cron), POST (admin) | Puxa eventos do Google Calendar (`site_settings.agendamentos_calendar.google_calendar_id`) e materializa em `agendamentos`. GET aceita `Authorization: Bearer ${CRON_SECRET}` OU `x-webhook-secret: ${WHATSAPP_GROUP_TASK_SECRET}`. |
| `/api/agendamentos/settings` | GET, PUT | CRUD da chave `site_settings.agendamentos_calendar` (ID do calendar, link Calendly, janela de sync, vínculo automático). GET também devolve `service_account_email` e `google_configured` pro painel mostrar. |

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
| `posthog-client.ts` | Helper client-side: `trackEvent(name, props)`, `identifyLead(distinctId, traits)`, `resetPosthog()`. `EventName` é o type literal das chaves custom — adicione um novo evento aqui antes de chamá-lo. |
| `email-marketing.ts` | Camada de envio de campanhas por e-mail. `sendCampaignEmail()` faz o envio respeitando opt-out e loga em `email_messages`. `renderEmail()` interpola `{nome}`, `{email}` e `{{UNSUBSCRIBE_URL}}`. `signUnsubscribeToken()`/`verifyUnsubscribeToken()` geram/validam tokens HMAC-SHA256 com `WHATSAPP_GROUP_TASK_SECRET`. `setEmailOptout()` marca opt-out (cache + lead). `addDelay()`/`firstName()`/`renderTemplate()` espelham os helpers do WhatsApp. |
| `email-segment.ts` | `resolveEmailSegment()` — resolve JSON de segmento em query Supabase contra `crm_leads`. Sempre aplica `optout_email=false` + `email NOT NULL` + email contém `@`. Mesmos filtros do WhatsApp (`interesse_principal`, `stage`, `status`, `tags_whatsapp_includes`, `updated_after`). |
| `email-campaign-step.ts` | `resolveEmailStepContent()` — mescla step + template (step sobrescreve campos vazios do template) e retorna `{subject, body_html, body_text, template_slug}` pra renderização. |
| `posthog-snippet.ts` | `buildPosthogSnippet()` / `injectPosthogIntoHtml(html)` — geram o `<script>` PostHog para injetar nos HTMLs estáticos da LP que são servidos por route handlers (não passam pelo `PostHogProvider` React). |
| `google-calendar.ts` | Cliente Google Calendar v3 via JWT (service account `GOOGLE_SERVICE_ACCOUNT_JSON`). `listCalendarEvents()`, `getCalendarEvent()`, `isGoogleCalendarConfigured()`. Escopo `calendar.readonly`. |
| `agendamentos-sync.ts` | `syncAgendamentos()` — puxa eventos do Google Calendar configurado, parseia invitee (e-mail/nome dos attendees, telefone via heurística sobre a descrição do Calendly), faz match com `crm_leads` por e-mail e telefone (`phoneVariants()`) e upserta em `agendamentos` por `google_event_id`. Preserva campos editados manualmente (status já fechado, lead_id já vinculado, responsável). `loadAgendamentosSettings()` lê `site_settings.agendamentos_calendar` com defaults. |

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

# Analytics (PostHog — US Cloud, projeto 430113)
NEXT_PUBLIC_POSTHOG_KEY           # Project token (público). Sem ele o SDK no browser não inicializa.
NEXT_PUBLIC_POSTHOG_HOST          # default: https://us.i.posthog.com
POSTHOG_PROJECT_ID                # default: 430113 (hardcoded no fallback de src/actions/posthog.ts)
POSTHOG_PERSONAL_API_KEY          # Personal API Key com escopo "Performing analytics queries". Sem ela o painel /web-admin/analytics mostra placeholder; o SDK no site segue capturando normalmente.

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

### Central WhatsApp — Fluxo default (welcome v2: convite ao bate-papo)

A partir de 2026-05-19, o welcome padrão passou a ser um convite direto pra
um **bate-papo com o Matheus** (chamada agendada via Calendly) — o menu de
interesses passou a ser **opcional**, mostrado só quando o lead recusa a
conversa. Mudança aplicada via [database/seed_welcome_bate_papo_v1.sql](database/seed_welcome_bate_papo_v1.sql).

Os templates seguem em primeira pessoa do Matheus (decisão de 2026-05-12,
[database/seed_welcome_default_matheus_1p.sql](database/seed_welcome_default_matheus_1p.sql)).

**Welcome `welcome-default`** — apresentação do Matheus + 3 frentes da empresa
(Aceleradora de Touros, Central de Embriões, Assessoria em Leilões) + convite
pra um bate-papo de 15-20 min por chamada, com 2 opções:

```
1 — Sim, quero agendar uma conversa com você
2 — Por enquanto prefiro só receber informações por aqui
```

**Estado da máquina via tags** (a Central é stateless por design, então o
estado da conversa vive em `crm_leads.tags_whatsapp` lido pelo classifier):

| Tag                                  | Quando é setada                                                         | O que muda no classifier                                                  |
|--------------------------------------|--------------------------------------------------------------------------|---------------------------------------------------------------------------|
| `whatsapp:menu_enviado`              | Welcome v2 enviado pela lane "sem match" da inbound                     | Gate `welcome_eligible` para de disparar (não re-welcome)                 |
| `whatsapp:bate_papo_pendente`        | Welcome v2 enviado (via inbound OU via render-welcome do dispatchWelcome) | `BATE_PAPO_PENDENTE_NUMERIC_MAP` ativa: 1=human (sim agendar), 2=interest:interesse_amplo (só info) |
| `whatsapp:bate_papo_aceito`          | Lead respondeu "1" e recebeu o link Calendly                            | Documental — classifier não consulta                                       |
| `whatsapp:menu_interesses_v2`        | Lead respondeu "2" e recebeu o menu de interesses                       | Documental — depois de a tag `bate_papo_pendente` ser removida, dígitos 1-4 voltam ao `DEFAULT_NUMERIC_MAP` normal |

**Mapeamento numérico em estado "bate-papo pendente"** (`BATE_PAPO_PENDENTE_NUMERIC_MAP`):

| Tecla | `Classification`                                | Lane do grafo (fork)                                                                       |
|-------|-------------------------------------------------|--------------------------------------------------------------------------------------------|
| `1`   | `human`                                         | Após `apply_handoff`, gate `lead.is_bate_papo_pendente=true` → `bate-papo-aceito` (link Calendly) |
| `2`   | `interest` → `interesse_amplo`                  | Após `apply_interest`, gate `lead.is_bate_papo_pendente=true` → `bate-papo-recusado` (menu interesses) |

**Mapeamento numérico default** (`DEFAULT_NUMERIC_MAP` — usado depois que a tag
`bate_papo_pendente` foi removida pelo grafo, ou direto pra leads de audiência
sem essa tag):

| Tecla | `Classification`                                         | Template de triagem               |
|-------|----------------------------------------------------------|-----------------------------------|
| `1`   | `interest` → `semen`                                     | `triagem-semen`                   |
| `2`   | `interest` → `embrioes`                                  | `triagem-embrioes`                |
| `3`   | `interest` → `compra_venda_genetica`                     | `triagem-compra-venda-genetica`   |
| `4`   | `interest` → `interesse_amplo`                           | `triagem-interesse-amplo`         |

**Integração com `/web-admin/agendamentos`** — o template `bate-papo-aceito`
e o template manual `agendamento-link` mandam o **link curto público**
`https://formuladoboi.com/agendar` (rota em
[src/app/web-site/agendar/route.ts](src/app/web-site/agendar/route.ts)), e
não o slug interno do Calendly. A rota faz 302 pra URL real configurada em
`site_settings.agendamentos_calendar.calendly_event_url`, escondendo do
cliente que a conta gratuita do Calendly está sob um usuário pessoal
(`joaoeduardo-lp1`). Vantagens: (1) o cliente vê o domínio da Fórmula do Boi,
(2) trocar Calendly por outra ferramenta no futuro é uma alteração de
setting (não precisa reescrever template/mensagem), (3) UTMs/`?lead=` na URL
de entrada são preservadas e repassadas pro Calendly. Quando o lead reserva,
o evento aparece no Google Calendar configurado e o cron
`/api/agendamentos/sync` (a cada ~5 min) materializa em `agendamentos` com
auto-vínculo ao `crm_leads` por e-mail/telefone — não há criação manual de
registro no momento do envio do link. Ver seção *Agendamentos (Calendly ×
Google Calendar)*.

**Diretiva operacional (2026-05-19):** o bot **só** executa três fluxos —
(1) welcome no novo lead, (2) agendamento ao aceitar bate-papo, (3) registro
de interesse via menu. Qualquer outra inbound (estranho mandando mensagem
espontânea, lead pedindo "consultor" fora da janela do welcome, etc) vai
pro Inbox em **silêncio** pra que o Matheus trate manualmente. Demais
automações (follow-up, lembrete, broadcast) ficam pra campanhas.

**Como o grafo lida com o estado** (em [src/lib/whatsapp-flow-engine.ts](src/lib/whatsapp-flow-engine.ts)
`buildDefaultGraph()`):
1. Lane `unknown` (inbound espontâneo, mensagem não classificada): **silêncio
   direto**. NÃO dispara welcome automático. O welcome só sai quando o lead
   é cadastrado no CRM via LP/admin/Sheets e o `dispatchWelcome` chama
   `/api/whatsapp/render-welcome`.
2. Lane `human` (lead disse "consultor"/"Matheus"/etc OU respondeu "1" ao
   welcome v2): condition `lead.is_bate_papo_pendente` bifurca: true →
   `apply_handoff` + `add_tag bate_papo_aceito` + `remove_tag bate_papo_pendente`
   + envia `bate-papo-aceito` (link de agendamento). false → silêncio (Matheus
   trata pelo Inbox — não há mais mensagem genérica `consultor-handoff`).
3. Lane `interest` (lead respondeu "2" ao welcome, OU clicou 1-4 no menu de
   recusa, OU mandou palavra-chave de interesse): após `apply_interest`,
   condition `lead.is_bate_papo_pendente` bifurca: true → `add_tag menu_interesses_v2`
   + `remove_tag bate_papo_pendente` + envia `bate-papo-recusado` (menu de 4).
   false → envia triagem dinâmica (`triagem-{interesse}` — fluxo de registro
   de interesse normal).
4. `/api/whatsapp/render-welcome` aplica a tag `bate_papo_pendente` direto
   no lead quando o slug resolvido é `welcome-default` — cobre o caso de lead
   capturado em LP/admin/Sheets que recebe o welcome via `dispatchWelcome` no
   VPS (não passa pela engine).

**Para mudar o conteúdo das mensagens**: edite os bodies em
[database/seed_welcome_bate_papo_v1.sql](database/seed_welcome_bate_papo_v1.sql)
(idempotente — `ON CONFLICT (slug) DO UPDATE`). Se quiser voltar pro welcome
v1 (4 opções direto), reaplique [database/seed_welcome_default_matheus_1p.sql](database/seed_welcome_default_matheus_1p.sql)
e atualize o grafo ativo via UI pra remover os forks de `bate_papo_pendente`
(ou delete o fluxo ativo pra cair no `buildDefaultGraph` em código — mas hoje
ele inclui o welcome v2; o jeito limpo de reverter é via UI).

> Leads históricos que receberam o welcome antigo (menu 1..4 de interesses
> direto, ou welcome ainda mais antigo com 1..7) e respondem `3/4/5/6/7`
> caem em `unknown` no classifier — o bot fica em silêncio. Não é problema
> na prática porque o gate `welcome_eligible` impede re-welcome, e o operador
> atende manualmente pelo Inbox.

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

**Janela horária de automação**: parâmetro por fluxo (aba **Fluxo** →
Configurações → Parâmetros → "Restringir automação a um horário"). Quando
ligado, `/api/whatsapp/inbound` e `/api/whatsapp/render-welcome` devolvem
`{ silent: true, reason: 'outside_allowed_hours' }` se a hora local no
fuso configurado (default `America/Sao_Paulo`) estiver fora de
`[allowed_hours_start, allowed_hours_end]`. A janela suporta cruzar meia-
noite (ex.: `22:00` → `06:00`). Inbox segue logando inbound — operador
responde manualmente. Útil pra evitar disparo madrugada/domingo (anti-
bloqueio Baileys). Helper em [src/lib/whatsapp-flow-settings.ts](src/lib/whatsapp-flow-settings.ts).

**Múltiplos fluxos nomeados** (`whatsapp_flows`): a aba **Fluxo** tem
seletor no canto superior direito (mostra "Fluxo: Padrão ATIVO") e botão
**Configurações** abrindo modal com 3 abas — **Geral** (renomear,
descrição, status, metadados, ações ativar/duplicar/criar/deletar),
**Gatilhos** (lista os 5 tipos de trigger e quantos start nodes do grafo
cobrem cada um), **Parâmetros** (settings JSONB editável com badge
ativo/pendente por chave). Apenas UM fluxo é `is_active=true` por vez
(constraint UNIQUE parcial). Operador pode editar variantes em paralelo
(rascunhos) e trocar o ativo em 1 clique — o bot pega a mudança na
próxima inbound. Migrations: [database/whatsapp_flows.sql](database/whatsapp_flows.sql)
+ [database/whatsapp_flows_settings.sql](database/whatsapp_flows_settings.sql).

### Catálogos WhatsApp (segunda sessão Baileys)

Sessão independente da Central, no MESMO VPS mas em container separado.
Captura PDFs de catálogo postados em grupos selecionados e anexa
automaticamente ao leilão correspondente em `cronograma_leiloes`.

**Topologia no VPS** (não confunda com a Central):

| Recurso          | Central                          | Catálogos                                  |
|------------------|----------------------------------|--------------------------------------------|
| Container        | `formula_boi_whatsapp`           | `formula_boi_whatsapp_catalogs`            |
| Porta host       | 3001                             | 3002                                       |
| Auth folder      | `/opt/whatsapp-auth`             | `/opt/whatsapp-catalogs-auth`              |
| Código no VPS    | `/opt/whatsapp-server`           | `/opt/whatsapp-catalogs-server`            |
| Imagem           | `formula_boi_whatsapp_img`       | `formula_boi_whatsapp_catalogs_img`        |
| Número WhatsApp  | Sócio (comercial)                | Número dedicado (operacional)              |
| URL no Next.js   | `WHATSAPP_SERVER_URL`            | `WHATSAPP_CATALOGS_SERVER_URL` (default `http://localhost:3002`) |

**Fluxo de detecção** (VPS → Next.js):
1. `messages.upsert` em grupo `@g.us` cujo JID está em `monitoredJids` (sincronizado a cada 5 min via `GET /api/whatsapp-catalogos/active-groups`).
2. Filtra: `documentMessage` com mime `application/pdf` OU extensão `.pdf`.
3. `downloadMediaMessage` → buffer.
4. PUT no R2 sob `libmedia/catalogos-whatsapp/yyyy/mm/<uuid>_<file>.pdf`.
5. `POST /api/whatsapp-catalogos/webhook` com `{group_jid, group_name, sender_*, message_id, file_*, r2_key}`.

**Decisão de auto-anexo** (Next.js, [src/lib/whatsapp-catalogs.ts](src/lib/whatsapp-catalogs.ts)):
- Token-set similarity (normaliza acentos, remove stopwords, ignora ano).
- Candidatos restritos à janela `[hoje-7d, hoje+90d]` em `cronograma_leiloes`.
- Auto-anexo só se: `melhor_score >= 70` E `gap pro 2º >= 20` E leilão sem `catalogo_url` E flag global `whatsapp_catalogs_paused.paused = false`.
- Senão registra como `pending` / `ambiguous` / `no_match` em `whatsapp_catalog_detections`.

**Tabelas**:
- `whatsapp_catalog_groups` — JID, nome, slug, ativo (lido pelo VPS).
- `whatsapp_catalog_detections` — log de cada PDF + candidatos + status (`pending|matched|ambiguous|no_match|attached|manual`) + R2 key.
- `cronograma_leiloes` ganhou `catalogo_url`, `catalogo_anexado_em`, `catalogo_origem`.
- `site_settings.whatsapp_catalogs_paused` — pausa global do auto-anexo (`{paused, paused_at, paused_by}`).

Migration única: [database/whatsapp_catalogs.sql](database/whatsapp_catalogs.sql).

**Página admin** [src/app/web-admin/(dashboard)/catalogos-whatsapp/page.tsx](src/app/web-admin/(dashboard)/catalogos-whatsapp/page.tsx) tem 3 abas (deep-link via `?tab=`):
- **Detecções** (default, sem `?tab`) — lista todas as detecções, filtros por status, busca, modal de revisão com candidatos top-5 e busca manual em `cronograma_leiloes` pra anexo forçado.
- **Grupos monitorados** — CRUD de `whatsapp_catalog_groups`. Por **privacidade**, a UI nunca lista os grupos que o número da sessão participa (o número é pessoal do dono). Para descobrir o JID de um grupo novo, fazer `curl http://localhost:3002/groups` direto no VPS via SSH; nenhum endpoint público expõe essa lista.
- **Conexão** — status, QR code (proxy do VPS:3002/status) e toggle de pausa global.

**Endpoints Next.js** (`/api/whatsapp-catalogos/*`):

| Route                                       | Métodos | Função |
|---------------------------------------------|---------|--------|
| `/status`                                   | GET     | Proxy `GET ${WHATSAPP_CATALOGS_SERVER_URL}/status` |
| `/active-groups`                            | GET     | Lido pelo VPS (header `x-webhook-secret`) — JIDs ativos a monitorar |
| `/webhook`                                  | POST    | VPS → Next.js: PDF detectado. Decide auto-anexar ou registrar pendente |
| `/groups`                                   | GET,POST | CRUD `whatsapp_catalog_groups` |
| `/groups/[id]`                              | PUT,DELETE | Editar/remover grupo |
| `/detections`                               | GET     | Lista detecções (filtros: status, group_jid, q, limit/offset) |
| `/detections/[id]`                          | GET,DELETE | Detalhe (com `file_url` presigned) e remoção |
| `/detections/[id]/attach`                   | POST    | Anexo manual `{cronograma_id, overwrite?}` |
| `/cronograma-search`                        | GET     | `?q=` — busca leilões pro modal de anexo manual |
| `/pause`                                    | GET,PUT | Toggle `whatsapp_catalogs_paused` |

**Variáveis de ambiente novas** (definidas no `.env` do VPS pelo deploy script):
- `WHATSAPP_CATALOGS_SERVER_URL` (no Next.js) — default `http://localhost:3002`.
- VPS: `WHATSAPP_CATALOGS_SERVER_PORT`, `AUTH_DIR`, `NEXT_JS_URL`, `WHATSAPP_GROUP_TASK_SECRET` (mesmo da Central), `R2_*`, `POLL_GROUPS_EVERY_MS`.

**Deploy / operação**:
- Script idempotente: `python scripts/deploy-whatsapp-catalogs-server.py` (lê `VPS_PASSWORD`, `NEXT_JS_URL`, `WHATSAPP_GROUP_TASK_SECRET`, `R2_*` do ambiente). Faz upload via SFTP, escreve `.env` no VPS com `chmod 600`, build da imagem e `docker run` sem nunca tocar no container Central.
- `docker compose --env-file .env.local up -d --build` localmente sobe os DOIS containers (Central e Catálogos).
- Para iniciar pareamento do novo número: container roda → aba **Conexão** mostra QR → escanear pelo número operacional. Auth persiste no volume `/opt/whatsapp-catalogs-auth`.

### PostHog — instrumentação

PostHog (US Cloud, projeto **430113**, host `us.i.posthog.com`) instrumenta o
**site público** (`/web-site`) e a **LP grupo VIP** (`/web-lp`). Por privacidade
do operador interno, **não** roda em `admin.*`, `erp.*` nem `adminbula.*`.

**Topologia client-side:**

| Surface                                      | Como o PostHog é carregado |
|---------------------------------------------|----------------------------|
| `/web-site/**` (marketplace React)          | [`PostHogProvider`](src/providers/PostHogProvider.tsx) montado em [src/app/web-site/layout.tsx](src/app/web-site/layout.tsx). Inicializa o SDK no `useEffect`, captura `$pageview` manual em cada mudança de pathname/searchParams. |
| `/web-lp/page.tsx` (Grupo VIP React)        | Mesmo `PostHogProvider`, montado em [src/app/web-lp/layout.tsx](src/app/web-lp/layout.tsx). |
| HTMLs estáticos da LP (route handlers)      | Snippet inline injetado em runtime via [`injectPosthogIntoHtml()`](src/lib/posthog-snippet.ts). Aplicado em: `/grupo-vip/obrigado`, `/grupo-vip/obrigado-mql`, `/grupo-vip/atacante-matinha` e os dois "obrigado" do atacante-matinha. |
| `admin.*`, `erp.*`, `adminbula.*`           | **Nada.** Nenhum dos layouts carrega o `PostHogProvider`. |

**Configuração padrão do SDK** (em `PostHogProvider.tsx`):
- `person_profiles: 'identified_only'` — só cria perfil de pessoa quando chamamos `identify()`. Anônimos não geram registros faturáveis.
- `capture_pageview: false` + tracker manual — controlamos o evento `$pageview` pra que ele dispare em cada navegação client-side do App Router (o auto do PostHog perde transições).
- `autocapture: true` — clicks, form submits, page leaves.
- `session_recording: { maskAllInputs: true, maskTextSelector: '[data-ph-mask]' }` — todos os inputs mascarados; pra mascarar texto também, basta colocar `data-ph-mask` no elemento.

**Eventos custom já cabeados** (declarados em [`EventName`](src/lib/posthog-client.ts) — adicionar uma chave nova lá antes de chamar `trackEvent()`):

| Evento                       | Onde dispara                                          | Props relevantes |
|-----------------------------|--------------------------------------------------------|------------------|
| `lp_form_submit`            | [GrupoVipQuiz](src/components/lp/GrupoVipQuiz.tsx) — submit final do quiz. Também chama `identifyLead(tel, {...})` antes. | `mql`, `quantidade_cabecas`, `uf`, `momento_pecuaria`, UTMs |
| `whatsapp_cta_click`        | [WhatsappSection](src/components/WhatsappSection.tsx) — CTA "Solicitar acesso pelo WhatsApp" da home. | `location`, `destination` |
| `lote_view`                 | [LoteViewTracker](src/components/site/LoteViewTracker.tsx), incluído em [/web-site/lote/[id]/page.tsx](src/app/web-site/lote/[id]/page.tsx). | `product_id`, `product_name`, `kind`, `category`, `central`, `unit_price` |
| `lote_reserva_click`        | [ReservaButton](src/components/site/ReservaButton.tsx) — botão "Reservar doses/embriões". | mesmas props do `lote_view` |
| (reservados, ainda não emitidos) | `checkout_semen_submit`, `checkout_embriao_submit`, `login_attempt`, `login_success`, `signup_attempt`, `signup_success` | Já tipados; cabear nos formulários quando necessário. |

`identifyLead(distinctId, traits)`: usa o telefone como `distinctId` (mesma chave do CRM), permitindo casar replay com lead no Supabase manualmente.

**Painel admin `/web-admin/analytics`** ([page.tsx](src/app/web-admin/(dashboard)/analytics/page.tsx)):
- Mostra duas seções em paralelo — **GA4** (server actions em [src/actions/analytics.ts](src/actions/analytics.ts)) e **PostHog** ([src/actions/posthog.ts](src/actions/posthog.ts)).
- Server actions PostHog consultam a **HogQL Query API** (`POST /api/projects/{id}/query/`) com `POSTHOG_PERSONAL_API_KEY`.
- Host de queries é resolvido a partir de `NEXT_PUBLIC_POSTHOG_HOST` (troca `*.i.posthog.com` → `*.posthog.com` em `apiHostForQueries()` — a Query API vive no host "app", não no host de ingestion).
- `POSTHOG_PROJECT_ID` tem default hardcoded **`430113`** — não precisa estar nas envs da Vercel.
- Se `POSTHOG_PERSONAL_API_KEY` estiver ausente ou inválida, `isPosthogConfigured()` devolve `false` e o painel renderiza um placeholder com link direto pro projeto PostHog. O SDK no site segue funcionando normalmente — só o painel admin que fica em "modo somente-captura".
- Janela fixa: últimos 30 dias.

**Variáveis de ambiente:**
- `NEXT_PUBLIC_POSTHOG_KEY` — project token público. Sem ele, o SDK no browser não inicializa (o `PostHogProvider` faz noop).
- `NEXT_PUBLIC_POSTHOG_HOST` — default `https://us.i.posthog.com`.
- `POSTHOG_PROJECT_ID` — default `430113` no código; não precisa setar.
- `POSTHOG_PERSONAL_API_KEY` — só em **Production** na Vercel (marcada Sensitive). Escopo no PostHog: *Performing analytics queries* + acesso ao "Default project". **Mudança de env var na Vercel exige redeploy** — ela só é injetada em deploys novos.

**Pitfall conhecido:** quando a `POSTHOG_PERSONAL_API_KEY` foi adicionada à Vercel, o painel continuou em modo placeholder até disparar um redeploy (ou commit + push). A Vercel não re-injeta envs no deploy ativo. Empty commit em main funciona, mas push direto pra `main` está protegido — usar dashboard → Deployments → ⋯ → Redeploy é mais limpo.

**Adicionar um evento novo:**
1. Adicione a chave no type `EventName` em [src/lib/posthog-client.ts](src/lib/posthog-client.ts).
2. Chame `trackEvent('nome_do_evento', { ...props })` no componente cliente.
3. (Opcional) Faça `identifyLead(distinctId, traits)` antes se quiser que o replay/funil associe ao lead.
4. Eventos aparecem no painel admin em até ~1 min (cache da HogQL).

### Central de E-mail Marketing

Espelha 1-pra-1 a arquitetura da Central WhatsApp (`whatsapp_campaigns`/`_steps`/`_recipients`/`_templates`) mas pra e-mail. Página admin em `/web-admin/email` com 3 abas (deep-link via `?tab=`):

- **Campanhas** (default, sem `?tab`) — lista campanhas, modal de criação/edição com segmento (interesse_principal multi-select, stage, audience_tag), preview do público, regras de parada e sequência multi-step. CRUD em `/api/email/central/campaigns/*`.
- **Templates** — CRUD de templates HTML reutilizáveis. Editor com textarea pro `body_html` + preview via `<iframe srcDoc>`. Suporta `{nome}`, `{email}` e `{{UNSUBSCRIBE_URL}}`.
- **Métricas** — totais (campanhas, sent_7d, failed_7d, opt-outs, leads c/ e-mail) + taxa de entrega 7d. Avisa o operador sobre o limite Hostinger.

**Por que SMTP Hostinger (não Resend/SES):** decisão explícita do operador em 2026-05-19 — "precisa ser pelo provedor da Hostinger mesmo". Trade-offs aceitos:
- Limite ~100-300 e-mails/dia (Hostinger compartilhado).
- Sem webhook de bounce/open/click — métricas limitadas a "tentou enviar / falhou no SMTP" (sem confirmação real de entrega).
- IP/reputação compartilhado com outros sites Hostinger — risco de spam se a lista azedar.

**Implicações no design:**
- Cron `/api/email/central/campaigns/cron` processa em lotes pequenos (BATCH_SIZE=30, 800ms entre envios). Configurar cron externo (cron-job.org / GitHub Actions) a cada 5-10 min, com `x-webhook-secret: ${WHATSAPP_GROUP_TASK_SECRET}` (mesmo segredo do WhatsApp).
- O painel **Métricas** mostra um aviso permanente sobre o limite. Pra listas grandes (> 100), o operador divide em múltiplas campanhas escalonadas.
- `email_messages` é só **outbound** — Hostinger não dá inbound webhook. Pra acompanhar respostas, operador usa a caixa de entrada IMAP direto (contato@formuladoboi.com).

**Templates seed** (em [database/central_email_marketing.sql](database/central_email_marketing.sql)):
- `welcome-email-default` — boas-vindas voz Matheus 1ª pessoa.
- `newsletter-base` — template base de newsletter.
- `aviso-leilao-email` — aviso de leilão com CTA pro catálogo.

Todos têm `{{UNSUBSCRIBE_URL}}` no rodapé. Se o operador esquecer, [src/lib/email-marketing.ts](src/lib/email-marketing.ts) injeta um rodapé padrão automaticamente antes de `</body>`.

**Unsubscribe (LGPD):** endpoint **público** `/api/email/unsubscribe?email=...&token=...` — o token é HMAC-SHA256 do e-mail normalizado, assinado com `WHATSAPP_GROUP_TASK_SECRET`. Validação em tempo constante (`timingSafeEqual`). Quando válido: insere em `email_optouts`, marca `optout_email=true` em todos os leads com aquele e-mail, retorna HTML simples confirmando.

**Opt-out vs WhatsApp:** opt-outs são **independentes** entre canais. Um lead pode estar `optout_whatsapp=true` mas `optout_email=false` (e vice-versa) — útil pra reativação por outro canal quando o lead pediu pra parar em só um.

**Tabelas:**
- `email_templates` — biblioteca (slug único).
- `email_campaigns` — campanha (passo 0 + segmento + regras de parada).
- `email_campaign_steps` — passos 1+ (follow-up).
- `email_campaign_recipients` — destinatários materializados ao disparar (com `current_step`, `next_send_at`).
- `email_optouts` — cache rápido por e-mail (PK = email lowercased).
- `email_messages` — log de cada envio (sent/failed).

**Variáveis de ambiente** (mesmas do `src/lib/email.ts` já existentes):
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- `WHATSAPP_GROUP_TASK_SECRET` — usado pra assinar tokens de unsubscribe E autorizar o cron de e-mail (reaproveita o segredo já existente).
- `NEXT_PUBLIC_SITE_URL` — base do link de unsubscribe (fallback `https://formuladoboi.com`).

**Pitfall conhecido:** se você editar template em `email_templates` enquanto uma campanha está com `status='enviando'`, o cron pega a versão NOVA do template no próximo step. Isso é intencional (operador pode corrigir typo em campanha rolando), mas vale lembrar.

**Adicionar uma campanha em código (programaticamente):**
1. INSERT em `email_campaigns` com `status='rascunho'`.
2. (Opcional) INSERT em `email_campaign_steps` pra cada follow-up.
3. POST em `/api/email/central/campaigns/[id]/send` (Admin auth) — materializa recipients e dispara passo 0.
4. Cron pega o resto automaticamente.

### Agendamentos (Calendly × Google Calendar)

A página `/web-admin/agendamentos` lista reuniões marcadas via Calendly Free. O
plano gratuito do Calendly **não** dá Personal Access Token, webhooks nem
redirect após reserva — então fazemos a ponte pelo Google Calendar, que é o
único integrador grátis nativo do Calendly.

**Arquitetura (sem APIs pagas):**
1. Calendly Free cria os eventos no Google Calendar configurado pelo dono da
   conta (na própria conta Calendly: Integrations → Calendar Connections).
2. O operador compartilha esse calendário com o e-mail da nossa service
   account (campo `client_email` do `GOOGLE_SERVICE_ACCOUNT_JSON`, mesma usada
   em GA4/Sheets) com permissão "Ver detalhes de todos os eventos".
3. Cron externo (cron-job.org / GitHub Actions, a cada ~5min) chama
   `/api/agendamentos/sync` → lê eventos com [src/lib/google-calendar.ts](src/lib/google-calendar.ts)
   (escopo `calendar.readonly`) → parseia invitee e materializa em
   `agendamentos` ([src/lib/agendamentos-sync.ts](src/lib/agendamentos-sync.ts)).
4. Idempotência por `google_event_id` UNIQUE. Cancelamentos vêm como
   `status: 'cancelled'` no Google e a gente seta `status='cancelado'` aqui.

**Parsing do invitee:**
- E-mail: do primeiro `attendee` que não é `organizer/self`. Fallback: regex
  no `description`.
- Nome: `attendee.displayName`, fallback no padrão "Tipo - Nome" do summary
  do Calendly.
- Telefone: heurística sobre a descrição — procura `Phone call:`,
  `Phone number:`, `Telefone:`, `Celular:` ou `WhatsApp:` seguido de número.
  Depois normaliza com `normalizePhone()` (com DDI 55).
- Detecção de Calendly: marcadores na description (`calendly.com`,
  `Event Type:`, `Invitee:` etc) → marca `source='calendly'`, caso
  contrário `source='google'` (evento criado direto no Calendar).

**Auto-vínculo ao CRM:** busca em `crm_leads` por e-mail (`auto_link_lead_by_email`)
e depois por telefone via `phoneVariants()` (`auto_link_lead_by_phone`). Quando
o operador vincula manualmente (Modal → "Vincular ao lead"), o sync seguinte
preserva esse vínculo — não sobrescreve mesmo se mudar attendee no Calendly.

**Estados preservados:** se o operador marcou `concluido`, `nao_compareceu`
ou `confirmado`, o sync seguinte preserva esses estados (só pode evoluir pra
`cancelado` se o Google sinalizar cancelamento).

**Settings em `site_settings.agendamentos_calendar`** (JSONB):
- `google_calendar_id` — e-mail do dono (calendar primary) OU ID
  `xxxx@group.calendar.google.com` (calendar secundário). Pegar em Google
  Calendar → Configurações do calendário → "Integrar calendário".
- `calendly_event_url` — link público do Calendly que o bot WhatsApp manda.
- `default_responsible_member_id` — UUID em `tactical_members` (opcional).
- `auto_link_lead_by_email`, `auto_link_lead_by_phone` — flags.
- `sync_window_past_days` (default 7), `sync_window_future_days` (default 90).

**Cron externo (não usar Vercel Hobby cron — não permite sub-diário):**
```
GET https://admin.formuladoboi.com/api/agendamentos/sync
Header: x-webhook-secret: ${WHATSAPP_GROUP_TASK_SECRET}
```

**WhatsApp ⇄ agendamento:** o operador (ou um nó `send_template` futuro no
fluxo) envia o template `agendamento-link` (slug seedado em
[database/seed_agendamento_template.sql](database/seed_agendamento_template.sql))
quando o lead aceita marcar um horário. O link contém UTM `utm_content` com
o `lead_id` opcional — mesmo sem PAT do Calendly, o e-mail do invitee
normalmente já casa via auto-vínculo.

**Limitações honestas (Calendly Free):**
- Latência de ~5min entre o lead agendar e o registro aparecer no admin (o
  cron).
- Sem confirmação automática por WhatsApp após o agendamento (Calendly não
  dispara webhook no plano grátis). Lembretes ficam por conta do próprio
  Calendly (e-mail/SMS).
- Sem reagendamento automático: se o lead reagenda no Calendly, o evento
  ANTIGO é cancelado e um NOVO é criado — vão aparecer dois registros aqui
  (um com `status='cancelado'`, outro novo `agendado`). Aceitável.

**Migration:** [database/agendamentos.sql](database/agendamentos.sql) — cria a
tabela `agendamentos`, índices, RLS, trigger `updated_at` e o registro inicial
em `site_settings.agendamentos_calendar`. Reaplicar é idempotente.

**Pitfall conhecido:** se a `GOOGLE_SERVICE_ACCOUNT_JSON` da Vercel não tiver
o escopo Calendar habilitado (não é uma flag de escopo, mas de
compartilhamento — o calendário precisa estar compartilhado com o
`client_email` da service account), o sync retorna `403 Forbidden`. A
mensagem aparece no campo `errors` da resposta do endpoint.
