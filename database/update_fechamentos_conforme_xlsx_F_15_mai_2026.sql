-- ============================================================
-- AJUSTE DE FECHAMENTOS — CONFORME PLANILHA F.xlsx DO CHEFE
-- Compartilhada em 15/05/2026 como fonte autoritativa.
-- ============================================================
-- Resumo das linhas afetadas (todas têm valor confirmado na xlsx):
--
--   Leilão                    | Receita Bula  | Comissões                                  | Lucro
--   --------------------------|---------------|--------------------------------------------|---------
--   EAO Fêmeas    (02/05/26)  | R$ 58.351,26  | Fábio 8.667 + Douglas 5.520 + Bulinha 960  | 43.204,26
--   EAO Touros    (03/05/26)  | R$ 23.342,55  | Fábio 1.125 + Bulinha 12.060               | 10.157,55
--   Pintado Raiz  (05/05/26)  | R$  4.588,00  | Fábio 3.996 + Mateus 552                   |     40,00
--   Matinha Embrio(05/05/26)  | R$  2.400,00  | Marcelo 2.400                              |      0,00
--   Santa Fé      (07/05/26)  | R$ 20.610,00  | Fábio 1.890 + Douglas 2.280 + Marcelo 600  | 15.840,00 (já está correto)
--   Leilão 4R     (09/05/26)  | R$ 41.235,00  | Fábio 2.205 + Marcelo 1.830                | 37.200,00
--   Santa Nazaré  (14/05/26)  | R$ 17.908,00  | Fábio 744 + Marcelo 3.842                  | 13.322,00 (no insert dedicado)
--
-- Pontos de atenção (flags):
--   • Pintado Raiz: jsonb por_assessor mostra Marcelo (9 lotes) + Mateus
--     Alves (1 lote). Xlsx paga Fábio 3% × R$ 133.200 + Mateus 2% × R$
--     27.600. A divergência Marcelo↔Fábio pode ser: (a) seed atribuiu
--     errado o assessor; (b) chefe consolidou pagamento em Fábio.
--     Lança conforme xlsx; revisar atribuição com o chefe.
--   • EAO Fêmeas: Bulinha R$ 960 ≈ 2% × R$ 48.000 (= Lt 64 que está
--     atribuído a Marcelo Carneiro no jsonb). Mesma dúvida — lança
--     conforme xlsx; revisar.
--   • EAO Fêmeas/Touros: receita Bula tinha sido lançada como 1% via
--     update_fechamento_mega_eao_oficial.sql (que está marcado OBSOLETO
--     mas pode ter rodado). Esta migration sobrescreve para 0,33%
--     conforme acordo real da xlsx (coluna ACORDO = 0,0033).
-- ============================================================


-- ============================================================
-- 1) 6º MEGA EAO – FÊMEAS – 02/05/2026
-- ============================================================
UPDATE public.bula_leilao_fechamento
SET receita_bula        = 58351.26,
    comissao_assessoria = 15147,          -- 8.667 + 5.520 + 960
    sobra_bruta         = 43204.26,
    observacoes          = observacoes || ' [F.xlsx 15/05/2026] Acordo confirmado: 0,33% sobre faturamento total oficial R$ 17.682.200 = R$ 58.351,26 receita Bula. Comissões a pagar conforme xlsx: Fábio 3% × R$ 288.900 = R$ 8.667; Douglas 2% × R$ 276.000 = R$ 5.520; Bulinha R$ 960 (≈2% × Lt 64 R$ 48.000 — jsonb mostra esse lote atribuído a Marcelo Carneiro; revisar atribuição com o chefe). Total comissões R$ 15.147. Sobra bruta R$ 43.204,26.',
    updated_at          = NOW()
WHERE nome = '6º Mega EAO – Fêmeas – Expozebu 02/05/2026'
  AND data = '2026-05-02';

