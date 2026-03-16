# Fórmula do Boi

Plataforma completa para gestão e venda de genética bovina — marketplace público, painel administrativo, CRM de vendas, ERP e automação via WhatsApp.

---

## Domínios

| Ambiente | Produção | Local |
|---|---|---|
| Marketplace (público) | `app.formuladoboi.com` | `localhost:3000` |
| Painel Admin | `admin.formuladoboi.com` | `admin.localhost:3000` |
| ERP | `erp.formuladoboi.com` | `erp.localhost:3000` |
| WhatsApp Server | serviço separado (Docker) | `localhost:3001` |

O roteamento por subdomínio é feito via `src/middleware.ts`:
- `admin.*` → `/web-admin`
- `erp.*` → `/web-erp`
- domínio raiz → `/web-site`

---

## Funcionalidades

### Marketplace (`/web-site`)
- Catálogo público de bovinos com filtros por raça (Nelore Padrão, Nelore Pintado), tipo e categoria
- Página de detalhes de lote com fotos, vídeos, DEPs e condições de pagamento
- Catálogo de embriões e doadoras
- SEO otimizado com Open Graph por página

### Painel Admin (`/web-admin`)
- Autenticação via Supabase SSR
- Gestão de produtos (matrizes, reprodutores, embriões)
- **CRM Kanban** — pipeline de vendas com drag-and-drop, salvo em tempo real no banco
- Dashboard de analytics com métricas de leads e visitas (Google Analytics 4)
- Gestão de criadores (breeders)
- **Painel WhatsApp** — exibe QR code para conectar o WhatsApp e status da conexão

### Automação Google Sheets → CRM → WhatsApp
Quando um lead é captado via formulário (integrado ao Google Sheets), um script no Sheets chama o webhook:

```
POST /api/webhooks/google-sheets
Header: x-webhook-secret: <SHEETS_WEBHOOK_SECRET>
```

O webhook:
1. Insere o lead na tabela `crm_leads` do Supabase
2. Dispara (fire-and-forget) uma mensagem de boas-vindas via WhatsApp Server

### ERP (`/web-erp`)
Módulo interno de gestão operacional.

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js (App Router) |
| UI | React 19, Tailwind CSS v4, Framer Motion |
| Banco de dados | Supabase (PostgreSQL) |
| Auth | Supabase SSR |
| Drag & Drop | dnd-kit |
| Ícones | Lucide React |
| Analytics | Google Analytics 4 |
| WhatsApp | Baileys (`@whiskeysockets/baileys`) via microserviço |
| Imagens | Sharp, Jimp |
| Deploy | Vercel (Next.js) + Docker (WhatsApp Server) |

---

## Arquitetura de Serviços

```
Vercel (Next.js)          Docker (VPS/servidor)
┌────────────────┐         ┌──────────────────────┐
│  app.*         │         │  whatsapp-server.js  │
│  admin.*  ────────────▶  │  porta 3001          │
│  erp.*         │  HTTP   │  Baileys WebSocket   │
└────────────────┘         └──────────────────────┘
        │                           │
        ▼                           ▼
   Supabase                    WhatsApp Web
  (crm_leads,                  (sessão salva
  products,                    em whatsapp_auth
  whatsapp_auth)               no Supabase)
```

O **WhatsApp Server** é um processo Node.js separado porque o Baileys mantém uma conexão WebSocket persistente — incompatível com o modelo serverless da Vercel. Ele roda em Docker com `restart: unless-stopped`.

---

## Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

### Vercel
Na Vercel, configure as mesmas variáveis em **Settings → Environment Variables**. As prefixadas com `NEXT_PUBLIC_` ficam expostas ao browser; as demais são server-only.

> **WhatsApp Server**: as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` também precisam estar no ambiente Docker (ver `docker-compose.yml`).

---

## Desenvolvimento Local

### Pré-requisitos
- Node.js 20+
- Docker (para o WhatsApp Server)

### Subdomínios locais

Para que `admin.localhost` e `erp.localhost` funcionem, adicione ao seu arquivo `hosts`:

```
# Windows: C:\Windows\System32\drivers\etc\hosts
# Linux/Mac: /etc/hosts
127.0.0.1  admin.localhost
127.0.0.1  erp.localhost
```

### Iniciar Next.js

```bash
npm install
npm run dev
```

Acesse:
- Marketplace: http://localhost:3000
- Admin: http://admin.localhost:3000
- ERP: http://erp.localhost:3000

### Iniciar WhatsApp Server

```bash
# Com Docker (recomendado)
docker compose --env-file .env.local up -d whatsapp-server

# Ver logs / QR Code
docker logs -f formula_boi_whatsapp

# Sem Docker (dev rápido)
cd whatsapp-server
npm install
node whatsapp-server.js
```

Depois, acesse o painel em `http://admin.localhost:3000/whatsapp` para escanear o QR code.

### Reconectar WhatsApp (sessão expirada)

Se o WhatsApp pedir novo QR mesmo com container rodando, a sessão expirou no lado do WA. Limpe a tabela e reinicie:

```sql
-- No Supabase Studio ou psql
DELETE FROM whatsapp_auth;
```

```bash
docker restart formula_boi_whatsapp
```

Escaneie o novo QR em `http://admin.localhost:3000/whatsapp`.

---

## Deploy (Vercel)

O deploy é automático a cada `git push` para `main`.

**Checklist de variáveis na Vercel** (conferir após qualquer `.env.local` novo):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SHEETS_WEBHOOK_SECRET`
- `WHATSAPP_SERVER_URL` (URL pública do servidor Docker, ex: `http://seu-servidor:3001`)
- `GOOGLE_GA4_PROPERTY_ID`
- `GOOGLE_SERVICE_ACCOUNT_JSON`

> O WhatsApp Server **não roda na Vercel** — deve estar em um servidor dedicado (VPS, Railway, Fly.io, etc.) com Docker.

---

## Estrutura de Pastas

```
formula_boi/
├── src/
│   ├── app/
│   │   ├── web-site/          # Marketplace público
│   │   ├── web-admin/         # Painel administrativo
│   │   │   └── (dashboard)/
│   │   │       ├── crm/       # CRM Kanban
│   │   │       ├── products/  # Gestão de produtos
│   │   │       ├── analytics/ # Dashboard de métricas
│   │   │       └── whatsapp/  # Status e QR do WhatsApp
│   │   ├── web-erp/           # ERP interno
│   │   └── api/
│   │       ├── webhooks/google-sheets/  # Webhook de leads
│   │       └── whatsapp/status/         # Proxy status WhatsApp
│   ├── components/            # Componentes reutilizáveis
│   ├── lib/                   # Wrappers e utilitários
│   ├── services/              # Lógica de negócio / acesso a dados
│   ├── utils/                 # Supabase client, GA, helpers
│   └── middleware.ts          # Roteamento por subdomínio
├── whatsapp-server/           # Microserviço WhatsApp (Node.js + Docker)
│   ├── whatsapp-server.js
│   ├── package.json
│   └── Dockerfile
├── database/                  # Migrations SQL (Supabase)
├── scripts/                   # Scripts utilitários locais
├── public/                    # Assets estáticos
├── docker-compose.yml
└── .env.example
```
