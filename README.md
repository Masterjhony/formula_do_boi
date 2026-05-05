# Fórmula do Boi

Plataforma completa para gestão e venda de genética bovina — marketplace público, painel administrativo, CRM de vendas, ERP e automação via WhatsApp.

---

## Domínios

| Ambiente | Produção | Local |
|---|---|---|
| Marketplace (público) | `formuladoboi.com` (e `www.*`, `app.*` legacy) | `localhost:3000` |
| Landing Page (Grupo VIP) | `formuladoboi.com/grupo-vip` | `localhost:3000/grupo-vip` |
| Painel Admin | `admin.formuladoboi.com` | `admin.localhost:3000` |
| ERP | `erp.formuladoboi.com` | `erp.localhost:3000` |
| Bula | `adminbula.formuladoboi.com` | `adminbula.localhost:3000` |
| WhatsApp Server | `http://165.232.142.37:3001` (VPS DigitalOcean) | `localhost:3001` |

O roteamento por subdomínio é feito via `src/middleware.ts`:
- `admin.*` → `/web-admin`
- `erp.*` → `/web-erp`
- `adminbula.*` → `/web-bula`
- `lp.*` → 301 redirect para `formuladoboi.com/grupo-vip` (legacy)
- domínio raiz / `www.*` / `app.*` → `/web-site` (marketplace)
- `/grupo-vip[/...]` no marketplace → `/web-lp[/...]` (Landing Page de captura)

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
2. Aguarda (`await`) o resultado do envio da mensagem de boas-vindas via WhatsApp Server
3. Retorna no response o status de cada lead com o resultado do WhatsApp (`{ sent, reason?, error? }`)

### ERP (`/web-erp`)
Módulo interno de gestão operacional com Kanban tático (`tactical_tasks`).

### Automação WhatsApp → Kanban Tático

Membros dos grupos da comunidade WhatsApp podem criar cards no Kanban do ERP digitando:

```
/tarefa <descrição da tarefa>
```

O bot responde no próprio grupo confirmando a criação. O card aparece no Kanban com um badge verde **WhatsApp** e registra o grupo e o remetente de origem. Implementado em `whatsapp-server.js` (listener de grupos) + `POST /api/whatsapp/group-task` (cria o card no Supabase).

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
Vercel (Next.js)             DigitalOcean Droplet (165.232.142.37)
┌──────────────────────┐      ┌──────────────────────┐
│  formuladoboi.com    │      │  whatsapp-server.js  │
│   ├ /          → site│      │  porta 3001          │
│   └ /grupo-vip → LP  │ ───▶ │  Baileys WebSocket   │
│  admin.* / erp.* /   │ HTTP └──────────────────────┘
│  adminbula.*         │
└──────────────────────┘
        │                           │
        ▼                           ▼
   Supabase                    WhatsApp Web
  (crm_leads,                  (sessão salva em
  products, etc.)              arquivos locais via
                               Docker volume)
