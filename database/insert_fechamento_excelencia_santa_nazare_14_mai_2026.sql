-- ============================================================
-- Fechamento — Leilão Excelência Santa Nazaré 2026 (14/05/2026)
--
-- Leilão de TERCEIRO em que Fórmula+Bula PARTICIPARAM cobrindo
-- compradores. Local: parque de exposições José da Silva Nogueira,
-- Maceió/AL (Expo Alagoas Genética). Leiloeiras: Agreste Leilões
-- Rurais + Remateweb. Vendedor/criador: Agropecuária Santa Nazaré.
-- Pagamento: 40 parcelas (1+39); 12% desconto à vista; 10% desconto
-- em 20 parcelas.
--
-- Valores conforme a planilha F.xlsx do chefe (fonte autoritativa,
-- linha "LEILÃO SANTA NAZARÉ"):
--   FATURAMENTO total do leilão  : R$ 1.142.800  (oficial)
--   VENDA ASSESSORES (cobertura) : R$   216.000
--   ACORDO                       : 1% do faturamento total + 3% da venda
--   RECEITA BULA                 : 1% × 1.142.800 + 3% × 216.000
--                                 = 11.428 + 6.480 = R$ 17.908
--   COMISSÃO FÁBIO   (3% × 24.800) : R$   744
--   COMISSÃO MARCELO (~2% × 191.200): R$ 3.842  (valor da planilha)
--   LUCRO BRUTO (sobra)           : 17.908 − 744 − 3.842 = R$ 13.322
--
-- HEADER: lotes_ofertados é referência do catálogo; demais campos do
-- header refletem NOSSA COBERTURA (mesma soma dos jsonbs).
--
-- NOSSA COBERTURA (mensagens encaminhadas pelo Marcelo Primo Carneiro,
--                  23:11 do dia 14/05):
--   Marcelo Carneiro (Fórmula do Boi) — 2 lances / 7 touros / R$ 191.200
--     • Pacote Lt 35·36·42 (3 lotes DUPLO, 2T cada = 6T) – parcela R$ 680
--       por touro × 40 = R$ 163.200 – Admilson Ferreira (Fazenda Riachinho,
--       Serra da Gaúcha/MG).
--     • Lt 32 (Individual, 1T = E1309 Santa Nazaré) – parcela R$ 700 × 40
--       = R$ 28.000 – mesmo comprador.
--   Fábio Omena (Bula Assessoria) — 1 lance / 1 touro / R$ 24.800
--     • Lt 20 (Individual, 1T = 1264 Santa Nazaré) – parcela R$ 620 × 40
--       = R$ 24.800 – Bayron (Fazenda Três Maria, Mirador/MA).
--
-- Total cobertura: 5 lotes / 8 touros / R$ 216.000 / 2 compradores / 2 UFs
-- (MG: 4 lotes R$ 191.200 = 88,52%; MA: 1 lote R$ 24.800 = 11,48%).
-- ============================================================