-- ── ERP: Fábio Omena (xlsx: R$ 8.667 — antes R$ 5.778)
UPDATE public.erp_finance_transactions
SET amount      = 8667,
    observacao  = '[F.xlsx 15/05/2026] Leilão 02/05/2026 – 6º Mega EAO Fêmeas. VGV Fábio: R$ 288.900 (Lts 31, 74·75, 96). Comissão conforme xlsx: 3% × R$ 288.900 = R$ 8.667 (antes lançado R$ 5.778 com regra 2% default).',
    updated_at  = NOW()
WHERE description = 'Comissão Fábio Omena (Bula Assessoria) – 2% – Lts 31, 74·75, 96 – 6º Mega EAO'
  AND transaction_date = '2026-05-02';

-- ── ERP: Douglas Bispo (R$ 5.520 já está correto — sem ação)

-- ── ERP: Bulinha — NOVA conta a pagar
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense', 960,
  'Comissão Bulinha (Felipe Andrade) – 6º Mega EAO Fêmeas',
  '[F.xlsx 15/05/2026] Leilão 02/05/2026 – 6º Mega EAO Fêmeas. Comissão de Bulinha conforme planilha F.xlsx do chefe = R$ 960 (≈2% × R$ 48.000). ⚠ Lt 64 (R$ 48.000) está atribuído no jsonb por_assessor a Marcelo Carneiro; a xlsx do chefe coloca esse valor na coluna Bulinha. Revisar atribuição real do assessor com o chefe.',
  '2026-05-02', 'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Bulinha (Felipe Andrade) – 6º Mega EAO Fêmeas'
    AND transaction_date = '2026-05-02'
);

-- ── ERP: Receita Bula (xlsx: R$ 58.351,26 — antes R$ 6.129 ou R$ 176.822)
UPDATE public.erp_finance_transactions
SET amount      = 58351.26,
    description = 'Receita Bula – EAO Agropecuária – 0,33% – 6º Mega EAO Fêmeas 02/05/2026',
    observacao  = '[F.xlsx 15/05/2026] A receber da EAO Agropecuária. Acordo confirmado xlsx: 0,33% sobre faturamento total oficial R$ 17.682.200 = R$ 58.351,26. Antes lançado com regra 1% (R$ 176.822 ou R$ 6.129 dependendo do estado).',
    updated_at  = NOW()
WHERE description IN (
        'Receita Bula – EAO Agropecuária – 1% – 6º Mega EAO 02/05/2026',
        'Receita Bula – EAO Agropecuária – 0,33% – 6º Mega EAO Fêmeas 02/05/2026'
      )
  AND transaction_date = '2026-05-02';


-- ============================================================
-- 2) 6º MEGA EAO – TOUROS – 03/05/2026
-- ============================================================
UPDATE public.bula_leilao_fechamento
SET receita_bula        = 23342.55,
    comissao_assessoria = 13185,          -- 1.125 + 12.060
    sobra_bruta         = 10157.55,
    observacoes          = observacoes || ' [F.xlsx 15/05/2026] Acordo confirmado: 0,33% sobre faturamento total oficial R$ 7.073.500 = R$ 23.342,55 receita Bula. Comissões a pagar conforme xlsx: Fábio 3% × R$ 37.500 = R$ 1.125; Bulinha 2% × R$ 603.000 = R$ 12.060 (não é mais intercompany — gera conta a pagar). Total comissões R$ 13.185. Sobra bruta R$ 10.157,55.',
    updated_at          = NOW()
WHERE nome = '6º Mega EAO – Touros – Expozebu 03/05/2026'
  AND data = '2026-05-03';

-- ── ERP: Fábio Omena (xlsx: R$ 1.125 — antes R$ 750)
UPDATE public.erp_finance_transactions
SET amount      = 1125,
    observacao  = '[F.xlsx 15/05/2026] Leilão 03/05/2026 – 6º Mega EAO Touros. Lt 119 (Victor Meirelles, Tambaú/SP) R$ 37.500. Comissão conforme xlsx: 3% × R$ 37.500 = R$ 1.125 (antes lançado R$ 750 com regra 2%).',
    updated_at  = NOW()
WHERE description = 'Comissão Fábio Omena (Bula Assessoria) – 2% – Lt 119 – 6º Mega EAO Touros'
  AND transaction_date = '2026-05-03';