```

O **WhatsApp Server** é um processo Node.js separado porque o Baileys mantém uma conexão WebSocket persistente — incompatível com o modelo serverless da Vercel. Ele roda em Docker com `restart: unless-stopped` num Droplet DigitalOcean.

A sessão do Baileys é persistida em **arquivos locais** (`useMultiFileAuthState`) via Docker volume (`/opt/whatsapp-auth/`). O `src/lib/whatsapp.ts` no Next.js é um proxy HTTP puro — **não importa Baileys**.

> Documentação detalhada do servidor: [whatsapp-server/README.md](./whatsapp-server/README.md)

---

## Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

### Vercel
Na Vercel, configure as mesmas variáveis em **Settings → Environment Variables**. As prefixadas com `NEXT_PUBLIC_` ficam expostas ao browser; as demais são server-only.

> **WhatsApp Server**: o servidor não depende mais do Supabase — a sessão é persistida em arquivos locais via Docker volume. Apenas a variável `WHATSAPP_SERVER_PORT` é necessária (ver [whatsapp-server/README.md](./whatsapp-server/README.md)).

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

### Iniciar WhatsApp Server (desenvolvimento local)

> **Atenção**: o WhatsApp permite apenas **uma sessão ativa por número**. O VPS de produção (`165.232.142.37`) mantém a sessão ativa permanentemente. Rodar um servidor WhatsApp local simultaneamente causa conflito de sessão (erro 440) e derruba a conexão do VPS.
>
> **Só suba o servidor local se o VPS estiver parado ou para testes com um número diferente.**

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

Se o WhatsApp pedir novo QR mesmo com container rodando, a sessão expirou. Limpe os arquivos de auth e reinicie:

```bash
# Em produção (VPS)
ssh root@165.232.142.37
docker stop formula_boi_whatsapp
rm -rf /opt/whatsapp-auth/*
docker start formula_boi_whatsapp
docker logs -f formula_boi_whatsapp  # ver novo QR

# Em desenvolvimento local
docker restart formula_boi_whatsapp
```

Escaneie o novo QR em `http://admin.formuladoboi.com/whatsapp` (produção) ou `http://admin.localhost:3000/whatsapp` (local).

---

## Infraestrutura de Produção

### Vercel (Next.js)

- **Conta**: `masterjhony` em `joaos-projects-4fb95c65`
- **Projeto**: `formula_do_boii`
- **URL de produção**: `https://formuladoboi.com` (apex). `www.*` e `app.*` (legacy) também atendem o marketplace; `lp.*` 301-redireciona pra `formuladoboi.com/grupo-vip`.
- **Deploy**: automático a cada `git push` para `main`

#### Gerenciar via Vercel CLI

```bash
# Instalar CLI (se necessário)
npm install -g vercel

# Login (abre browser)
vercel login

# Vincular o repositório local ao projeto
vercel link --scope joaos-projects-4fb95c65 --project formula_do_boii

# Listar variáveis de ambiente
vercel env ls

# Adicionar variável
vercel env add NOME_DA_VAR production

# Redeploy sem alterar código (ex: após mudar env vars)
vercel redeploy <deployment-url> --target production

# Ver deployments recentes
vercel ls
```

#### Checklist de variáveis na Vercel

| Variável | Valor em produção | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hghtikjaqixglmpujbwj.supabase.co` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | — | Chave pública do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Chave admin (bypassa RLS) |
| `SHEETS_WEBHOOK_SECRET` | — | Segredo compartilhado com o Apps Script |
| `WHATSAPP_SERVER_URL` | `http://165.232.142.37:3001` | URL do servidor WhatsApp no VPS |
| `WHATSAPP_GROUP_TASK_SECRET` | — | Segredo compartilhado com o VPS para `/api/whatsapp/group-task` (Production only) |
| `GOOGLE_GA4_PROPERTY_ID` | `483341191` | ID da propriedade GA4 |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | — | JSON da service account GA4 |

> Para alterar uma variável na Vercel e fazer redeploy sem subir arquivos locais (evita erro de limite de 100 MB):
> ```bash
> vercel env rm NOME_DA_VAR production --yes
> vercel env add NOME_DA_VAR production --value "novo_valor" --yes
> vercel redeploy <url-do-ultimo-deploy> --target production
> ```

---

### VPS DigitalOcean (WhatsApp Server)

- **Provedor**: DigitalOcean
- **IP**: `165.232.142.37`
- **OS**: Ubuntu 24.04 LTS x64
- **Recursos**: 1 GB RAM
- **Arquivos**: `/opt/whatsapp-server/`

> O WhatsApp Server **não roda na Vercel** — requer conexão WebSocket persistente, incompatível com serverless.

#### Acessar via SSH

```bash
ssh root@165.232.142.37
```

#### Comandos úteis no servidor

```bash
# Ver status do container
docker ps

# Ver logs em tempo real
docker logs -f formula_boi_whatsapp

# Reiniciar container (ex: após atualizar código)
docker restart formula_boi_whatsapp

# Parar container
docker stop formula_boi_whatsapp

# Rebuild após alterar whatsapp-server.js
cd /opt/whatsapp-server
docker build -t formula_boi_whatsapp_img .
docker stop formula_boi_whatsapp && docker rm formula_boi_whatsapp
docker run -d --name formula_boi_whatsapp --restart unless-stopped \
  -p 3001:3001 -v /opt/whatsapp-auth:/data/auth \
  -e WHATSAPP_SERVER_PORT=3001 formula_boi_whatsapp_img

# Verificar status do WhatsApp (conectado, qr, etc.)
curl http://localhost:3001/status
```

> A sessão é preservada no volume `/opt/whatsapp-auth/` — não precisa escanear QR ao fazer rebuild.

#### Atualizar o servidor WhatsApp

Quando `whatsapp-server.js` for alterado localmente, enviar para o servidor. Veja [whatsapp-server/README.md](./whatsapp-server/README.md) para instruções detalhadas.

```bash
scp whatsapp-server/whatsapp-server.js root@165.232.142.37:/opt/whatsapp-server/
ssh root@165.232.142.37 "cd /opt/whatsapp-server && docker build -t formula_boi_whatsapp_img . && \
  docker stop formula_boi_whatsapp && docker rm formula_boi_whatsapp && \
  docker run -d --name formula_boi_whatsapp --restart unless-stopped \
  -p 3001:3001 -v /opt/whatsapp-auth:/data/auth \
  -e WHATSAPP_SERVER_PORT=3001 formula_boi_whatsapp_img"
```

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
├── .env.example
└── .vercelignore          # Exclui .next e node_modules do upload da Vercel CLI
```
