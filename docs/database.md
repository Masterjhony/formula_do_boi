# Banco de dados (Supabase)

Tabelas principais usadas pela plataforma. Migrations ficam em [/database/](../database/) (~120 arquivos, um por mudança). Não há migration runner — aplicadas manualmente no Supabase.

> Referenciado por [CLAUDE.md](../CLAUDE.md). Para detalhes operacionais de WhatsApp/E-mail/Agendamentos, ver os docs específicos em [docs/](./README.md).

## Tabelas principais

| Table | Purpose |
|-------|---------|
| `products` | Livestock catalog (touros, matrizes, embriões, sêmen). `details`, `genealogia_json`, `avaliacao_genetica_json` são JSONB. |
| `crm_leads` | Sales pipeline. `position` drives Kanban ordering. UTM/attribution: `source`, `medium`, `campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, `referrer`, `landing_url` (populados por `/api/lp/lead`). **Central WhatsApp**: `interesse_principal`, `tags_whatsapp` (JSONB), `last_whatsapp_at`, `handoff_humano`, `handoff_at`, `handoff_responsavel`, `optout_whatsapp`, `optout_at`. **Central de E-mail**: `optout_email`, `optout_email_at`, `last_email_at`. |
| `profiles` | User roles (`admin` / `user`); referencia `auth.users`. |
| `breeders` | Breeder registry. |

## WhatsApp

| Table | Purpose |
|-------|---------|
| `whatsapp_messages` | Log conversacional. Colunas-chave: `direction` (inbound/outbound), `body`, `origin` (lp\|webhook\|manual\|campanha\|central-bot), `bot_step`, `campaign_id`, `template_id`, `lead_id`. |
| `whatsapp_templates` | Biblioteca de mensagens prontas da Central (slug único, body com `{nome}`, category, archived, usage_count). |
| `whatsapp_campaigns` | Campanhas/listas de transmissão segmentadas. `segment` (JSONB) com filtros aplicados a `crm_leads`. Status: `rascunho\|enviando\|concluida\|cancelada\|erro`. Regras de parada: `stop_on_reply`, `stop_on_optout`, `stop_on_handoff`, `stop_on_interest`. Reação à resposta: `reply_tag`, `reply_handoff`. Migration: `database/whatsapp_campaign_sequences.sql`. |
| `whatsapp_campaign_steps` | Passos adicionais (1+) da sequência. Passo 0 vive na própria campanha. `delay_value`/`delay_unit` (minutes\|hours\|days) relativo ao passo anterior + conteúdo (template ou body ou mídia). |
| `whatsapp_campaign_recipients` | Destinatários materializados ao disparar. Status: `pendente\|enviado\|falhou\|optout`. Sequência: `current_step`, `next_send_at`, `replied_at`, `stopped_at`, `stopped_reason` (`replied\|optout\|handoff\|interest\|completed\|cancelled\|error`). |
| `whatsapp_optouts` | Cache rápido de opt-outs por número (PK = phone). Espelhado em `crm_leads.optout_whatsapp`. |
| `whatsapp_flows` | Múltiplos fluxos nomeados (grafos completos). UM `is_active=true` por vez (constraint UNIQUE parcial). Colunas: `graph` (JSONB v2), `settings` (JSONB — parâmetros do fluxo, lidos por `loadActiveFlowWithSettings()`), `last_activated_at`. Inbound e render-welcome consultam o ativo. Migrations: `database/whatsapp_flows.sql` + `database/whatsapp_flows_settings.sql`. |
| `whatsapp_catalog_groups` | JID, nome, slug, ativo — grupos monitorados pela segunda sessão Baileys. |
| `whatsapp_catalog_detections` | Log de cada PDF detectado + candidatos + status (`pending\|matched\|ambiguous\|no_match\|attached\|manual`) + R2 key. |

## E-mail Marketing

| Table | Purpose |
|-------|---------|
| `email_templates` | Biblioteca de templates HTML reutilizáveis (slug único, subject, body_html, body_text, variables, category, archived, usage_count). |
| `email_campaigns` | Campanhas segmentadas. Mesmo padrão de `whatsapp_campaigns` mas com `subject`/`body_html`/`body_text`/`from_name`/`reply_to`. Status: `rascunho\|enviando\|concluida\|cancelada\|erro`. Regras de parada: `stop_on_optout`, `stop_on_interest`. `audience_tag` aplicada em `crm_leads.tags_whatsapp` ao disparar. |
| `email_campaign_steps` | Passos 1+ da sequência de follow-up. Mesmo modelo de `whatsapp_campaign_steps`. |
| `email_campaign_recipients` | Destinatários materializados. Status: `pendente\|enviado\|falhou\|optout`. Sequência: `current_step`, `next_send_at`, `stopped_at`, `stopped_reason` (`optout\|interest\|completed\|cancelled\|error\|bounce`). |
| `email_optouts` | Cache rápido de opt-outs por endereço (PK = email lowercased). Espelhado em `crm_leads.optout_email`. |
| `email_messages` | Log de envios (sempre `outbound` — Hostinger não dá inbound webhook). Colunas: `direction`, `subject`, `body_html`, `body_text`, `status` (`queued\|sent\|failed`), `origin` (`campanha\|template\|manual\|sistema`), `campaign_id`, `template_id`, `recipient_id`. |

## Tactical / OKR / Strategic

| Table | Purpose |
|-------|---------|
| `site_settings` | Feature flags e configuração (key/JSONB). Keys conhecidas: `whatsapp_flow` (legacy automation config), `whatsapp_flow_v2` (fallback do grafo — fonte da verdade nova é `whatsapp_flows`), `whatsapp_central_paused`, `whatsapp_catalogs_paused`, `whatsapp_group_link`, `agendamentos_calendar`. |
| `signup_verification_codes` | Códigos de signup de 6 dígitos (SHA-256 hash, expires_at, attempts). |
| `tactical_tasks` | ERP/Admin Kanban com `checklists` e `attachments` JSONB. WhatsApp-origin: `whatsapp_group_id`, `whatsapp_group_name`, `whatsapp_sender`, `whatsapp_sender_name`. |
| `tactical_task_attachments`, `tactical_task_comments`, `tactical_kanban_columns` | Companion tables do Kanban. |
| `tactical_contracts` | Contratos. Integração ClickSign: `clicksign_document_key`, `clicksign_status`, `clicksign_signers` (JSONB), `clicksign_signed_url`. Migration: `database/add_clicksign_to_tactical_contracts.sql`. |
| `tactical_members` | Team registry do tactical plan. |
| `tactical_objectives`, `tactical_key_results`, `tactical_task_kr_links` | OKR layer (`/web-admin/okr`). |
| `tactical_risks` | Risk register (populado por `/risco` no WhatsApp). |
| `tactical_decisions` | Decision log (populado por `/decisao` no WhatsApp). |
| `strategic_flows`, `strategic_stages` | Strategic-plan layer acima do tactical Kanban. |

## Leilões / ERP / Bula

| Table | Purpose |
|-------|---------|
| `cronograma_leiloes` | Cronograma de leilões (admin/site). Ganhou `catalogo_url`, `catalogo_anexado_em`, `catalogo_origem` pela integração de catálogos. |
| `erp_finance_accounts`, `erp_finance_categories`, `erp_finance_transactions` | ERP financeiro. |
| `erp_accounting_accounts`, `erp_accounting_journals`, `erp_accounting_journal_lines` | ERP contábil. |
| `erp_inventory_warehouses`, `erp_inventory_products`, `erp_inventory_stock`, `erp_inventory_movements` | ERP estoque. |
| `bula_membros`, `bula_leiloes`, `bula_leilao_assessores`, `bula_leilao_fechamento` | Bula auction core. |
| `bula_projeto_cards`, `bula_card_responsaveis` | Bula project Kanban cards. |
| `bula_crm_funis`, `bula_crm_deals`, `bula_leads`, `bula_marketing_config` | Bula CRM e marketing. |

## Agendamentos

| Table | Purpose |
|-------|---------|
| `agendamentos` | Reuniões via Calendly (ponte Google Calendar) ou manuais. Idempotência por `google_event_id` UNIQUE. Colunas: `source` (calendly\|google\|manual), `google_event_id`, `calendly_event_uri`, `summary`, `start_at`, `end_at`, `invitee_name/email/phone`, `status` (agendado\|confirmado\|concluido\|cancelado\|nao_compareceu), `meeting_url`, `lead_id` (FK `crm_leads`), `responsible_member_id`, `notes`, `tags` (JSONB), `cancelled_at`, `cancel_reason`, `raw_payload` (JSONB do Google pra debug), `last_synced_at`. Settings em `site_settings.agendamentos_calendar`. |
