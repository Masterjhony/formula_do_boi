# `src/lib/` — referência

Mapa rápido dos módulos compartilhados.

| File | Purpose |
|------|---------|
| `whatsapp.ts` | Thin HTTP client pro VPS — `sendWelcomeMessage(phone, name)`. |
| `clicksign.ts` | Thin client ClickSign API v1: `sendDocumentForSignature`, `getDocument`, `cancelDocument`, `fileUrlToBase64DataUri`, `verifyWebhookHmac`. Auth via `?access_token=`. |
| `genealogy-parser.ts` | PDF → `genealogia_json`. |
| `avaliacao-genetica-parser.ts` | PDF → `avaliacao_genetica_json`. |
| `auth-helpers.ts` | `requireAdmin()` e similares pra API routes. |
| `email.ts` | Nodemailer SMTP client; renderiza e-mails de signup-code e password-reset. |
| `r2.ts` | Cloudflare R2 (S3-compatible); presigned URLs, list, delete. |
| `crm-types.ts` | TypeScript interfaces do CRM. |
| `bula/queries.ts`, `bula/types.ts` | Queries Supabase e tipos das APIs Bula. |
| `posthog-client.ts` | Client-side: `trackEvent(name, props)`, `identifyLead(distinctId, traits)`, `resetPosthog()`. `EventName` é o type literal das chaves custom — adicione lá antes de chamar. |
| `posthog-snippet.ts` | `buildPosthogSnippet()` / `injectPosthogIntoHtml(html)` — geram `<script>` PostHog pra HTMLs estáticos da LP servidos por route handlers (não passam pelo `PostHogProvider` React). |
| `email-marketing.ts` | Camada de envio de campanhas por e-mail. `sendCampaignEmail()` respeita opt-out e loga em `email_messages`. `renderEmail()` interpola `{nome}`, `{email}`, `{{UNSUBSCRIBE_URL}}`. `signUnsubscribeToken()`/`verifyUnsubscribeToken()` (HMAC-SHA256 com `WHATSAPP_GROUP_TASK_SECRET`). `setEmailOptout()` marca opt-out (cache + lead). |
| `email-segment.ts` | `resolveEmailSegment()` — resolve JSON de segmento em query Supabase. Sempre aplica `optout_email=false` + `email NOT NULL` + email contém `@`. |
| `email-campaign-step.ts` | `resolveEmailStepContent()` — mescla step + template (step sobrescreve campos vazios). |
| `google-calendar.ts` | Cliente Google Calendar v3 via JWT (service account). `listCalendarEvents()`, `getCalendarEvent()`, `isGoogleCalendarConfigured()`. Escopo `calendar.readonly`. |
| `agendamentos-sync.ts` | `syncAgendamentos()` — puxa eventos do Google Calendar, parseia invitee, faz match com `crm_leads` por e-mail/telefone, upserta em `agendamentos`. Preserva edições manuais. `loadAgendamentosSettings()` lê `site_settings.agendamentos_calendar`. |
| `whatsapp-flow-engine.ts` | Engine do grafo de fluxo da Central (nodes: `start`, `classify`, `condition`, `action`, `send_template`, `silence`, `end`). `resolveWelcomeDispatch()` percorre subgrafo `new_lead`. `buildDefaultGraph()` é o fallback em código. `ACADEMIA_SLUG_OVERRIDES` aplica overrides de audiência. |
| `whatsapp-flow-settings.ts` | Tipos e defaults do `FlowSettings` (parâmetros JSONB de `whatsapp_flows.settings`). `isWithinAllowedHours()` resolve janela horária no fuso configurado. |
| `whatsapp-flows.ts` | `loadActiveFlowWithSettings()` — lê fluxo ativo de `whatsapp_flows`. |
| `whatsapp-central.ts` | Classifier de inbound. `BATE_PAPO_PENDENTE_NUMERIC_MAP` e `DEFAULT_NUMERIC_MAP`. Resolução de audiência (Lista Matheus > Academia > default). |
| `whatsapp-catalogs.ts` | Token-set similarity pra matching de PDF de catálogo com `cronograma_leiloes`. |
| `whatsapp-pause.ts` | Helper de pausa global da Central (`site_settings.whatsapp_central_paused`). |
