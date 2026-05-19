-- ============================================================================
-- Template WhatsApp: link de agendamento (Calendly)
-- ============================================================================
-- Data: 2026-05-19
--
-- Slug `agendamento-link` — mensagem que o operador (ou o fluxo) envia pro lead
-- quando ele aceita marcar uma conversa com o Matheus.
--
-- IMPORTANTE: o link no body é o curto público `formuladoboi.com/agendar`
-- (rota em src/app/web-site/agendar/route.ts). Ele faz 302 pra URL real
-- configurada em `site_settings.agendamentos_calendar.calendly_event_url`,
-- escondendo o slug interno do Calendly (que tem o nome do usuário pessoal
-- que conectou a conta gratuita) do cliente.
--
-- Voz: Matheus, 1ª pessoa singular (mesmo tom dos triagem-* default).
-- Idempotente: usa ON CONFLICT pra atualizar se já existir.
-- ============================================================================

INSERT INTO public.whatsapp_templates (slug, title, category, body, variables) VALUES
(
    'agendamento-link',
    'Agendamento · link agenda',
    'agendamento',
    E'Perfeito, {nome}. Vou te mandar o link da minha agenda — escolhe o horário que te atende melhor (dias úteis, das 14h às 16h30, horário de Brasília):\n\nhttps://formuladoboi.com/agendar\n\nAssim que você confirmar, recebo aqui e te ligo no horário marcado.',
    '["nome"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    title     = EXCLUDED.title,
    category  = EXCLUDED.category,
    body      = EXCLUDED.body,
    variables = EXCLUDED.variables,
    archived  = false,
    updated_at = timezone('utc'::text, now());
