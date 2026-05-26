# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo. **Mantenha enxuto** — detalhe vive em [docs/](docs/README.md), lido sob demanda.

## Commands

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

Sem test suite. `playwright` é devDependency mas não está wired.

## Architecture (quick map)

**Fórmula do Boi** — plataforma de genética bovina (Nelore PO). Single Next.js 16 (App Router) na Vercel, deployment único multiplexado por subdomínio em [src/middleware.ts](src/middleware.ts):

| Subdomain | Route prefix | Purpose |
|-----------|-------------|---------|
| Root (`formuladoboi.com`, `www.*`) + `app.*` (legacy) | `/web-site` | Marketplace público (touros, matrizes, embriões, sêmen) |
| `/grupo-vip[/...]` no marketplace | `/web-lp[/...]` | Landing page (lead capture, funil "Pag-zap") |
| `lp.*` | (301 → `/grupo-vip`) | Subdomínio LP legado — middleware emite redirect permanente |
| `admin.*` | `/web-admin` | CRM, products, analytics, WhatsApp, tactical plan, OKRs |
| `erp.*` | `/web-erp` | ERP interno (financeiro, contábil, estoque, leilões) |
| `adminbula.*` | `/web-bula` | Plataforma Bula (CRM, fechamentos, cronograma) |

`/admin` e `/erp` no marketplace são 302-redirected pra `admin.*` / `erp.*`. Rotas `/api/*` bypassam rewrite. Middleware também chama `updateSession()` de [src/utils/supabase/middleware.ts](src/utils/supabase/middleware.ts) pra refresh de cookies.

## Core services

- **Next.js 16.1.4 / React 19.2.3 (Vercel)** — App Router, deploy automático no push pra `main`.
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) — PostgreSQL com RLS. Três clients: [server](src/utils/supabase/server.ts), [client](src/utils/supabase/client.ts), [middleware](src/utils/supabase/middleware.ts).
- **WhatsApp microservice** — Docker container em DigitalOcean VPS (`165.232.142.37:3001`) rodando Baileys. Existe porque Vercel serverless não mantém WebSocket persistente. Há também segunda sessão (porta 3002) pra catálogos. Detalhes em [docs/vps-operations.md](docs/vps-operations.md) e [docs/whatsapp-catalogos.md](docs/whatsapp-catalogos.md).
- **Cloudflare R2** (`aws4fetch`) — object storage S3-compatible; presigned URLs via `/api/r2/*`.
- **Leilão server** — serviço Python externo opcional via `/api/leilao/[...path]`.
- **GLM-4.7 (Zhipu AI)** — HTTP direto (sem SDK). Powers AI assistant e WhatsApp `/ia`. Tool-calling contra 8-table allow-list.
- **Asaas** — pagamentos brasileiros; só validação de webhook (`/api/asaas-webhook`).
- **ClickSign** — assinatura eletrônica. Client em [src/lib/clicksign.ts](src/lib/clicksign.ts).
- **PostHog** — Product Analytics + Session Replay. Roda **apenas** no site público e LP. Ver [docs/posthog.md](docs/posthog.md).

## Key data flows

- **LP lead capture** (`/grupo-vip`): `POST /api/lp/lead` → `crm_leads` (com UTM defaults) → Google Sheets `Pag-zap` → welcome WhatsApp. Redirect pra `/grupo-vip/obrigado`.
- **Google Sheets webhook**: `POST /api/webhooks/google-sheets` (valida `x-webhook-secret`) → `crm_leads` → VPS `/send` → `whatsapp_messages`.
- **WhatsApp Central**: VPS encaminha toda inbound pra `/api/whatsapp/inbound`. Classifier + grafo de fluxo. Ver [docs/whatsapp-central.md](docs/whatsapp-central.md) e [docs/whatsapp-flow-default.md](docs/whatsapp-flow-default.md).

## Conventions

- **Path alias**: `@/*` mapeia pra `./src/*`.
- **Migrations**: vivem em [/database/](database/) (~120 arquivos). Rodadas manualmente no Supabase, sem migration runner.
- **Deep-link URL params (admin)**: telas com aba+detalhe usam `useSearchParams`/`router.replace` (não `push`). Aba default não emite param. IDs inexistentes não quebram. Páginas que consomem `useSearchParams` envolvem o cliente em `<Suspense>` (Next 16 exige). Convenções por página:
  - `/leiloes/fechamento?id=<uuid>` — modal de detalhe.
  - `/whatsapp?tab=<inbox|fluxo|templates|campanhas|metricas|conexao>` — `inbox` default.
  - `/projetos?view=<kanban|gantt|whiteboard|dashboard|members>&task=<uuid>` — `kanban` default.
  - `/crm?view=<qualificacao|kanban|configuracoes>&lead=<uuid>` — `qualificacao` default.
- **Paginação**: [src/components/admin/Pagination.tsx](src/components/admin/Pagination.tsx) compartilhado, defaults `25 / 50 / 100 / 200`.
- **CRM Kanban**: `@dnd-kit`; drag atualiza `position` em tempo real.
- **Bula sistema**: `/web-bula/sistema` e `/login.html` são SPAs HTML estáticas servidas por `route.ts` que streama o arquivo.
- **Media library**: R2 com prefix `R2_PREFIX` (default `libmedia/`).

## Critical rules (NUNCA fazer)

- **Vercel auto-deploy**: nunca rodar `vercel --prod` manualmente. Push pra `main` já dispara deploy.
- **Catálogos WhatsApp**: a UI NUNCA pode listar grupos que o número da sessão participa (número é pessoal do dono). Pra descobrir JID novo, SSH no VPS e `curl http://localhost:3002/groups`.
- **`vercel env add` + trailing newline**: ao colar `WHATSAPP_GROUP_TASK_SECRET`, cuidado com newline appendado pela CLI — vira length 65 em vez de 64 e quebra todos os requests com 401.
- **Bot Central WhatsApp**: roda SÓ 3 fluxos (welcome / agendamento / registro de interesse). Tudo mais é silêncio. Demais automações são campanhas.
- **Mudança de env var na Vercel**: exige redeploy. Não é re-injetada em deploy ativo.

## Detalhes em `docs/`

Lidos sob demanda — não fique tentando segurar tudo em contexto:

- [docs/database.md](docs/database.md) — todas as tabelas Supabase
- [docs/api-routes.md](docs/api-routes.md) — todas as rotas `src/app/api/`
- [docs/env-vars.md](docs/env-vars.md) — variáveis de ambiente + pitfalls
- [docs/lib-reference.md](docs/lib-reference.md) — mapa de `src/lib/`
- [docs/vps-operations.md](docs/vps-operations.md) — VPS WhatsApp (SSH, docker, comandos de grupo, legacy flow config)
- [docs/whatsapp-central.md](docs/whatsapp-central.md) — Central WhatsApp end-to-end
- [docs/whatsapp-flow-default.md](docs/whatsapp-flow-default.md) — fluxo default atual (welcome v2 bate-papo + estado por tags)
- [docs/whatsapp-catalogos.md](docs/whatsapp-catalogos.md) — segunda sessão Baileys (catálogos)
- [docs/email-marketing.md](docs/email-marketing.md) — Central de E-mail (SMTP Hostinger)
- [docs/agendamentos.md](docs/agendamentos.md) — Calendly Free × Google Calendar
- [docs/posthog.md](docs/posthog.md) — instrumentação PostHog
