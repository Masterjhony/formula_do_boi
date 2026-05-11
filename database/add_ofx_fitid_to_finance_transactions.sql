-- Adiciona vínculo idempotente entre transações do ERP e linhas STMTTRN do extrato OFX.
-- O campo recebe o FITID do banco; o índice único parcial impede duplicar a mesma
-- linha do extrato para a mesma conta, sem bloquear transações criadas manualmente
-- (que ficam com ofx_fitid NULL).
ALTER TABLE public.erp_finance_transactions
    ADD COLUMN IF NOT EXISTS ofx_fitid TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS erp_finance_transactions_account_fitid_uidx
    ON public.erp_finance_transactions (account_id, ofx_fitid)
    WHERE ofx_fitid IS NOT NULL;

-- Tabela leve para FITIDs que o usuário marcou como "ignorar" durante a conciliação OFX.
-- Permite que o painel não traga de volta linhas já descartadas em importações repetidas
-- do mesmo extrato (ex.: tarifas que não viraram lançamento).
CREATE TABLE IF NOT EXISTS public.erp_finance_ofx_ignored (
    account_id  UUID NOT NULL REFERENCES public.erp_finance_accounts(id) ON DELETE CASCADE,
    fitid       TEXT NOT NULL,
    ignored_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason      TEXT,
    PRIMARY KEY (account_id, fitid)
);

ALTER TABLE public.erp_finance_ofx_ignored ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ofx_ignored_all_authenticated"
    ON public.erp_finance_ofx_ignored;
CREATE POLICY "ofx_ignored_all_authenticated"
    ON public.erp_finance_ofx_ignored
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
