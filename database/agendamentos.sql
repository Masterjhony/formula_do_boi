-- ============================================================================
-- Agendamentos — bookings vindos do Calendly (via Google Calendar) + manuais
-- ============================================================================
-- Data: 2026-05-19
--
-- Arquitetura: como o plano gratuito do Calendly não dá API token nem webhooks,
-- usamos o Google Calendar como ponte. O Calendly cria eventos no calendário
-- configurado pelo dono da conta; nós lemos esses eventos via Google Calendar
-- API (service account) e materializamos aqui pra exibir em /web-admin/agendamentos.
--
-- Por que tabela separada (não usar agenda_events):
--   - agenda_events é a agenda OPERACIONAL interna (reunião, prazo, follow_up
--     da equipe). Agendamentos têm invitee externo, source externo, ciclo de
--     vida diferente (cancelamento sem aviso, no-show, lead vinculado).
--   - Idempotência do sync depende de google_event_id UNIQUE — não dá pra
--     misturar com a agenda manual.
-- ============================================================================


CREATE TABLE IF NOT EXISTS public.agendamentos (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Origem do registro
    source                  TEXT NOT NULL DEFAULT 'calendly',
        -- calendly | google | manual
    google_event_id         TEXT UNIQUE,             -- id do evento no Google Calendar (idempotência do sync)
    google_calendar_id      TEXT,                    -- calendar onde o evento mora
    calendly_event_uri      TEXT,                    -- URL/URI extraído da descrição se disponível

    -- Dados básicos
    summary                 TEXT NOT NULL,
    description             TEXT,
    start_at                TIMESTAMPTZ NOT NULL,
    end_at                  TIMESTAMPTZ,
    timezone                TEXT DEFAULT 'America/Sao_Paulo',
    location                TEXT,                    -- "Phone call", "Google Meet (link)", endereço, etc.
    meeting_url             TEXT,                    -- link de videoconferência se houver

    -- Convidado (invitee)
    invitee_name            TEXT,
    invitee_email           TEXT,
    invitee_phone           TEXT,                    -- formato dígitos com DDI (55…)

    -- Estado operacional
    status                  TEXT NOT NULL DEFAULT 'agendado',
        -- agendado | confirmado | concluido | cancelado | nao_compareceu
    cancelled_at            TIMESTAMPTZ,
    cancel_reason           TEXT,
    notes                   TEXT,                    -- observações internas (não vem do Calendly)
    tags                    JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Vínculos
    lead_id                 UUID REFERENCES public.crm_leads(id)        ON DELETE SET NULL,
    responsible_member_id   UUID REFERENCES public.tactical_members(id) ON DELETE SET NULL,
    linked_leilao_id        UUID REFERENCES public.cronograma_leiloes(id) ON DELETE SET NULL,
    linked_task_id          UUID REFERENCES public.tactical_tasks(id)   ON DELETE SET NULL,

    -- Telemetria do sync
    raw_payload             JSONB,                   -- payload original do Google pra debug
    last_synced_at          TIMESTAMPTZ,

    created_by              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT agendamentos_source_chk CHECK (source IN ('calendly','google','manual')),
    CONSTRAINT agendamentos_status_chk CHECK (status IN ('agendado','confirmado','concluido','cancelado','nao_compareceu'))
);

CREATE INDEX IF NOT EXISTS agendamentos_start_idx       ON public.agendamentos (start_at);
CREATE INDEX IF NOT EXISTS agendamentos_status_idx      ON public.agendamentos (status);
CREATE INDEX IF NOT EXISTS agendamentos_lead_idx        ON public.agendamentos (lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS agendamentos_invitee_email_idx ON public.agendamentos (invitee_email) WHERE invitee_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS agendamentos_invitee_phone_idx ON public.agendamentos (invitee_phone) WHERE invitee_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS agendamentos_source_idx      ON public.agendamentos (source);

-- updated_at auto (reaproveita função existente; se não existir, cria local)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'touch_updated_at'
    ) THEN
        CREATE OR REPLACE FUNCTION public.touch_updated_at()
        RETURNS TRIGGER AS $f$
        BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
        $f$ LANGUAGE plpgsql;
    END IF;
END $$;

DROP TRIGGER IF EXISTS trg_agendamentos_updated_at ON public.agendamentos;
CREATE TRIGGER trg_agendamentos_updated_at
    BEFORE UPDATE ON public.agendamentos
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agendamentos_full_access" ON public.agendamentos;
CREATE POLICY "agendamentos_full_access"
    ON public.agendamentos FOR ALL
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');


-- ────────────────────────────────────────────────────────────────────────────
-- site_settings: armazena configuração do sync Calendly/Google Calendar
-- ────────────────────────────────────────────────────────────────────────────
-- Chave: 'agendamentos_calendar'
-- Valor: {
--   "google_calendar_id": "joaoeduardo@gmail.com",       -- email/id do calendar
--   "calendly_event_url": "https://calendly.com/joaoeduardo-lp1/contato-cliente",
--   "default_responsible_member_id": "uuid|null",
--   "auto_link_lead_by_email": true,
--   "auto_link_lead_by_phone": true,
--   "sync_window_past_days": 7,
--   "sync_window_future_days": 90
-- }
INSERT INTO public.site_settings (key, value)
VALUES (
    'agendamentos_calendar',
    jsonb_build_object(
        'google_calendar_id', '6e8bde2aee3335f37e43720610a9547ff7b54ea2b898e0b53d3777f50e2d0f3a@group.calendar.google.com',
        'calendly_event_url', 'https://calendly.com/joaoeduardo-lp1/contato-cliente',
        'default_responsible_member_id', NULL,
        'auto_link_lead_by_email', true,
        'auto_link_lead_by_phone', true,
        'sync_window_past_days', 7,
        'sync_window_future_days', 90
    )
)
ON CONFLICT (key) DO UPDATE SET
    -- Se a chave já existir mas o google_calendar_id ainda estiver vazio
    -- (operador rodou a migration antes de configurar o Calendly), seta
    -- agora. Preserva qualquer valor que o operador já tenha mexido pela UI.
    value = CASE
        WHEN COALESCE(public.site_settings.value->>'google_calendar_id', '') = '' THEN
            jsonb_set(public.site_settings.value, '{google_calendar_id}',
                to_jsonb('6e8bde2aee3335f37e43720610a9547ff7b54ea2b898e0b53d3777f50e2d0f3a@group.calendar.google.com'::text))
        ELSE public.site_settings.value
    END;
