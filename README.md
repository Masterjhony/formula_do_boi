# Fórmula do Boi

Plataforma completa para gestão e venda de genética bovina Nelore PO — marketplace público, landing de captura, painel admin com CRM/WhatsApp/contratos, ERP interno e o sistema da Bula Assessoria.

> Documentação operacional detalhada (rotas, env vars, comandos do VPS, fluxos) está em [CLAUDE.md](./CLAUDE.md). Este README cobre o panorama. Para a Central WhatsApp em profundidade, veja [docs/whatsapp-central.md](./docs/whatsapp-central.md).

---

## Domínios

Tudo é servido por **um único deployment Next.js na Vercel**. O [middleware](src/middleware.ts) faz rewrite por subdomínio.

| Ambiente | Produção | Local |
|---|---|---|
| Marketplace (público) | `formuladoboi.com` (+ `www.*`, `app.*` legacy) | `localhost:3000` |
| Landing Page (Grupo VIP) | `formuladoboi.com/grupo-vip` | `localhost:3000/grupo-vip` |
| Painel Admin | `admin.formuladoboi.com` | `admin.localhost:3000` |
| ERP | `erp.formuladoboi.com` | `erp.localhost:3000` |
| Bula | `adminbula.formuladoboi.com` | `adminbula.localhost:3000` |
| WhatsApp Server (VPS) | `165.232.142.37:3001` | `localhost:3001` |

Mapeamento interno:

- `admin.*` → `/web-admin`
- `erp.*` → `/web-erp`
- `adminbula.*` → `/web-bula`
- `lp.*` → **301** para `formuladoboi.com/grupo-vip` (legado)
- domínio raiz / `www.*` / `app.*` → `/web-site`
- `/grupo-vip[/...]` no marketplace → `/web-lp[/...]`

---

## Funcionalidades por painel

### Marketplace (`/web-site`)
Catálogo público (touros, matrizes, embriões, sêmen), detalhes de lote, rankings, top criadores, agenda de leilões, checkout PIX.

### Landing Page Grupo VIP (`/web-lp` em `/grupo-vip`)
Formulário de captura → grava no `crm_leads` com UTM/atribuição, espelha em Google Sheets, dispara welcome via WhatsApp.

### Admin (`/web-admin`)
Auth via Supabase SSR. Segmentos sob `(dashboard)`:

| Segmento | O que faz |
|---|---|
| `analytics` | GA4 + métricas de leads |
| `crm` | Kanban de leads com drag-and-drop (dnd-kit) |
| `whatsapp` | **Central WhatsApp** — inbox conversacional, fluxo visual, templates, campanhas, métricas, QR/conexão. Ver [docs/whatsapp-central.md](./docs/whatsapp-central.md). |
| `products` | CRUD de bovinos (com parser de genealogia/avaliação genética via PDF) |
| `contratos` | Geração e envio de contratos via **ClickSign** (assinatura eletrônica) |
| `biblioteca-midia` | Upload/download direto em Cloudflare R2 (presigned URLs) |
| `breeders`, `genealogia` | Cadastro e visualização da genealogia |
| `projetos`, `okr`, `vendas-marketing` | Projetos (plano tático), OKRs, vendas/marketing |
| `leiloes`, `lotes-touros`, `lotes-doadoras` | Operação de leilões |
| `ia` | Assistente GLM-4.7 com tool-calling nas 8 tabelas |

### ERP (`/web-erp`)
Financeiro, contábil, estoque, leilões — fluxo interno de gestão.

### Bula (`/web-bula`)
Plataforma do braço **Bula Assessoria**: CRM próprio, leilões, fechamentos, cronograma. Combina rotas Next.js (`/api/bula/*`) com SPA legada servida estaticamente (`sistema.html`, `login.html`).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| UI | Tailwind v4, Framer Motion, dnd-kit, @xyflow/react (fluxo da Central) |
| Banco | Supabase (PostgreSQL + RLS + Auth) |
| Object storage | Cloudflare R2 (S3-compatible) via `aws4fetch` |
| WhatsApp | Baileys (`@whiskeysockets/baileys`) em VPS Docker — fora da Vercel por exigir WebSocket persistente |
| Pagamentos | Asaas (PIX/transfer + webhook) |
| Assinatura eletrônica | ClickSign API v1 |
| IA | GLM-4.7 (Zhipu) via HTTP, tool-calling |
| Email | Nodemailer/SMTP (Hostinger) — códigos de verificação e resets |
| Analytics | GA4 via service account (`@google-analytics/data`) |
| Deploy | Vercel (auto-deploy no push para `main`) + Docker (WhatsApp Server) |

