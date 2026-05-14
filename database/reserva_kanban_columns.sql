-- Colunas customizáveis do Kanban de Reservas (/web-admin/reservas).
--
-- Mesmo padrão da tactical_kanban_columns: a fonte da verdade do board é a
-- tabela. O id é um slug estável (referenciado por product_reservations.status)
-- e o title é o rótulo editável exibido no header da coluna.
--
-- Os 5 status especiais (expirada, cancelada_cliente, etc.) seguem hardcoded
-- em src/lib/reservations.ts (RESERVA_SPECIAL_STAGES) — eles não são parte do
-- fluxo principal e não são editáveis pelo operador.

CREATE TABLE IF NOT EXISTS public.reserva_kanban_columns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    hint TEXT,
    position INTEGER NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reserva_kanban_columns_position_idx
    ON public.reserva_kanban_columns (position);

-- updated_at automático
CREATE OR REPLACE FUNCTION public.reserva_kanban_columns_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reserva_kanban_columns_set_updated_at
    ON public.reserva_kanban_columns;
CREATE TRIGGER reserva_kanban_columns_set_updated_at
    BEFORE UPDATE ON public.reserva_kanban_columns
    FOR EACH ROW EXECUTE FUNCTION public.reserva_kanban_columns_set_updated_at();

-- RLS — padrão do projeto: authenticated tem acesso total
ALTER TABLE public.reserva_kanban_columns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reserva_kanban_columns_read_authenticated"
    ON public.reserva_kanban_columns;
CREATE POLICY "reserva_kanban_columns_read_authenticated"
    ON public.reserva_kanban_columns
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "reserva_kanban_columns_write_authenticated"
    ON public.reserva_kanban_columns;
CREATE POLICY "reserva_kanban_columns_write_authenticated"
    ON public.reserva_kanban_columns
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ── Seed: 10 estágios canônicos do fluxo de reservas ──────────────────────
-- IDs batem com os slugs que product_reservations.status já usa, então
-- nenhuma migração de dados é necessária.
INSERT INTO public.reserva_kanban_columns (id, title, hint, position) VALUES
    ('nova',                  '1. Nova reserva',         'Pedido chegou do site',                                  1000),
    ('qualificacao',          '2. Em qualificação',      'Conferir cliente, qtde e condições',                     2000),
    ('aguardando_central',    '3. Aguardando central',   'Confirmar disponibilidade junto à central/criador',      3000),
    ('confirmada',            '4. Reserva confirmada',   'Doses bloqueadas pro cliente',                           4000),
    ('aguardando_pagamento',  '5. Aguardando pagamento', 'Cliente recebeu instruções de pagamento',                5000),
    ('pagamento_validado',    '6. Pagamento validado',   'Comprovação aprovada',                                   6000),
    ('faturamento',           '7. Faturamento',          'NF, contrato, ordem de envio',                           7000),
    ('preparacao_logistica',  '8. Preparação logística', 'Organizar retirada/envio',                               8000),
    ('enviado',               '9. Enviado / retirado',   'Pedido saiu da central',                                 9000),
    ('finalizado',            '10. Finalizado',          'Entrega confirmada, histórico fechado',                 10000)
ON CONFLICT (id) DO NOTHING;
