-- Tabela de gerenciamento de reservas vindas do site público
-- (catálogo de Sêmen e Embriões em /semen e /embrioes).
--
-- Funciona como fila Kanban operacional com 10 estágios fixos:
--   nova → qualificacao → aguardando_central → confirmada →
--   aguardando_pagamento → pagamento_validado → faturamento →
--   preparacao_logistica → enviado → finalizado
--
-- Status especiais paralelos (cards podem voltar pro fluxo via mudança manual):
--   expirada, cancelada_cliente, cancelada_indisponibilidade,
--   pendencia_fiscal, problema_logistico
--
-- Os blocos do card (Cliente/Produto/Reserva/Financeiro/Faturamento/Logística/
-- Histórico) são todos persistidos aqui — o card não depende da memória da equipe.

CREATE SEQUENCE IF NOT EXISTS public.product_reservations_seq START 1001;

CREATE TABLE IF NOT EXISTS public.product_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seq BIGINT NOT NULL DEFAULT nextval('public.product_reservations_seq') UNIQUE,

    -- ── Produto reservado (snapshot denormalizado pra histórico imutável)
    product_id BIGINT,
    product_name TEXT NOT NULL,
    product_category TEXT NOT NULL,    -- 'Sêmen' | 'Embrião' | …
    product_kind TEXT NOT NULL,        -- 'semen' | 'embriao'
    central TEXT,                       -- ex.: 'Central Bela Vista' / criador da doadora

    -- ── Cliente
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_doc TEXT,                  -- CPF / CNPJ
    customer_fazenda TEXT,
    customer_city TEXT,
    customer_uf TEXT,

    -- ── Pedido
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2),
    total_value NUMERIC(12,2),
    payment_method TEXT,                -- 'avista' | '8x_boleto' | '12x_cartao' | …
    payment_status TEXT DEFAULT 'pendente',  -- pendente | sinal_pago | pago | estornado
    payment_proof_url TEXT,
    down_payment NUMERIC(12,2),

    -- ── Fluxo (Kanban)
    status TEXT NOT NULL DEFAULT 'nova',
    position INTEGER NOT NULL DEFAULT 1000,
    priority TEXT NOT NULL DEFAULT 'normal',  -- baixa | normal | alta

    -- ── Operacional
    assigned_to TEXT,                   -- responsável interno (texto livre)
    origin TEXT NOT NULL DEFAULT 'site',  -- site | manual | whatsapp | leilao
    expires_at TIMESTAMPTZ,             -- prazo de validade da reserva

    -- Faturamento
    invoice_status TEXT,                -- pendente | emitida | cancelada
    invoice_number TEXT,
    invoice_issued_at TIMESTAMPTZ,
    fiscal_notes TEXT,

    -- Logística
    logistics_type TEXT,                -- envio | retirada
    expected_ship_at DATE,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    tracking_code TEXT,
    logistics_responsible TEXT,

    -- ── Atribuição (UTM)
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    gclid TEXT,
    fbclid TEXT,
    referrer TEXT,
    landing_url TEXT,

    -- ── Conteúdo rico
    notes TEXT,
    checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    history JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- history: [{ at: ISO, kind: 'status'|'note'|'attachment'|…, from?, to?, by?, text? }]

    -- ── Vínculos opcionais
    lead_id UUID,

    -- ── Auditoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS product_reservations_status_idx
    ON public.product_reservations (status, position);
CREATE INDEX IF NOT EXISTS product_reservations_archived_idx
    ON public.product_reservations (archived_at);
CREATE INDEX IF NOT EXISTS product_reservations_created_idx
    ON public.product_reservations (created_at DESC);
CREATE INDEX IF NOT EXISTS product_reservations_phone_idx
    ON public.product_reservations (customer_phone);
CREATE INDEX IF NOT EXISTS product_reservations_kind_idx
    ON public.product_reservations (product_kind);

-- ── RLS ───────────────────────────────────────────────────────────────────
-- Mesmo padrão de `tactical_tasks`: RLS ligada, policies permissivas pra
-- qualquer authenticated (ferramenta interna do admin). O POST público em
-- /api/reservas usa SUPABASE_SERVICE_ROLE_KEY, então passa por cima da RLS —
-- nenhum cliente anon precisa enxergar essa tabela.
ALTER TABLE public.product_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_reservations_read_authenticated"
    ON public.product_reservations;
CREATE POLICY "product_reservations_read_authenticated"
    ON public.product_reservations
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "product_reservations_write_authenticated"
    ON public.product_reservations;
CREATE POLICY "product_reservations_write_authenticated"
    ON public.product_reservations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- updated_at automático
CREATE OR REPLACE FUNCTION public.product_reservations_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_reservations_set_updated_at
    ON public.product_reservations;
CREATE TRIGGER product_reservations_set_updated_at
    BEFORE UPDATE ON public.product_reservations
    FOR EACH ROW EXECUTE FUNCTION public.product_reservations_set_updated_at();
