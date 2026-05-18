-- ============================================================
-- Fechamento — Leilão Matrizes Matinha (17/05/2026)
--
-- Leilão de TERCEIRO em que Fórmula+Bula PARTICIPARAM cobrindo
-- compradores. Criador/vendedor: Rancho da Matinha. Leiloeira:
-- Programa Leilões. Modalidade: virtual (cronograma).
--
-- Cobertura reportada pelo Marcelo Primo Carneiro ("Bulinha") via
-- grupo WhatsApp — 3 lances, todos do mesmo assessor (Marcelo
-- Carneiro / Fórmula do Boi) para o mesmo comprador (Orismar
-- Moreira Leão — Fazenda Nelore Leão, João Pinheiro/MG):
--   • Lt 18 — 1F, parcela R$    800 × 30 = R$  24.000
--   • Lt 77 — 1F, parcela R$  3.050 × 30 = R$  91.500
--   • Lt 78 — 1F, parcela R$  2.050 × 30 = R$  61.500
-- Total cobertura: 3 lotes / 3 fêmeas / R$ 177.000
-- Pagamento: 30 parcelas (confirmado pelo Bulinha).
--
-- Acordo: 5% sobre venda da cobertura (Fórmula+Bula) — mesma
-- regra do Leilão Matinha Embrio 05/05/2026 (Rancho da Matinha
-- via Programa Leilões). Faturamento total da leiloeira não
-- reportado.
--   • Receita Bula  = 5% × R$ 177.000 = R$ 8.850
--   • Comissão Marcelo (2%) = 2% × R$ 177.000 = R$ 3.540
--   • Sobra bruta = R$ 8.850 − R$ 3.540 = R$ 5.310
-- ============================================================

INSERT INTO public.bula_leilao_fechamento (
  nome, data, local,
  lotes_ofertados, lotes_vendidos, animais_vendidos,
  vgv_total, ticket_medio, maior_lance,
  compradores_unicos, estados_alcancados,
  por_assessor, por_estado, compradores, lances,
  perfil_genetico,
  comissao_assessoria, receita_bula, sobra_bruta,
  acordo_pct_faturamento, acordo_pct_venda_cobertura, acordo_descricao,
  observacoes
)
SELECT
  'Leilão Matrizes Matinha – 17/05/2026',
  '2026-05-17',
  '',
  0,         -- lotes ofertados (catálogo total não reportado)
  3,         -- lotes vendidos (NOSSA COBERTURA)
  3,         -- animais vendidos (NOSSA COBERTURA — 3 fêmeas)
  177000,    -- VGV total NOSSA COBERTURA
  59000,     -- ticket médio (R$ 177.000 / 3 lotes)
  3050,      -- maior parcela mapeada (Lt 77, Marcelo Carneiro)
  1,         -- comprador único (Orismar Moreira Leão)
  1,         -- estados alcançados (MG)

  -- por_assessor (NOSSA COBERTURA)
  '[
    {"posicao":1,"nome":"Marcelo Carneiro","empresa":"Fórmula do Boi","transacoes":3,"animais":3,"vgv":177000,"ticket_medio":59000,"pct_total":1}
  ]'::jsonb,

  -- por_estado (NOSSA COBERTURA)
  '[
    {"uf":"MG","estado":"Minas Gerais","lotes":3,"animais":3,"vgv":177000,"pct_total":1}
  ]'::jsonb,

  -- compradores (NOSSA COBERTURA)
  '[
    {"rank":1,"fazenda":"Nelore Leão","comprador":"Orismar Moreira Leão","cidade":"João Pinheiro","uf":"MG","lotes":3,"animais":3,"vgv":177000}
  ]'::jsonb,

  -- lances (cada batida de martelo da NOSSA COBERTURA)
  '[
    {"lote":"18","fazenda":"Nelore Leão","comprador":"Orismar Moreira Leão","cidade":"João Pinheiro","uf":"MG","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":800,"vgv":24000},
    {"lote":"77","fazenda":"Nelore Leão","comprador":"Orismar Moreira Leão","cidade":"João Pinheiro","uf":"MG","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":3050,"vgv":91500},
    {"lote":"78","fazenda":"Nelore Leão","comprador":"Orismar Moreira Leão","cidade":"João Pinheiro","uf":"MG","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":2050,"vgv":61500}
  ]'::jsonb,

  NULL,      -- perfil_genetico
  3540,      -- comissao_assessoria = 2% × R$ 177.000 (regra Bulinha/Marcelo)
  8850,      -- receita_bula = 5% × R$ 177.000 (acordo Rancho da Matinha / Programa Leilões)
  5310,      -- sobra_bruta = 8.850 − 3.540

  NULL,      -- acordo_pct_faturamento (faturamento total não reportado)
  0.05,      -- acordo_pct_venda_cobertura
  '5% da venda da cobertura (Fórmula+Bula)',

  'Leilão de TERCEIRO — leiloeira Programa Leilões; criador/vendedor Rancho da Matinha; modalidade virtual. Pagamento: 30 parcelas (confirmado por Marcelo Primo Carneiro / Bulinha). NOSSA COBERTURA (Fórmula+Bula): 3 lotes / 3 fêmeas / R$ 177.000 / 1 comprador / 1 UF (MG). Único assessor com cobertura: Marcelo Carneiro (Fórmula do Boi) — Lt 18 (parcela R$ 800 × 30 = R$ 24.000) + Lt 77 (parcela R$ 3.050 × 30 = R$ 91.500) + Lt 78 (parcela R$ 2.050 × 30 = R$ 61.500) = R$ 177.000 (100%). Comprador único: Orismar Moreira Leão (Fazenda Nelore Leão, João Pinheiro/MG — mesmo cliente do Lt 04 Matinha Embrio 05/05/2026 e Lt 20 Matrizes Santa Fé 07/05/2026). Acordo Rancho da Matinha (mesma regra Matinha Embrio): 5% sobre venda da cobertura → 5% × R$ 177.000 = R$ 8.850. Comissão Marcelo (regra 2%): 2% × R$ 177.000 = R$ 3.540. Sobra bruta = R$ 5.310. [receita 5% Matinha — diretiva chefe 06/05/2026]. ⚠ PENDÊNCIAS: (a) faturamento total do leilão não reportado; (b) total de lotes ofertados no catálogo não reportado; (c) confirmar se demais assessores da equipe não venderam neste leilão (Bulinha reportou apenas estes 3 lances no grupo).'

WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-05-17'
    AND nome = 'Leilão Matrizes Matinha – 17/05/2026'
);


-- ── CONTA A PAGAR — COMISSÃO MARCELO CARNEIRO (2%) ──────────────
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  3540,
  'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – 3 lotes Leilão Matrizes Matinha',
  'Leilão 17/05/2026 – Matrizes Matinha (Rancho da Matinha via Programa Leilões, virtual). Marcelo Carneiro intermediou 3 lances / 3 fêmeas / R$ 177.000 para Orismar Moreira Leão (Fazenda Nelore Leão, João Pinheiro/MG): Lt 18 (parcela R$ 800 × 30 = R$ 24.000) + Lt 77 (parcela R$ 3.050 × 30 = R$ 91.500) + Lt 78 (parcela R$ 2.050 × 30 = R$ 61.500). 2% × R$ 177.000 = R$ 3.540 (regra Bulinha/Marcelo/Matheus).',
  '2026-05-17',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – 3 lotes Leilão Matrizes Matinha'
    AND transaction_date = '2026-05-17'
);


-- ── CONTA A RECEBER — RECEITA BULA × RANCHO DA MATINHA ──────────
-- Acordo: 5% sobre venda da cobertura (mesma regra Matinha Embrio 05/05).
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Recebimentos' AND type = 'income' LIMIT 1),
  'income',
  8850,
  'Receita Bula – Matrizes Matinha – 5% cobertura – Leilão 17/05/2026',
  'A receber da promotora (Programa Leilões / Rancho da Matinha). Acordo: 5% sobre VGV da cobertura Fórmula+Bula. Cálculo: 5% × R$ 177.000 = R$ 8.850. Comissão a pagar (Marcelo Carneiro): R$ 3.540. Sobra bruta = R$ 5.310.',
  '2026-05-17',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Receita Bula – Matrizes Matinha – 5% cobertura – Leilão 17/05/2026'
    AND transaction_date = '2026-05-17'
);