-- ── ERP: Bulinha — NOVA conta a pagar (antes era intercompany)
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense', 12060,
  'Comissão Bulinha (Felipe Andrade) – 2% – 15 lances 6º Mega EAO Touros',
  '[F.xlsx 15/05/2026] Leilão 03/05/2026 – 6º Mega EAO Touros (Expozebu). Bulinha intermediou 15 transações / 18 animais / R$ 603.000 (Lts 02, 35, 36, 46, 54, 56, 62, 76, 86, 99, 105, 111, 115, 121, Mega 03). 2% × R$ 603.000 = R$ 12.060. Conforme xlsx do chefe — antes tratada como intercompany (sem conta a pagar).',
  '2026-05-03', 'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Bulinha (Felipe Andrade) – 2% – 15 lances 6º Mega EAO Touros'
    AND transaction_date = '2026-05-03'
);

-- ── ERP: Receita Bula (xlsx: R$ 23.342,55 — antes R$ 6.405 ou R$ 70.735)
UPDATE public.erp_finance_transactions
SET amount      = 23342.55,
    description = 'Receita Bula – EAO Agropecuária – 0,33% – 6º Mega EAO Touros 03/05/2026',
    observacao  = '[F.xlsx 15/05/2026] A receber da EAO Agropecuária. Acordo confirmado xlsx: 0,33% sobre faturamento total oficial R$ 7.073.500 = R$ 23.342,55.',
    updated_at  = NOW()
WHERE description IN (
        'Receita Bula – EAO Agropecuária – 1% – 6º Mega EAO 03/05/2026',
        'Receita Bula – EAO Agropecuária – 0,33% – 6º Mega EAO Touros 03/05/2026'
      )
  AND transaction_date = '2026-05-03';


-- ============================================================
-- 3) 2º LEILÃO PINTADO RAIZ – 05/05/2026
-- ============================================================
-- xlsx: Receita Bula R$ 4.588 (1% × R$ 458.800) + Fábio R$ 3.996 + Mateus R$ 552
-- Antes no DB: receita_bula=0; comissão Marcelo R$ 2.664 (2% × 133.200).
UPDATE public.bula_leilao_fechamento
SET receita_bula        = 4588,
    comissao_assessoria = 4548,           -- Fábio 3.996 + Mateus 552
    sobra_bruta         = 40,             -- 4.588 − 4.548
    observacoes          = observacoes || ' [F.xlsx 15/05/2026] Acordo: 1% sobre faturamento total R$ 458.800 = R$ 4.588 receita Bula. Comissões conforme xlsx: Fábio 3% × R$ 133.200 = R$ 3.996; Mateus 2% × R$ 27.600 = R$ 552. Total R$ 4.548. Sobra bruta R$ 40. ⚠ DIVERGÊNCIA: o jsonb por_assessor atribui os 9 lances de R$ 133.200 a Marcelo Carneiro (Fórmula do Boi), mas a xlsx paga R$ 3.996 a Fábio Omena. Pode ser (a) seed atribuiu assessor errado; (b) chefe consolidou pagamento em Fábio. Revisar com o chefe. A comissão de R$ 2.664 antes lançada para Marcelo Carneiro (2% × R$ 133.200) deve ser CANCELADA — conforme xlsx ele não recebe comissão neste leilão.',
    updated_at          = NOW()
WHERE nome = '2º Leilão Pintado Raiz – 05/05/2026'
  AND data = '2026-05-05';

-- ── ERP: cancelar comissão antiga do Marcelo (não consta na xlsx)
UPDATE public.erp_finance_transactions
SET status      = 'cancelled',
    observacao  = '[F.xlsx 15/05/2026 — CANCELADA] Comissão antes lançada R$ 2.664 (2% × R$ 133.200) para Marcelo Carneiro. A xlsx do chefe (15/05/2026) NÃO inclui Marcelo no Pintado Raiz; paga R$ 3.996 a Fábio e R$ 552 a Mateus. Transação marcada como cancelada — revisar atribuição real do assessor (jsonb diz Marcelo, xlsx diz Fábio).',
    updated_at  = NOW()
