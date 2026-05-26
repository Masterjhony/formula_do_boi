# Agendamentos (Calendly Free × Google Calendar)

A página `/web-admin/agendamentos` lista reuniões marcadas via Calendly Free. O plano gratuito do Calendly **não** dá Personal Access Token, webhooks nem redirect após reserva — então fazemos a ponte pelo Google Calendar, que é o único integrador grátis nativo do Calendly.

> APIs em [api-routes.md](./api-routes.md#agendamentos). Tabela em [database.md](./database.md#agendamentos).

## Arquitetura (sem APIs pagas)

1. Calendly Free cria os eventos no Google Calendar configurado pelo dono da conta (na própria conta Calendly: Integrations → Calendar Connections).
2. O operador compartilha esse calendário com o e-mail da nossa service account (campo `client_email` do `GOOGLE_SERVICE_ACCOUNT_JSON`, mesma usada em GA4/Sheets) com permissão "Ver detalhes de todos os eventos".
3. Cron externo (cron-job.org / GitHub Actions, a cada ~5min) chama `/api/agendamentos/sync` → lê eventos com [src/lib/google-calendar.ts](../src/lib/google-calendar.ts) (escopo `calendar.readonly`) → parseia invitee e materializa em `agendamentos` ([src/lib/agendamentos-sync.ts](../src/lib/agendamentos-sync.ts)).
4. Idempotência por `google_event_id` UNIQUE. Cancelamentos vêm como `status: 'cancelled'` no Google e a gente seta `status='cancelado'` aqui.

## Parsing do invitee

- **E-mail**: do primeiro `attendee` que não é `organizer/self`. Fallback: regex no `description`.
- **Nome**: `attendee.displayName`, fallback no padrão "Tipo - Nome" do summary do Calendly.
- **Telefone**: heurística sobre a descrição — procura `Phone call:`, `Phone number:`, `Telefone:`, `Celular:` ou `WhatsApp:` seguido de número. Depois normaliza com `normalizePhone()` (com DDI 55).
- **Detecção de Calendly**: marcadores na description (`calendly.com`, `Event Type:`, `Invitee:` etc) → marca `source='calendly'`, caso contrário `source='google'` (evento criado direto no Calendar).

## Auto-vínculo ao CRM

Busca em `crm_leads` por e-mail (`auto_link_lead_by_email`) e depois por telefone via `phoneVariants()` (`auto_link_lead_by_phone`). Quando o operador vincula manualmente (Modal → "Vincular ao lead"), o sync seguinte preserva esse vínculo — não sobrescreve mesmo se mudar attendee no Calendly.

## Estados preservados

Se o operador marcou `concluido`, `nao_compareceu` ou `confirmado`, o sync seguinte preserva esses estados (só pode evoluir pra `cancelado` se o Google sinalizar cancelamento).

## Settings em `site_settings.agendamentos_calendar` (JSONB)

- `google_calendar_id` — e-mail do dono (calendar primary) OU ID `xxxx@group.calendar.google.com` (calendar secundário). Pegar em Google Calendar → Configurações do calendário → "Integrar calendário".
- `calendly_event_url` — link público do Calendly que o bot WhatsApp manda.
- `default_responsible_member_id` — UUID em `tactical_members` (opcional).
- `auto_link_lead_by_email`, `auto_link_lead_by_phone` — flags.
- `sync_window_past_days` (default 7), `sync_window_future_days` (default 90).

## Cron externo

Não usar Vercel Hobby cron — não permite sub-diário.

```
GET https://admin.formuladoboi.com/api/agendamentos/sync
Header: x-webhook-secret: ${WHATSAPP_GROUP_TASK_SECRET}
```

## WhatsApp ⇄ agendamento

O operador (ou um nó `send_template` futuro no fluxo) envia o template `agendamento-link` (slug seedado em [database/seed_agendamento_template.sql](../database/seed_agendamento_template.sql)) quando o lead aceita marcar um horário. O link aponta pra `https://formuladoboi.com/agendar` ([src/app/web-site/agendar/route.ts](../src/app/web-site/agendar/route.ts)) que faz 302 pra `site_settings.agendamentos_calendar.calendly_event_url`, escondendo do cliente o slug pessoal do Calendly. Vantagens: domínio próprio, troca de ferramenta vira mudança de setting, UTMs/`?lead=` preservadas.

## Limitações honestas (Calendly Free)

- Latência de ~5min entre o lead agendar e o registro aparecer no admin (o cron).
- Sem confirmação automática por WhatsApp após o agendamento (Calendly não dispara webhook no plano grátis). Lembretes ficam por conta do próprio Calendly (e-mail/SMS).
- Sem reagendamento automático: se o lead reagenda no Calendly, o evento ANTIGO é cancelado e um NOVO é criado — vão aparecer dois registros aqui (um com `status='cancelado'`, outro novo `agendado`). Aceitável.

## Migration

[database/agendamentos.sql](../database/agendamentos.sql) — cria a tabela, índices, RLS, trigger `updated_at` e o registro inicial em `site_settings.agendamentos_calendar`. Reaplicar é idempotente.

## Pitfall conhecido

Se a `GOOGLE_SERVICE_ACCOUNT_JSON` da Vercel não tiver o calendário compartilhado com o `client_email` da service account, o sync retorna `403 Forbidden`. A mensagem aparece no campo `errors` da resposta do endpoint.
