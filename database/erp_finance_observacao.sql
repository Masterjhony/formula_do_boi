-- Adiciona campo observacao nas transações financeiras
ALTER TABLE public.erp_finance_transactions
    ADD COLUMN IF NOT EXISTS observacao TEXT;
