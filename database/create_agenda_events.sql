-- ============================================================
-- AGENDA OFICIAL
-- Central operacional temporal do Fórmula do Boi.
-- Cada evento (leilão, reunião, prazo, publicação, follow-up,
-- tarefa interna, financeiro, jurídico, pós-evento) pode estar
-- ligado a projeto, leilão, tarefa, criador, cliente, produto
-- ou contrato — abrir o evento mostra o contexto completo, e
-- abrir o projeto/leilão mostra sua agenda relacionada.
--
-- Execute no SQL Editor do Supabase Dashboard.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agenda_events (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                 TEXT NOT NULL,
    description           TEXT,
    event_type            TEXT NOT NULL DEFAULT 'tarefa_interna',
        -- leilao | reuniao | prazo | publicacao | follow_up
        -- | tarefa_interna | financeiro | juridico | pos_evento
    status                TEXT NOT NULL DEFAULT 'planejado',
        -- planejado | em_andamento | pendente | atrasado | concluido | cancelado
    priority              TEXT NOT NULL DEFAULT 'media',
        -- baixa | media | alta
    start_at              TIMESTAMPTZ NOT NULL,
    end_at                TIMESTAMPTZ,
    all_day               BOOLEAN NOT NULL DEFAULT FALSE,
    location              TEXT,
    color                 TEXT,
    notes                 TEXT,

    -- Recorrência simples (none | daily | weekly | monthly)
    recurrence_rule       TEXT,
    recurrence_until      DATE,

    -- Responsável: tactical_members é a fonte para equipe operacional
    responsible_member_id UUID REFERENCES public.tactical_members(id) ON DELETE SET NULL,

    -- Vínculos opcionais (cada item da agenda pode estar amarrado
    -- a UM ou MAIS dos contextos abaixo)
    linked_leilao_id      UUID    REFERENCES public.cronograma_leiloes(id) ON DELETE SET NULL,
    linked_task_id        UUID    REFERENCES public.tactical_tasks(id)     ON DELETE SET NULL,
    linked_flow_id        UUID    REFERENCES public.strategic_flows(id)    ON DELETE SET NULL,
    linked_product_id     INTEGER REFERENCES public.products(id)           ON DELETE SET NULL,
    linked_breeder_id     INTEGER REFERENCES public.breeders(id)           ON DELETE SET NULL,
    linked_lead_id        UUID    REFERENCES public.crm_leads(id)          ON DELETE SET NULL,
    linked_contract_id    UUID    REFERENCES public.tactical_contracts(id) ON DELETE SET NULL,

    created_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agenda_events_start_idx       ON public.agenda_events (start_at);
CREATE INDEX IF NOT EXISTS agenda_events_type_idx        ON public.agenda_events (event_type);
CREATE INDEX IF NOT EXISTS agenda_events_status_idx      ON public.agenda_events (status);
CREATE INDEX IF NOT EXISTS agenda_events_leilao_idx      ON public.agenda_events (linked_leilao_id);
CREATE INDEX IF NOT EXISTS agenda_events_task_idx        ON public.agenda_events (linked_task_id);
CREATE INDEX IF NOT EXISTS agenda_events_flow_idx        ON public.agenda_events (linked_flow_id);
CREATE INDEX IF NOT EXISTS agenda_events_responsible_idx ON public.agenda_events (responsible_member_id);

-- updated_at auto
CREATE OR REPLACE FUNCTION public.update_agenda_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_agenda_events_updated_at ON public.agenda_events;
CREATE TRIGGER trg_agenda_events_updated_at
BEFORE UPDATE ON public.agenda_events
FOR EACH ROW EXECUTE FUNCTION public.update_agenda_events_updated_at();

-- RLS: mesmas regras das demais tabelas operacionais
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agenda_events_select_authenticated" ON public.agenda_events;
CREATE POLICY "agenda_events_select_authenticated"
ON public.agenda_events FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "agenda_events_all_authenticated" ON public.agenda_events;
CREATE POLICY "agenda_events_all_authenticated"
ON public.agenda_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
