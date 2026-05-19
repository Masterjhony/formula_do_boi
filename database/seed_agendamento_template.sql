-- ============================================================================
-- Template WhatsApp: link de agendamento (Calendly)
-- ============================================================================
-- Data: 2026-05-19
--
-- Slug `agendamento-link` — mensagem que o operador (ou o fluxo) envia pro lead
-- quando ele aceita marcar uma conversa com o Matheus. O link aponta pro
-- evento Calendly configurado em site_settings.agendamentos_calendar.
--
-- Voz: Matheus, 1ª pessoa singular (mesmo tom dos triagem-* default).
-- Idempotente: usa ON CONFLICT pra atualizar se já existir.
-- ============================================================================

INSERT INTO public.whatsapp_templates (slug, title, category, body, variables) VALUES
(
    'agendamento-link',
    'Agendamento · link Calendly',
    'agendamento',
    E'Perfeito, {nome}. Vou te mandar o link da minha agenda — escolhe o horário que te atende melhor (dias úteis, das 14h às 16h30, horário de Brasília):\n\nhttps://calendly.com/joaoeduardo-lp1/contato-cliente\n\nAssim que você confirmar, recebo aqui e te ligo no horário marcado.',
    '["nome"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    title     = EXCLUDED.title,
    category  = EXCLUDED.category,
    body      = EXCLUDED.body,
    variables = EXCLUDED.variables,
    archived  = false,
    updated_at = timezone('utc'::text, now());