---

## Convenções de UI (painel admin)

- **Deep-link via query string** — telas com aba+detalhe têm o estado visível na URL (`useSearchParams` + `router.replace`, nunca `push`). Permite compartilhar o ponto exato. Aba default não emite param (URL fica limpa). Convenções vigentes:

  | Tela | URL deep-linkável |
  |---|---|
  | Fechamento de leilão | `/leiloes/fechamento?id=<uuid>` |
  | Central WhatsApp (abas) | `/whatsapp?tab=<inbox\|fluxo\|templates\|campanhas\|metricas\|conexao>` |
  | Projetos | `/projetos?view=<kanban\|gantt\|whiteboard\|dashboard\|members>&task=<uuid>` |
  | CRM | `/crm?view=<qualificacao\|kanban\|configuracoes>&lead=<uuid>` |

  Páginas que consomem `useSearchParams` envolvem o cliente em `<Suspense>` (exigência do Next 16 para build estático). IDs inexistentes (registro deletado) não quebram — modal fica fechado.

- **Paginação compartilhada** — [src/components/admin/Pagination.tsx](src/components/admin/Pagination.tsx) fornece controles `« ‹ 1 2 3 › »` + dropdown "Por página" (default `25 / 50 / 100 / 200`). Plugado em `/leads` ([CRMLeadsView](src/components/admin/crm/CRMLeadsView.tsx)) e na aba Qualificação do CRM ([CRMQualificacaoView](src/components/admin/crm/CRMQualificacaoView.tsx)).