WHERE description = 'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – 9 lotes Leilão Pintado Raiz (Garoa)'
  AND transaction_date = '2026-05-05';

-- ── ERP: Fábio Omena — NOVA conta a pagar (R$ 3.996)
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense', 3996,
  'Comissão Fábio Omena (Bula Assessoria) – 3% – 2º Leilão Pintado Raiz',
  '[F.xlsx 15/05/2026] Leilão 05/05/2026 – 2º Leilão Pintado Raiz (Fazenda Garoa, Maceió/AL). Comissão conforme planilha F.xlsx: R$ 3.996 (3% × R$ 133.200). ⚠ DIVERGÊNCIA: jsonb por_assessor atribui os 9 lances a Marcelo Carneiro, mas xlsx coloca pagamento na coluna Fábio. Confirmar com o chefe.',
  '2026-05-05', 'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Fábio Omena (Bula Assessoria) – 3% – 2º Leilão Pintado Raiz'
    AND transaction_date = '2026-05-05'
);

-- ── ERP: Mateus Alves — NOVA conta a pagar (R$ 552)
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense', 552,
  'Comissão Mateus Alves (Bula) – 2% – Lts 28·03·08 Leilão Pintado Raiz',
  '[F.xlsx 15/05/2026] Leilão 05/05/2026 – 2º Leilão Pintado Raiz. Mateus Alves intermediou Lts 28·03·08 (3 fêmeas) → Lucio Antônio Machado. R$ 27.600 × 2% = R$ 552. Conforme xlsx.',
  '2026-05-05', 'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Mateus Alves (Bula) – 2% – Lts 28·03·08 Leilão Pintado Raiz'
    AND transaction_date = '2026-05-05'
);

-- ── ERP: Receita Bula Pintado Raiz — NOVA (não existia)
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Recebimentos' AND type = 'income' LIMIT 1),
  'income', 4588,
  'Receita Bula – 2º Leilão Pintado Raiz – 1% – 05/05/2026',
  '[F.xlsx 15/05/2026] A receber da promotora (Agreste Leilões / Fazenda Garoa). Acordo: 1% sobre faturamento total R$ 458.800 = R$ 4.588.',
  '2026-05-05', 'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Receita Bula – 2º Leilão Pintado Raiz – 1% – 05/05/2026'
    AND transaction_date = '2026-05-05'
);


-- ============================================================
-- 4) LEILÃO MATINHA EMBRIO – 05/05/2026
-- ============================================================
-- xlsx: Receita Bula R$ 2.400 (5% × R$ 48.000 da venda) + Marcelo R$ 2.400 → lucro 0
-- Antes no DB: receita_bula=0; Marcelo R$ 960 (2%).
UPDATE public.bula_leilao_fechamento
SET receita_bula        = 2400,
    comissao_assessoria = 2400,
    sobra_bruta         = 0,
    observacoes          = observacoes || ' [F.xlsx 15/05/2026] Acordo: 5% sobre venda total Bula R$ 48.000 = R$ 2.400 receita Bula. Comissão Marcelo conforme xlsx: R$ 2.400 (= 100% da receita Bula → lucro 0; acordo específico deste leilão). Antes lançado Marcelo R$ 960 (2%) — atualizar para R$ 2.400.',
    updated_at          = NOW()
WHERE nome = 'Leilão Matinha Embrio – 05/05/2026'
  AND data = '2026-05-05';

-- ── ERP: Marcelo Matinha (xlsx: R$ 2.400 — antes R$ 960)
UPDATE public.erp_finance_transactions
SET amount      = 2400,
    description = 'Comissão Marcelo Carneiro (Fórmula do Boi) – Lt 04 Leilão Matinha Embrio',
    observacao  = '[F.xlsx 15/05/2026] Leilão 05/05/2026 – Matinha Embrio. Lt 04 (Orismar Moreira Leão / Fazenda Nelore Leão, João Pinheiro/MG, R$ 48.000). Comissão conforme xlsx do chefe = R$ 2.400 (acordo específico deste leilão; antes lançado R$ 960 com regra 2% genérica).',
    updated_at  = NOW()
