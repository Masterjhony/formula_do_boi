# Variáveis de ambiente

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL          # Supabase REST API endpoint
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase public anon key
SUPABASE_SERVICE_ROLE_KEY         # Service role key (bypassa RLS)

# Webhooks & WhatsApp
SHEETS_WEBHOOK_SECRET             # Valida Google Sheets webhook
WHATSAPP_SERVER_URL               # default: http://localhost:3001
WHATSAPP_GROUP_TASK_SECRET        # Shared secret: /tarefa, /decisao, /risco, /ia + inbound + render-welcome + cron (Production only na Vercel)
# (Cron de campanhas usa WHATSAPP_GROUP_TASK_SECRET via x-webhook-secret — não há CRON_SECRET separado. Hobby Vercel não permite cron sub-diário; usamos cron externo.)
WHATSAPP_CATALOGS_SERVER_URL      # Segunda sessão Baileys, default: http://localhost:3002

# AI (GLM-4.7 / Zhipu)
GLM_API_KEY                       # Zhipu API key
GLM_MODEL                         # default: glm-4.7

# Analytics (GA4)
GOOGLE_GA4_PROPERTY_ID            # GA4 property (fallback: 483341191)
GOOGLE_SERVICE_ACCOUNT_JSON       # Service account (stringified JSON) — usada por GA4, Sheets e Google Calendar

# Analytics (PostHog — US Cloud, projeto 430113)
NEXT_PUBLIC_POSTHOG_KEY           # Project token público. Sem ele, SDK no browser não inicializa.
NEXT_PUBLIC_POSTHOG_HOST          # default: https://us.i.posthog.com
POSTHOG_PROJECT_ID                # default: 430113 hardcoded em src/actions/posthog.ts
POSTHOG_PERSONAL_API_KEY          # Escopo "Performing analytics queries". Sem ela, /web-admin/analytics fica em placeholder.

# SMTP (signup codes, resets, e-mail marketing)
SMTP_HOST                         # default: smtp.hostinger.com
SMTP_PORT                         # default: 465
SMTP_USER                         # mailbox (e.g. contato@formuladoboi.com)
SMTP_PASS                         # mailbox password
SMTP_FROM                         # default: "Fórmula do Boi <SMTP_USER>"
NEXT_PUBLIC_SITE_URL              # base do link de unsubscribe (fallback https://formuladoboi.com)

# Cloudflare R2 (media library)
R2_ACCOUNT_ID
R2_BUCKET
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_PREFIX                         # default: "libmedia/"

# Asaas (payments)
ASAAS_API_KEY
ASAAS_SANDBOX                     # "true" pra sandbox

# ClickSign (e-signature)
CLICKSIGN_ACCESS_TOKEN            # UUID gerado em Configurações → API
CLICKSIGN_API_URL                 # default: https://app.clicksign.com/api/v1 (sandbox: https://sandbox.clicksign.com/api/v1)
CLICKSIGN_HMAC_SECRET             # opcional; valida Content-Hmac do webhook

# External services
LEILAO_SERVER_URL                 # default: http://localhost:8000
```

O VPS WhatsApp usa as mesmas variáveis Supabase para carregar config de `site_settings` no boot e a cada 5min.

## VPS Catálogos (no `.env` do container)

- `WHATSAPP_CATALOGS_SERVER_PORT` — 3002
- `AUTH_DIR` — `/opt/whatsapp-catalogs-auth`
- `NEXT_JS_URL` — `https://admin.formuladoboi.com`
- `WHATSAPP_GROUP_TASK_SECRET` — mesmo da Central
- `R2_*` — mesmas chaves R2
- `POLL_GROUPS_EVERY_MS` — intervalo de sync de grupos monitorados

## Pitfalls

- Quando adicionar `WHATSAPP_GROUP_TASK_SECRET` via `vercel env add`, paste com cuidado — a CLI pode appendar newline e fazer o length virar 65 em vez de 64, causando 401 em tudo.
- Mudar env var na Vercel **exige redeploy** — só é injetada em deploys novos. Empty commit + push, ou Dashboard → Deployments → ⋯ → Redeploy.
- `POSTHOG_PERSONAL_API_KEY` é Sensitive — só em **Production** na Vercel.
- `GOOGLE_SERVICE_ACCOUNT_JSON` precisa ter o calendário compartilhado com o `client_email` da service account pra `/api/agendamentos/sync` funcionar (senão dá 403 Forbidden).
