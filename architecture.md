# Arquitetura — Fórmula do Boi

Visão macro do sistema. Para operação detalhada (endpoints, env vars, comandos), use [CLAUDE.md](./CLAUDE.md). Para a Central WhatsApp, [docs/whatsapp-central.md](./docs/whatsapp-central.md).

---

## Visão geral

O sistema tem **um processo principal** (Next.js na Vercel) e **um microserviço** (Baileys em VPS Docker). Tudo gira em torno do Supabase como fonte única de dados.

| Componente | Onde roda | Por quê |
|---|---|---|
| Next.js (App Router) | Vercel (serverless) | Todas as 5 interfaces — marketplace, LP, admin, ERP, Bula — no mesmo deployment, multiplexadas por subdomínio no `middleware.ts` |
| WhatsApp Server (Baileys) | DigitalOcean Droplet (Docker) | Baileys exige WebSocket persistente; serverless da Vercel não suporta |
| Supabase (Postgres + Auth + RLS) | Supabase | Fonte única de verdade — leads, produtos, leilões, mensagens, contratos |
| Cloudflare R2 | Cloudflare | Mídia (vídeos/imagens) — browser sobe via presigned PUT |
| ClickSign | ClickSign | Contratos assinados eletronicamente |
| Asaas | Asaas | Pagamentos PIX |
| GLM-4.7 (Zhipu) | API HTTP | IA usada pelo `/web-admin/ia` e pelo comando `/ia` em grupos |

---

## Diagrama de serviços

```mermaid
graph TD
    %% Atores
    Visitor[Visitante]
    Admin[Admin / equipe]
    Lead[Lead via LP]
    Group[Grupo WhatsApp]
    Member[Usuário Bula]

    %% Vercel
    subgraph Vercel ["Vercel — Next.js (App Router)"]
        direction TB
        MW[middleware.ts<br/>rewrite por subdomínio]

        subgraph Site ["formuladoboi.com — /web-site"]
            Market[Marketplace público]
            LP["/grupo-vip → /web-lp<br/>(captura de leads)"]
        end

        subgraph AdminUI ["admin.* — /web-admin"]
            CRM[CRM Kanban]
            Central[Central WhatsApp<br/>inbox · fluxo · templates · campanhas]
            Contracts[Contratos<br/>+ ClickSign]
            Products[Produtos<br/>+ parsers PDF]
            Media[Biblioteca de mídia<br/>+ Cloudflare R2]
            IA[Assistente IA<br/>GLM-4.7 + tools]
        end

        subgraph ErpUI ["erp.* — /web-erp"]
            Finance[Financeiro · Contábil · Estoque · Leilões]
        end

        subgraph BulaUI ["adminbula.* — /web-bula"]
            BulaSPA[SPA Bula: CRM · Leilões · Fechamentos · Cronograma]
        end

        subgraph API ["/api/*"]
            APILead[/api/lp/lead]
            APIInbound[/api/whatsapp/inbound]
            APIRender[/api/whatsapp/render-welcome]
            APICampaign[/api/whatsapp/central/campaigns/...]
            APICallback[/api/whatsapp/campaign-callback]
            APIGroup[/api/whatsapp/group-task<br/>group-decision · group-risk · group-ai]
            APIClicksign[/api/clicksign/...]
            APIR2[/api/r2/...]
            APIBula[/api/bula/...]
        end
    end

    %% Externos
    subgraph VPS ["DigitalOcean 165.232.142.37 — Docker"]
        WA[whatsapp-server.js<br/>:3001 · Baileys WS]
    end

    subgraph SB ["Supabase (Postgres + RLS)"]
        L[(crm_leads)]
        P[(products)]
        WM[(whatsapp_messages)]
        WT[(whatsapp_templates)]
        WC[(whatsapp_campaigns +<br/>recipients + optouts)]
        SS[(site_settings<br/>whatsapp_flow_v2)]
        TC[(tactical_contracts)]
        TT[(tactical_tasks)]
        BL[(bula_*)]
        Auth[Supabase Auth]
    end

    R2[(Cloudflare R2)]
    ClickSign[ClickSign API]
    Asaas[Asaas API]
    GLM[Zhipu GLM-4.7]
    GA4[GA4 Data API]
    Sheets[Google Sheets]
    WAweb[WhatsApp Web]

    %% Fluxos públicos
    Visitor --> MW --> Site
    Market <--> P
    Lead --> LP --> APILead
    APILead -->|insere lead| L
    APILead -->|appenda linha| Sheets
    APILead -->|POST /send| WA
    WA -->|GET /render-welcome| APIRender
    APIRender -->|template welcome| WT
    APIRender -->|checa opt-out| WC

    %% Admin
    Admin --> MW --> AdminUI
    Auth <--> AdminUI
    CRM <--> L
    Central -->|inbox/thread| WM
    Central -->|templates CRUD| WT
    Central -->|campanhas| WC
    Central -->|grafo do bot| SS
    Contracts <--> TC
    Contracts -->|envia/sincroniza| APIClicksign
    APIClicksign <-->|API| ClickSign
    Products -->|upload| R2
    Media <-->|presigned| APIR2 <--> R2
    IA -->|tool-calling| GLM
    IA -->|consulta tabelas| SB

    %% ClickSign webhook
    ClickSign -->|webhook| APIClicksign

    %% ERP
    Admin --> ErpUI
    Finance <--> SB

    %% Bula
    Member --> BulaUI <--> APIBula <--> BL

    %% Fluxo Central WhatsApp inbound
    WAweb <-->|WebSocket| WA
    WA -->|POST /inbound| APIInbound
    APIInbound -->|cria/atualiza| L
    APIInbound -->|log| WM
    APIInbound -->|carrega grafo| SS
    APIInbound -->|render template| WT

    %% Campanhas
    APICampaign -->|materializa| WC
    APICampaign -->|POST /campaign-send| WA
    WA -->|callback por destinatário| APICallback
    APICallback --> WC

    %% Grupos
    Group <-->|WS| WAweb
    WA -->|/tarefa /decisao /risco /ia| APIGroup
    APIGroup --> TT
    APIGroup -->|/ia| GLM

    %% Pagamentos / Analytics
    Asaas -->|webhook| API
    GA4 --> AdminUI

    classDef ext fill:#f1f5f9,stroke:#94a3b8,stroke-dasharray:4
    classDef db fill:#fef3c7,stroke:#f59e0b
    classDef wa fill:#dcfce7,stroke:#16a34a
    class L,P,WM,WT,WC,SS,TC,TT,BL,Auth db
    class WA wa
    class WAweb,R2,ClickSign,Asaas,GLM,GA4,Sheets ext
```