-- Roda DEPOIS de add_faturamento_total_leilao_to_fechamento.sql (que cria a coluna).
INSERT INTO public.bula_leilao_fechamento (
  nome, data, local,
  lotes_ofertados, lotes_vendidos, animais_vendidos,
  vgv_total, faturamento_total_leilao, ticket_medio, maior_lance,
  compradores_unicos, estados_alcancados,
  por_assessor, por_estado, compradores, lances,
  perfil_genetico,
  comissao_assessoria, receita_bula, sobra_bruta,
  observacoes
)
SELECT
  'Leilão Excelência Santa Nazaré 2026 – 14/05/2026',
  '2026-05-14',
  'Maceió/AL',
  41,        -- lotes ofertados (catálogo: lotes 01–26 + 28–42; Lt 27 ausente)
  5,         -- lotes vendidos (NOSSA COBERTURA)
  8,         -- animais vendidos (NOSSA COBERTURA: 6 touros nos duplos + 2 individuais)
  216000,    -- VGV total NOSSA COBERTURA
  1142800,   -- FATURAMENTO TOTAL OFICIAL do leilão inteiro (F.xlsx)
  43200,     -- ticket médio (R$ 216.000 / 5 lotes)
  700,       -- maior parcela mapeada (Lt 32, Marcelo Carneiro)
  2,         -- compradores únicos (NOSSA COBERTURA)
  2,         -- estados alcançados (MG, MA — NOSSA COBERTURA)

  -- por_assessor (NOSSA COBERTURA, ordenado por VGV)
  '[
    {"posicao":1,"nome":"Marcelo Carneiro","empresa":"Fórmula do Boi","transacoes":2,"animais":7,"vgv":191200,"ticket_medio":95600,"pct_total":0.8852},
    {"posicao":2,"nome":"Fábio Omena","empresa":"Bula Assessoria","transacoes":1,"animais":1,"vgv":24800,"ticket_medio":24800,"pct_total":0.1148}
  ]'::jsonb,

  -- por_estado (NOSSA COBERTURA)
  '[
    {"uf":"MG","estado":"Minas Gerais","lotes":4,"animais":7,"vgv":191200,"pct_total":0.8852},
    {"uf":"MA","estado":"Maranhão","lotes":1,"animais":1,"vgv":24800,"pct_total":0.1148}
  ]'::jsonb,

  -- compradores (NOSSA COBERTURA, rank por VGV)
  '[
    {"rank":1,"fazenda":"Fazenda Riachinho","comprador":"Admilson Ferreira","cidade":"Serra da Gaúcha","uf":"MG","lotes":4,"animais":7,"vgv":191200},
    {"rank":2,"fazenda":"Fazenda Três Maria","comprador":"Bayron","cidade":"Mirador","uf":"MA","lotes":1,"animais":1,"vgv":24800}
  ]'::jsonb,

  -- lances (cada batida de martelo da NOSSA COBERTURA)
  '[
    {"lote":"35·36·42","vendedor":"Agropecuária Santa Nazaré","fazenda":"Fazenda Riachinho","comprador":"Admilson Ferreira","cidade":"Serra da Gaúcha","uf":"MG","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":6,"parcela":680,"vgv":163200,"observacao":"Pacote de 3 lotes DUPLO (2 touros cada = 6T); parcela R$ 680 por touro × 40 parcelas (1+39)"},
    {"lote":"32","vendedor":"Agropecuária Santa Nazaré","fazenda":"Fazenda Riachinho","comprador":"Admilson Ferreira","cidade":"Serra da Gaúcha","uf":"MG","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":700,"vgv":28000,"observacao":"Individual — E1309 Santa Nazaré (RG NLCM 1309), parcela R$ 700 × 40"},
    {"lote":"20","vendedor":"Agropecuária Santa Nazaré","fazenda":"Fazenda Três Maria","comprador":"Bayron","cidade":"Mirador","uf":"MA","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":620,"vgv":24800,"observacao":"Individual — 1264 Santa Nazaré (RG NLCM 1264), parcela R$ 620 × 40"}
  ]'::jsonb,

  NULL,      -- perfil_genetico (catálogo extenso de avaliação; índices não consolidados)
  4586,      -- comissao_assessoria total = 3842 (Marcelo) + 744 (Fábio)
  17908,     -- receita_bula = 1% × 1.142.800 + 3% × 216.000
  13322,     -- sobra_bruta = 17.908 − 4.586

  'Leilão de TERCEIRO — leiloeiras Agreste Leilões Rurais + Remateweb; criador/vendedor Agropecuária Santa Nazaré; durante Expo Alagoas Genética, Maceió/AL. Pagamento: 40 parcelas (1+39), 12% desconto à vista, 10% desconto em 20 parcelas. FATURAMENTO TOTAL OFICIAL DO LEILÃO (planilha F.xlsx do chefe): R$ 1.142.800 — campo próprio `faturamento_total_leilao` pendente de migration; por ora consta apenas nesta observação. NOSSA COBERTURA (Fórmula+Bula): 5 lotes / 8 touros / R$ 216.000 / 2 compradores / 2 UFs (≈18,90% do faturamento total do leilão). Por assessor: Marcelo Carneiro (Fórmula do Boi) — 2 lances para Admilson Ferreira (Fazenda Riachinho, Serra da Gaúcha/MG): pacote Lt 35·36·42 (3 duplos = 6T, parcela R$ 680/touro = R$ 163.200) + Lt 32 individual (E1309, R$ 700/touro = R$ 28.000) = R$ 191.200 (88,52%). Fábio Omena (Bula) — 1 lance: Lt 20 individual (1264 Santa Nazaré, R$ 620/touro = R$ 24.800) para Bayron (Fazenda Três Maria, Mirador/MA) = R$ 24.800 (11,48%). Catálogo virtual: 41 lotes ativos (numeração 01–26 + 28–42, Lt 27 ausente). RECEITA BULA (conforme F.xlsx, acordo 1% do faturamento total + 3% da venda): 1% × R$ 1.142.800 + 3% × R$ 216.000 = R$ 11.428 + R$ 6.480 = R$ 17.908. COMISSÕES (conforme F.xlsx): Marcelo R$ 3.842 + Fábio R$ 744 = R$ 4.586 total a pagar. SOBRA BRUTA = R$ 17.908 − R$ 4.586 = R$ 13.322. ⚠ PENDÊNCIAS: (a) sobrenome do comprador "Bayron" (Mirador/MA) não consta nos prints; (b) confirmar grafia oficial de "Serra da Gaúcha/MG" (provavelmente Serra Gaúcha ou município similar); (c) Agreste Leilões + Remateweb são novos no mapeamento RECEITA_BULA_PAGADOR de helpers.ts — adicionar entrada.'

WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-05-14'
    AND nome = 'Leilão Excelência Santa Nazaré 2026 – 14/05/2026'
);


-- ── CONTA A PAGAR — COMISSÃO MARCELO CARNEIRO (planilha F.xlsx) ─
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  3842,
  'Comissão Marcelo Carneiro (Fórmula do Boi) – 4 lotes Leilão Excelência Santa Nazaré',
  'Leilão 14/05/2026 – Excelência Santa Nazaré (Maceió/AL, Agreste + Remateweb). Cobertura Marcelo Carneiro: pacote Lt 35·36·42 (3 lotes DUPLO, 6T, parcela R$ 680/touro × 40 = R$ 163.200) + Lt 32 individual (E1309, parcela R$ 700 × 40 = R$ 28.000). Total cobertura Marcelo = R$ 191.200. Valor da comissão R$ 3.842 conforme planilha F.xlsx do chefe (≈2% × cobertura). Comprador único: Admilson Ferreira (Fazenda Riachinho, Serra da Gaúcha/MG).',
  '2026-05-14',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Marcelo Carneiro (Fórmula do Boi) – 4 lotes Leilão Excelência Santa Nazaré'
    AND transaction_date = '2026-05-14'
);


-- ── CONTA A PAGAR — COMISSÃO FÁBIO OMENA (planilha F.xlsx, 3%) ──
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  744,
  'Comissão Fábio Omena (Bula Assessoria) – 3% – Lt 20 Leilão Excelência Santa Nazaré',
  'Leilão 14/05/2026 – Excelência Santa Nazaré (Maceió/AL, Agreste + Remateweb). Fábio Omena intermediou 1 lance / 1 touro: Lt 20 (1264 Santa Nazaré, parcela R$ 620 × 40 = R$ 24.800) para Bayron (Fazenda Três Maria, Mirador/MA). 3% × R$ 24.800 = R$ 744 (valor conforme planilha F.xlsx do chefe).',
  '2026-05-14',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Fábio Omena (Bula Assessoria) – 3% – Lt 20 Leilão Excelência Santa Nazaré'
    AND transaction_date = '2026-05-14'
);


-- ── CONTA A RECEBER — RECEITA BULA × SANTA NAZARÉ ───────────────
-- Acordo F.xlsx: 1% × R$ 1.142.800 (total leilão) + 3% × R$ 216.000 (cobertura)
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Recebimentos' AND type = 'income' LIMIT 1),
  'income',
  17908,
  'Receita Bula – Excelência Santa Nazaré – 1% total + 3% cobertura – Leilão 14/05/2026',
  'A receber da promotora (Agreste Leilões Rurais / Agropecuária Santa Nazaré). Acordo (planilha F.xlsx): 1% sobre faturamento total do leilão (R$ 1.142.800) + 3% sobre VGV das vendas dos assessores (R$ 216.000). Cálculo: 1% × 1.142.800 = R$ 11.428; 3% × 216.000 = R$ 6.480; Total = R$ 17.908. Comissões a pagar: Marcelo Carneiro R$ 3.842 + Fábio Omena R$ 744 = R$ 4.586. Sobra bruta = R$ 13.322.',
  '2026-05-14',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Receita Bula – Excelência Santa Nazaré – 1% total + 3% cobertura – Leilão 14/05/2026'
    AND transaction_date = '2026-05-14'
);
