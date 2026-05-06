-- ============================================================
-- Ajuste — Contas a receber (ERP) — diretiva chefe 06/05/2026
--
--   1) MAFRA  → era apenas R$ 19.200 (estava duplicado).
--      Mantém 1 entrada canônica e remove duplicatas.
--
--   2) 6º Mega EAO – Fêmeas (02/05/2026) → receita Bula = 0,33% sobre VGV.
--      0,33% × R$ 612.900 = R$ 2.022,57  (antes: 1% / R$ 6.129)
--
--   3) 6º Mega EAO – Touros/Machos (03/05/2026) → receita Bula = 0,33% sobre VGV.
--      0,33% × R$ 640.500 = R$ 2.113,65  (antes: 1% / R$ 6.405)
--
-- Atualiza tanto erp_finance_transactions (a receber) quanto
-- bula_leilao_fechamento (receita_bula / sobra_bruta).
-- ============================================================


-- ── 1) MAFRA — deduplicar a receber (manter 1 × R$ 19.200) ───
-- Casa qualquer "Receita%MAFRA%" tipo income lançada em 04–05/2026,
-- mantém o mais antigo (created_at) e apaga os demais.
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM public.erp_finance_transactions
  WHERE type = 'income'
    AND description ILIKE '%MAFRA%'
    AND description ILIKE 'Receita%'
    AND transaction_date BETWEEN '2026-04-01' AND '2026-05-31'
)
DELETE FROM public.erp_finance_transactions
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Garante que a entrada remanescente está com o valor / descrição canônicos
UPDATE public.erp_finance_transactions
SET amount      = 19200,
    description = 'Receita Bula – MAFRA – 4% – Leilão 29/04/2026',
    observacao  = 'A receber da promotora MAFRA. Acordo 4% sobre VGV vendido (R$ 480.000) — leilão não estava na agenda original. Cliente do Douglas Bispo levou Lts 19 e 20 (Agropecuária Vale do Ouro / Parazão – Itaituba/PA). 4% × 480.000 = R$ 19.200. Diretiva chefe 06/05: era duplicado — mantida apenas 1 entrada.',
    updated_at  = NOW()
WHERE type = 'income'
  AND description ILIKE '%MAFRA%'
  AND transaction_date BETWEEN '2026-04-01' AND '2026-05-31';


-- ── 2) 6º Mega EAO – Fêmeas (02/05/2026) → 0,33% ───────────────
-- 0,33% × R$ 612.900 = R$ 2.022,57
UPDATE public.erp_finance_transactions
SET amount      = 2022.57,
    description = 'Receita Bula – EAO Agropecuária – 0,33% – 6º Mega EAO Fêmeas 02/05/2026',
    observacao  = 'A receber da EAO Agropecuária (promotora). VGV total R$ 612.900 × 0,33% (acordo confirmado pelo chefe 06/05) = R$ 2.022,57. 9 lotes fechados, 15 animais, 6 compradores únicos.',
    updated_at  = NOW()
WHERE type = 'income'
  AND transaction_date = '2026-05-02'
  AND description ILIKE '%EAO%'
  AND description ILIKE 'Receita%';

UPDATE public.bula_leilao_fechamento
SET receita_bula = 2022.57,
    sobra_bruta  = 2022.57 - COALESCE(comissao_assessoria, 0),
    updated_at   = NOW()
WHERE data = '2026-05-02'
  AND nome = '6º Mega EAO – Fêmeas – Expozebu 02/05/2026';


-- ── 3) 6º Mega EAO – Touros (03/05/2026) → 0,33% ───────────────
-- 0,33% × R$ 640.500 = R$ 2.113,65
UPDATE public.erp_finance_transactions
SET amount      = 2113.65,
    description = 'Receita Bula – EAO Agropecuária – 0,33% – 6º Mega EAO Touros 03/05/2026',
    observacao  = 'A receber da EAO Agropecuária (promotora). VGV total R$ 640.500 × 0,33% (acordo confirmado pelo chefe 06/05) = R$ 2.113,65. 16 lotes fechados, 19 animais, 5 compradores.',
    updated_at  = NOW()
WHERE type = 'income'
  AND transaction_date = '2026-05-03'
  AND description ILIKE '%EAO%'
  AND description ILIKE 'Receita%';

UPDATE public.bula_leilao_fechamento
SET receita_bula = 2113.65,
    sobra_bruta  = 2113.65 - COALESCE(comissao_assessoria, 0),
    updated_at   = NOW()
WHERE data = '2026-05-03'
  AND nome = '6º Mega EAO – Touros – Expozebu 03/05/2026';


-- ── Conferência rápida (rodar manualmente após aplicar) ─────────
-- SELECT description, amount, transaction_date
--   FROM public.erp_finance_transactions
--  WHERE type = 'income'
--    AND (description ILIKE '%MAFRA%' OR description ILIKE '%EAO%')
--    AND transaction_date BETWEEN '2026-04-01' AND '2026-05-31'
--  ORDER BY transaction_date;