---

## Roteamento por subdomínio

Tudo em [src/middleware.ts](src/middleware.ts).

| Hostname / path | Comportamento |
|---|---|
| `admin.*` | rewrite → `/web-admin/*` |
| `erp.*` | rewrite → `/web-erp/*` |
| `adminbula.*` | rewrite → `/web-bula/*` |
| `lp.*` | **301** → `formuladoboi.com/grupo-vip${path}` (legacy) |
| `formuladoboi.com` / `www.*` / `app.*` | rewrite → `/web-site/*` |
| `formuladoboi.com/grupo-vip[/...]` | rewrite → `/web-lp[/...]` |
| `/api/*` (qualquer hostname) | bypass — sem rewrite |

O middleware também chama `updateSession()` em [src/utils/supabase/middleware.ts](src/utils/supabase/middleware.ts) para renovar o cookie de auth do Supabase.

---

## Tabelas principais do Supabase

Catálogo resumido — para colunas/JSONB completos, ver [CLAUDE.md](./CLAUDE.md#database) e os arquivos em [database/](database/).

| Domínio | Tabelas |
|---|---|
| Catálogo | `products`, `breeders` |
| CRM / leads | `crm_leads`, `profiles`, `signup_verification_codes` |
| WhatsApp (Central) | `whatsapp_messages`, `whatsapp_templates`, `whatsapp_campaigns`, `whatsapp_campaign_recipients`, `whatsapp_optouts`, `site_settings.whatsapp_flow_v2` |
| Plano tático / OKR | `tactical_tasks`, `tactical_task_comments`, `tactical_task_attachments`, `tactical_kanban_columns`, `tactical_contracts`, `tactical_members`, `tactical_objectives`, `tactical_key_results`, `tactical_task_kr_links`, `tactical_risks`, `tactical_decisions`, `strategic_flows`, `strategic_stages` |
| Leilões | `cronograma_leiloes` |
| ERP | `erp_finance_*`, `erp_accounting_*`, `erp_inventory_*` |
| Bula | `bula_membros`, `bula_leiloes`, `bula_leilao_assessores`, `bula_leilao_fechamento`, `bula_projeto_cards`, `bula_card_responsaveis`, `bula_crm_funis`, `bula_crm_deals`, `bula_leads`, `bula_marketing_config` |

Migrations em [database/](database/) — **rodadas manualmente** contra o Supabase (não há migration runner). O arquivo canônico que cria a camada da Central WhatsApp é [database/central_whatsapp_06_mai_2026.sql](database/central_whatsapp_06_mai_2026.sql).

---

## Sessão do WhatsApp

> **Importante**: a sessão **não está mais no Supabase** (versões anteriores deste documento mencionavam uma tabela `whatsapp_auth` — obsoleta).

A sessão Baileys é persistida via `useMultiFileAuthState` em arquivos no volume Docker `/opt/whatsapp-auth/` no Droplet. O container reinicia sem perder a sessão.

**Conflito 440**: o WhatsApp permite apenas uma sessão por número. Subir um servidor local em paralelo com o VPS de produção causa erro 440 e derruba a sessão da VPS imediatamente. Veja [docs/whatsapp-central.md](./docs/whatsapp-central.md#reconectando-a-sessão) para reconectar.

---

## Convenções de front-end (admin)

Decisões arquiteturais relevantes do lado React/Next dentro do painel admin:

- **URL como fonte de verdade** — em telas com aba+detalhe (`fechamento`, `whatsapp`, `tactical-plan`, `crm`), o estado visível vive em query params (`?id=`, `?tab=`, `?view=`, `?task=`, `?lead=`). O estado deriva de `useSearchParams`; mutações usam `router.replace` (não `push`) pra não inflar o histórico. Aba default não emite param.
- **Suspense boundary obrigatório** — qualquer client component que chame `useSearchParams` precisa estar dentro de `<Suspense>` (exigência do Next 16 pra build estático). Quando a página é server component, o Suspense fica no `page.tsx`; quando é client, fica no próprio arquivo.
- **Modal "criar novo" é estado local** — não vai pra URL, porque não há registro a referenciar até o save. Modal "editar" vive em URL e usa o id real.
- **Componente `Pagination` compartilhado** — [src/components/admin/Pagination.tsx](src/components/admin/Pagination.tsx) provê controles `« ‹ 1 2 3 › »` + dropdown "Por página". Quem consome controla `page` e `pageSize` por props. Em uso: [`/leads`](src/components/admin/crm/CRMLeadsView.tsx), Qualificação do CRM ([CRMQualificacaoView](src/components/admin/crm/CRMQualificacaoView.tsx)).

Lista completa dos params e arquivos correspondentes em [CLAUDE.md → Notable Implementation Details](./CLAUDE.md#notable-implementation-details).

---

## Infraestrutura de produção

| Componente | Serviço | Detalhes |
|---|---|---|
| Next.js App | Vercel | conta `masterjhony` / projeto `formula_do_boii` — auto-deploy no push para `main` |
| WhatsApp Server | DigitalOcean Droplet | IP `165.232.142.37`, Ubuntu 24.04, 1 GB RAM, `/opt/whatsapp-server/` |
| Banco de dados | Supabase | `hghtikjaqixglmpujbwj.supabase.co` |
| Mídia | Cloudflare R2 | bucket configurável via `R2_BUCKET`, prefixo `R2_PREFIX` (default `libmedia/`) |
| Email | SMTP Hostinger | `smtp.hostinger.com:465` (códigos de verificação) |
| Contratos | ClickSign | conta de produção via `CLICKSIGN_ACCESS_TOKEN` |

Acesso:

```bash
# Vercel
vercel link --scope joaos-projects-4fb95c65 --project formula_do_boii
vercel env ls
vercel ls

# VPS
ssh root@165.232.142.37
docker logs -f formula_boi_whatsapp
```