WHERE description IN (
        'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – Lt 04 Leilão Matinha Embrio',
        'Comissão Marcelo Carneiro (Fórmula do Boi) – Lt 04 Leilão Matinha Embrio'
      )
  AND transaction_date = '2026-05-05';

-- ── ERP: Receita Bula Matinha Embrio — NOVA
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Recebimentos' AND type = 'income' LIMIT 1),
  'income', 2400,
  'Receita Bula – Leilão Matinha Embrio – 5% venda – 05/05/2026',
  '[F.xlsx 15/05/2026] A receber da promotora. Acordo: 5% sobre venda total Bula R$ 48.000 = R$ 2.400. Comissão Marcelo R$ 2.400 zera o lucro bruto deste leilão (acordo específico do chefe).',
  '2026-05-05', 'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Receita Bula – Leilão Matinha Embrio – 5% venda – 05/05/2026'
    AND transaction_date = '2026-05-05'
);


-- ============================================================
-- 5) 32º LEILÃO 4R – 09/05/2026
-- ============================================================
-- xlsx: Receita Bula R$ 41.235 (1% × R$ 4.123.500) + Fábio R$ 2.205 + Marcelo R$ 1.830
-- Antes no DB: receita_bula=0; comissao_assessoria=1.830 (só Marcelo, consolidado com Pedro).
UPDATE public.bula_leilao_fechamento
SET receita_bula        = 41235,
    comissao_assessoria = 4035,           -- 1.830 Marcelo (já lançado) + 2.205 Fábio (novo)
    sobra_bruta         = 37200,          -- 41.235 − 4.035
    observacoes          = observacoes || ' [F.xlsx 15/05/2026] Acordo: 1% sobre faturamento total R$ 4.123.500 = R$ 41.235 receita Bula. Comissões conforme xlsx: Fábio 3% × R$ 73.500 (Lt 94 + Lt 40) = R$ 2.205 (NOVA — antes Bula tinha rotina própria fora da regra dos 2%); Marcelo 2% × R$ 91.500 = R$ 1.830 (já lançado, mantém — inclui Pedro Barnabé centralizado). Total comissões R$ 4.035. Sobra bruta R$ 37.200.',
    updated_at          = NOW()
WHERE nome = '32° Leilão 4R – 09/05/2026'
  AND data = '2026-05-09';

-- ── ERP: Fábio Omena — NOVA conta a pagar (R$ 2.205)
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense', 2205,
  'Comissão Fábio Omena (Bula Assessoria) – 3% – 32° Leilão 4R',
  '[F.xlsx 15/05/2026] Leilão 09/05/2026 – 32° Leilão 4R (Dourados/MS). Fábio Omena intermediou 2 lances / 2 machos: Lt 94 (Cabanha MRA, R$ 49.500, Givaldo Ferreira Neves, Guajeru/BA, co-assessoria Leandro Moura LM ASSESSORIA) + Lt 40 (Cabanha KITO, R$ 24.000, Ailton Gabriel de Sousa, São Gonçalo do Sapucaí/MG). VGV total Fábio: R$ 73.500. Comissão conforme xlsx: 3% × R$ 73.500 = R$ 2.205. Antes Bula tinha rotina própria (fora da regra dos 2%); xlsx do chefe confirma pagamento direto.',
  '2026-05-09', 'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Fábio Omena (Bula Assessoria) – 3% – 32° Leilão 4R'
    AND transaction_date = '2026-05-09'
);

-- ── ERP: Receita Bula 4R — NOVA (não existia)
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Recebimentos' AND type = 'income' LIMIT 1),
  'income', 41235,
  'Receita Bula – 32° Leilão 4R – 1% – 09/05/2026',
  '[F.xlsx 15/05/2026] A receber da promotora (Programa Leilões + Leiloboi). Acordo: 1% sobre faturamento total oficial R$ 4.123.500 = R$ 41.235. Antes não tinha sido lançada (memória dizia que a taxa estava pendente).',
  '2026-05-09', 'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Receita Bula – 32° Leilão 4R – 1% – 09/05/2026'
    AND transaction_date = '2026-05-09'
);
