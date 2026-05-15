-- ─────────────────────────────────────────────────────────────────────────
-- bula_leilao_fechamento: campos de acordo comercial por leilão
-- ─────────────────────────────────────────────────────────────────────────
-- Cada fechamento agora carrega EXPLICITAMENTE o acordo comercial com o
-- promotor/leiloeira que originou a Receita Bula daquele leilão.
--
-- Por que: o acordo NÃO é regra geral. Pode ser:
--   • % sobre o faturamento total da leiloeira (ex.: 0,33% EAO; 1% 4R)
--   • % sobre a venda da cobertura Fórmula+Bula (ex.: 5% Embrião Matinha)
--   • combinação dos dois (ex.: 1,5%+3% Santa Fé; 1%+3% Santa Nazaré)
--
-- Fonte autoritativa: F.xlsx (planilha viva mantida pelo chefe).
--
-- Os campos abaixo são NULLABLE — fechamento sem acordo cadastrado mantém
-- comportamento legado (receita_bula informada manualmente).

ALTER TABLE bula_leilao_fechamento
    ADD COLUMN IF NOT EXISTS acordo_pct_faturamento     numeric(7,5),
    ADD COLUMN IF NOT EXISTS acordo_pct_venda_cobertura numeric(7,5),
    ADD COLUMN IF NOT EXISTS acordo_descricao           text;

COMMENT ON COLUMN bula_leilao_fechamento.acordo_pct_faturamento
    IS 'Decimal: % do faturamento total da LEILOEIRA que vira Receita Bula. Ex: 0.0033 = 0,33%. NULL se o acordo não usa esta base.';
COMMENT ON COLUMN bula_leilao_fechamento.acordo_pct_venda_cobertura
    IS 'Decimal: % sobre a venda da cobertura Fórmula+Bula (vgv_total). Ex: 0.03 = 3%. NULL se o acordo não usa esta base.';
COMMENT ON COLUMN bula_leilao_fechamento.acordo_descricao
    IS 'Texto livre do acordo conforme F.xlsx. Ex: "1% do faturamento total + 3% da venda".';

-- ─────────────────────────────────────────────────────────────────────────
-- Backfill dos 7 leilões da F.xlsx (snapshot 2026-05-15)
-- ─────────────────────────────────────────────────────────────────────────

-- 6º Mega EAO – Fêmeas (02/05/2026) — 0,33% × faturamento leiloeira
UPDATE bula_leilao_fechamento SET
    faturamento_total_leilao = 17682200,
    acordo_pct_faturamento   = 0.0033,
    acordo_descricao         = '0,33% do faturamento total do leilão'
WHERE id = '145dbec3-8a8f-4463-8076-a2cca5be2876'::uuid;

-- 6º Mega EAO – Touros (03/05/2026) — 0,33% × faturamento leiloeira
UPDATE bula_leilao_fechamento SET
    faturamento_total_leilao = 7073500,
    acordo_pct_faturamento   = 0.0033,
    acordo_descricao         = '0,33% do faturamento total do leilão'
WHERE id = '293de295-32b9-4256-976e-ef344b2667b8'::uuid;

-- 2º Leilão Pintado Raiz (05/05/2026) — 1% × faturamento leiloeira
UPDATE bula_leilao_fechamento SET
    faturamento_total_leilao = 458800,
    acordo_pct_faturamento   = 0.01,
    acordo_descricao         = '1% do faturamento total do leilão'
WHERE id = 'b6370f22-daa4-4f1c-b9a4-2511e5715c0a'::uuid;

-- Leilão Matinha Embrio (05/05/2026) — 5% × venda cobertura
UPDATE bula_leilao_fechamento SET
    faturamento_total_leilao = NULL,
    acordo_pct_venda_cobertura = 0.05,
    acordo_descricao           = '5% da venda da cobertura (Fórmula+Bula)'
WHERE id = '0e0eb3a2-6701-4662-9ae5-44172d3c8b72'::uuid;

-- Leilão Matrizes Fazenda Santa Fé (07/05/2026) — 1,5% × fat. + 3% × venda
UPDATE bula_leilao_fechamento SET
    faturamento_total_leilao   = 960000,
    acordo_pct_faturamento     = 0.015,
    acordo_pct_venda_cobertura = 0.03,
    acordo_descricao           = '1,5% do faturamento total + 3% da venda da cobertura'
WHERE id = '3314a71a-dd01-423e-b559-9e9a49fdbf83'::uuid;

-- 32º Leilão 4R (09/05/2026) — 1% × faturamento leiloeira
UPDATE bula_leilao_fechamento SET
    faturamento_total_leilao = 4123500,
    acordo_pct_faturamento   = 0.01,
    acordo_descricao         = '1% do faturamento total do leilão'
WHERE id = 'b3d1c05c-2d37-4f9d-b1e4-a21c12540619'::uuid;

-- Leilão Excelência Santa Nazaré (14/05/2026) — 1% × fat. + 3% × venda
UPDATE bula_leilao_fechamento SET
    faturamento_total_leilao   = 1142800,
    acordo_pct_faturamento     = 0.01,
    acordo_pct_venda_cobertura = 0.03,
    acordo_descricao           = '1% do faturamento total + 3% da venda da cobertura'
WHERE id = 'a9f50214-603d-4580-b3be-602a7065ec37'::uuid;
