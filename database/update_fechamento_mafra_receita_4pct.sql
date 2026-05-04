-- ============================================================
-- UPDATE — Fechamento MAFRA 29/04/2026
-- Acordo informado pelo chefe (WhatsApp 02/05): "acordo lá foi 4%
-- do que vender". Interpretação: 4% = receita Bula sobre VGV total.
-- Comissão Douglas Bispo (2%) já foi lançada — mantida.
--
--   VGV total       = R$ 480.000
--   Receita Bula    = 4% × 480.000 = R$ 19.200  (a receber da MAFRA)
--   Comissão Douglas = R$  9.600  (já existente — a pagar)
--   Sobra bruta     = 19.200 − 9.600 = R$ 9.600
-- ============================================================

UPDATE public.bula_leilao_fechamento
SET receita_bula = 19200,
    sobra_bruta  = 19200 - COALESCE(comissao_assessoria, 0),
    observacoes  = 'Leilão não previsto na agenda — venda registrada via WhatsApp pelo assessor. Lt 20 = aspiração da REM 2484N; Lt 19 = 100% do animal 3355. Comprador estreante: Agropecuária Vale do Ouro (Parazão), Itaituba/PA. Único assessor: Douglas Bispo (Bula Assessoria, taxa 2%). Acordo com promotora MAFRA = 4% sobre VGV vendido (R$ 19.200 a receber). Conta a pagar Douglas: R$ 9.600. Sobra bruta: R$ 9.600.',
    updated_at   = NOW()
WHERE data = '2026-04-29'
  AND nome = 'Leilão MAFRA – 29/04/2026';

-- ── CONTA A RECEBER — RECEITA BULA × MAFRA ───────────────────
-- 4% sobre VGV total R$ 480.000 = R$ 19.200 (acordo informado)
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Recebimentos' AND type = 'income' LIMIT 1),
  'income',
  19200,
  'Receita Bula – MAFRA – 4% – Leilão 29/04/2026',
  'A receber da promotora MAFRA. Acordo especial: 4% sobre VGV vendido (R$ 480.000) — leilão não estava na agenda original. Cliente do Douglas Bispo levou Lts 19 e 20 (Agropecuária Vale do Ouro / Parazão – Itaituba/PA). 4% × 480.000 = R$ 19.200.',
  '2026-04-29',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Receita Bula – MAFRA – 4% – Leilão 29/04/2026'
    AND transaction_date = '2026-04-29'
);