Detalhes em [CLAUDE.md → Notable Implementation Details](./CLAUDE.md#notable-implementation-details).

---

## Arquitetura de serviços

```
Vercel (Next.js)
┌──────────────────────────────────────────────┐
│  formuladoboi.com (marketplace + LP)         │
│  admin.* (Central WA, CRM, ERP-tactical)     │
│  erp.* (financeiro/contábil/estoque)         │
│  adminbula.* (Bula)                          │
│                                              │
│  /api/*  ─┬─► Supabase (PostgreSQL + RLS)    │
│           ├─► Cloudflare R2 (mídia)          │
│           ├─► ClickSign (contratos)          │
│           ├─► Asaas (pagamentos)             │
│           ├─► Zhipu GLM-4.7 (IA)             │
│           └─► VPS WhatsApp ◄────┐            │
└──────────────────────────────────────────────┘
                                  │ HTTP
                                  ▼
DigitalOcean Droplet 165.232.142.37
┌──────────────────────────────────────────────┐
│  Docker: formula_boi_whatsapp :3001          │
│  whatsapp-server.js (Baileys WebSocket)      │
│  Auth persistida em /opt/whatsapp-auth/      │
│  (volume Docker — NÃO em Supabase)           │
└──────────────────────────────────────────────┘
                                  │
                                  ▼
                            WhatsApp Web
```

O servidor WhatsApp é o **único componente** fora da Vercel — todo o resto roda serverless. A sessão Baileys é persistida em arquivos no volume Docker (`/opt/whatsapp-auth/`); reinicia o container sem perder a sessão. O Next.js só fala HTTP com o VPS, **não importa Baileys**.

> Documentação detalhada do servidor: [whatsapp-server/README.md](./whatsapp-server/README.md).

---

## Setup local

### Pré-requisitos
- Node.js 20+
- Docker (opcional — só para subir o servidor WhatsApp local)

### Subdomínios

Adicione ao `hosts` (`C:\Windows\System32\drivers\etc\hosts` no Windows, `/etc/hosts` no Linux/Mac):

```
127.0.0.1  admin.localhost
127.0.0.1  erp.localhost
127.0.0.1  adminbula.localhost
```

### Variáveis de ambiente

```bash
cp .env.example .env.local
# preencha as chaves (lista completa em CLAUDE.md → "Environment Variables")
```

### Rodar

```bash
npm install
npm run dev
```

Acesse:
- Marketplace: http://localhost:3000
- Admin: http://admin.localhost:3000
- ERP: http://erp.localhost:3000
- Bula: http://adminbula.localhost:3000

### Comandos

```bash
npm run dev      # dev server (porta 3000)
npm run build    # build de produção
npm run start    # serve build de produção
npm run lint     # ESLint
```

> Não há test runner configurado. `playwright` está em devDependencies mas sem script.

### WhatsApp local (somente quando o VPS estiver parado)

> ⚠️ O WhatsApp permite **uma sessão por número**. Subir servidor local em paralelo com o VPS de produção derruba a sessão da VPS com **erro 440**. Só rode local se a VPS estiver parada ou para testar com outro número.

```bash
# Docker (recomendado)
docker compose --env-file .env.local up -d whatsapp-server
docker logs -f formula_boi_whatsapp   # ver QR / logs

# Sem Docker (dev rápido)
cd whatsapp-server && npm install && node whatsapp-server.js
```

QR code aparece em `http://admin.localhost:3000/whatsapp` → aba **Conexão**.

---

## Estrutura de pastas

```
formula_boi/
├── src/
│   ├── app/
│   │   ├── web-site/          # Marketplace
│   │   ├── web-lp/            # Landing /grupo-vip
│   │   ├── web-admin/         # Painel admin
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/   # CRM, products, whatsapp, contratos, etc
│   │   │   └── actions/       # Server actions
│   │   ├── web-erp/           # ERP (financeiro, contábil, estoque, leilões)
│   │   ├── web-bula/          # Bula (CRM próprio, leilões, fechamentos)
│   │   └── api/               # Todas as rotas serverless (ver CLAUDE.md)
│   ├── components/            # UI reutilizável (admin/, central-whatsapp/, erp/...)
│   ├── lib/                   # Clients externos + lógica de negócio
│   │   ├── whatsapp.ts        # Proxy HTTP para o VPS
│   │   ├── whatsapp-central.ts        # Classificador, normalização, renderer
│   │   ├── whatsapp-flow-engine.ts    # Interpretador do grafo do bot
│   │   ├── whatsapp-segment.ts        # Resolução de segmentos de campanha
│   │   ├── clicksign.ts       # Cliente ClickSign API v1
│   │   ├── r2.ts              # Cloudflare R2 (presigned URLs)
│   │   ├── genealogy-parser.ts        # PDF → genealogia_json
│   │   ├── avaliacao-genetica-parser.ts
│   │   ├── auth-helpers.ts    # requireAdmin() e afins
│   │   └── email.ts           # SMTP / Nodemailer
│   ├── utils/supabase/        # Clients server, browser, middleware
│   └── middleware.ts          # Rewrites por subdomínio + refresh de sessão
├── whatsapp-server/           # Microserviço Baileys (Node.js + Docker)
│   ├── whatsapp-server.js
│   ├── Dockerfile
│   └── README.md
├── database/                  # ~160 migrations SQL (manuais)
├── scripts/
│   ├── (utilitários atuais)
│   └── archive/               # Scripts one-shot já executados — ver scripts/archive/README.md
├── docs/                      # Documentação suplementar
│   ├── whatsapp-central.md    # Central WhatsApp end-to-end
│   ├── assets/                # Brandbook + catálogos
│   └── legacy/                # Versões antigas/protótipos
├── public/                    # Assets estáticos + PDFs de produto
├── docker-compose.yml
├── architecture.md            # Diagrama macro
└── CLAUDE.md                  # Referência operacional completa
```

---

## Infraestrutura de produção

### Vercel
- Conta `masterjhony` em `joaos-projects-4fb95c65`
- Projeto `formula_do_boii`
- Deploy automático a cada `git push` para `main`
- **Não rodar `vercel --prod` manualmente** — sempre push para `main`

Comandos úteis (não substituem o push):

```bash
vercel link --scope joaos-projects-4fb95c65 --project formula_do_boii
vercel env ls
vercel env add NOME_VAR production
vercel ls
```

### VPS DigitalOcean (WhatsApp Server)
- IP: `165.232.142.37`
- Ubuntu 24.04 LTS / 1 GB RAM
- `/opt/whatsapp-server/` + volume `/opt/whatsapp-auth/`

```bash
ssh root@165.232.142.37
docker ps
docker logs -f formula_boi_whatsapp
docker restart formula_boi_whatsapp
curl http://localhost:3001/status
```

Para reconectar a sessão (depois de expirar ou após conflito de erro 440), ver instruções detalhadas em [whatsapp-server/README.md](./whatsapp-server/README.md) e em [docs/whatsapp-central.md](./docs/whatsapp-central.md#reconectando-a-sessão).

---

## Para onde ir agora

- **Acabei de chegar no projeto** → leia [CLAUDE.md](./CLAUDE.md) (referência operacional completa)
- **Vou mexer no bot do WhatsApp** → [docs/whatsapp-central.md](./docs/whatsapp-central.md)
- **Vou mexer no Baileys/VPS** → [whatsapp-server/README.md](./whatsapp-server/README.md)
- **Quero o diagrama macro** → [architecture.md](./architecture.md)
- **Procuro um endpoint específico** → tabela de rotas em [CLAUDE.md](./CLAUDE.md#api-routes)
