# Central de E-mail Marketing

Espelha 1-pra-1 a arquitetura da Central WhatsApp (`whatsapp_campaigns`/`_steps`/`_recipients`/`_templates`) mas pra e-mail. Página admin em `/web-admin/email`.

> APIs em [api-routes.md](./api-routes.md#central-de-e-mail). Tabelas em [database.md](./database.md#e-mail-marketing). Camada de envio em [lib-reference.md](./lib-reference.md) (`email-marketing.ts`).

## UI

3 abas (deep-link via `?tab=`):

- **Campanhas** (default, sem `?tab`) — lista campanhas, modal de criação/edição com segmento (interesse_principal multi-select, stage, audience_tag), preview do público, regras de parada e sequência multi-step. CRUD em `/api/email/central/campaigns/*`.
- **Templates** — CRUD de templates HTML reutilizáveis. Editor com textarea pro `body_html` + preview via `<iframe srcDoc>`. Suporta `{nome}`, `{email}` e `{{UNSUBSCRIBE_URL}}`.
- **Métricas** — totais (campanhas, sent_7d, failed_7d, opt-outs, leads c/ e-mail) + taxa de entrega 7d. Avisa o operador sobre o limite Hostinger.

## Por que SMTP Hostinger (não Resend/SES)

Decisão explícita do operador em 2026-05-19 — "precisa ser pelo provedor da Hostinger mesmo". Trade-offs aceitos:

- Limite ~100-300 e-mails/dia (Hostinger compartilhado).
- Sem webhook de bounce/open/click — métricas limitadas a "tentou enviar / falhou no SMTP" (sem confirmação real de entrega).
- IP/reputação compartilhado com outros sites Hostinger — risco de spam se a lista azedar.

## Implicações no design

- Cron `/api/email/central/campaigns/cron` processa em lotes pequenos (BATCH_SIZE=30, 800ms entre envios). Configurar cron externo (cron-job.org / GitHub Actions) a cada 5-10 min, com `x-webhook-secret: ${WHATSAPP_GROUP_TASK_SECRET}` (mesmo segredo do WhatsApp).
- O painel **Métricas** mostra um aviso permanente sobre o limite. Pra listas grandes (> 100), o operador divide em múltiplas campanhas escalonadas.
- `email_messages` é só **outbound** — Hostinger não dá inbound webhook. Pra acompanhar respostas, operador usa a caixa de entrada IMAP direto (contato@formuladoboi.com).

## Templates seed

Em [database/central_email_marketing.sql](../database/central_email_marketing.sql):

- `welcome-email-default` — boas-vindas voz Matheus 1ª pessoa.
- `newsletter-base` — template base de newsletter.
- `aviso-leilao-email` — aviso de leilão com CTA pro catálogo.

Todos têm `{{UNSUBSCRIBE_URL}}` no rodapé. Se o operador esquecer, [src/lib/email-marketing.ts](../src/lib/email-marketing.ts) injeta um rodapé padrão automaticamente antes de `</body>`.

## Unsubscribe (LGPD)

Endpoint **público** `/api/email/unsubscribe?email=...&token=...` — o token é HMAC-SHA256 do e-mail normalizado, assinado com `WHATSAPP_GROUP_TASK_SECRET`. Validação em tempo constante (`timingSafeEqual`). Quando válido: insere em `email_optouts`, marca `optout_email=true` em todos os leads com aquele e-mail, retorna HTML simples confirmando.

## Opt-out vs WhatsApp

Opt-outs são **independentes** entre canais. Um lead pode estar `optout_whatsapp=true` mas `optout_email=false` (e vice-versa) — útil pra reativação por outro canal quando o lead pediu pra parar em só um.

## Variáveis de ambiente

Mesmas do `src/lib/email.ts` já existentes:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- `WHATSAPP_GROUP_TASK_SECRET` — assina tokens de unsubscribe E autoriza o cron de e-mail.
- `NEXT_PUBLIC_SITE_URL` — base do link de unsubscribe (fallback `https://formuladoboi.com`).

## Pitfall

Se você editar template em `email_templates` enquanto uma campanha está com `status='enviando'`, o cron pega a versão NOVA do template no próximo step. Intencional (operador pode corrigir typo em campanha rolando), mas vale lembrar.

## Adicionar uma campanha em código (programaticamente)

1. INSERT em `email_campaigns` com `status='rascunho'`.
2. (Opcional) INSERT em `email_campaign_steps` pra cada follow-up.
3. POST em `/api/email/central/campaigns/[id]/send` (Admin auth) — materializa recipients e dispara passo 0.
4. Cron pega o resto automaticamente.
