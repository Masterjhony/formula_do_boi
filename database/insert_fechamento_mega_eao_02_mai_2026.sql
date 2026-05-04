-- ============================================================
-- Fechamento — 6º Mega EAO (Fêmeas) — 02/05/2026
-- Local: Fazenda Reunidas Uberaba — MG 427 km 12 — 91º ExpoZebu
-- Promotor/Vendedor: EAO Agropecuária
-- VGV calculado como parcela × 30 × animais (parcelamento padrão).
-- Defaults aplicados (a revisar pelo chefe):
--   • Comissão assessores Bula: 2% (mesma taxa MAFRA)
--   • Receita Bula sobre VGV total: 1% (default IPB/Pérolas)
--   • Marcelo Carneiro / Fórmula do Boi = intercompany, sem conta a pagar
-- Lotes mapeados via Avaliacao 6 Mega EAO Ordem Entrada.xlsx (PROMOTOR EAO).
-- ============================================================

-- ── FECHAMENTO DE LEILÃO ──────────────────────────────────────

INSERT INTO public.bula_leilao_fechamento (
  nome, data, local,
  lotes_ofertados, lotes_vendidos, animais_vendidos,
  vgv_total, ticket_medio, maior_lance,
  compradores_unicos, estados_alcancados,
  por_assessor, por_estado, compradores, lances,
  perfil_genetico,
  comissao_assessoria, receita_bula, sobra_bruta,
  observacoes
)
SELECT
  '6º Mega EAO – Fêmeas – Expozebu 02/05/2026',
  '2026-05-02',
  'Fazenda Reunidas Uberaba – MG 427 km 12 – 91º ExpoZebu',
  109, 9, 15,
  612900, 68100, 4300,
  6, 3,

  -- por_assessor
  '[
    {"posicao":1,"nome":"Fábio Omena","empresa":"Bula Assessoria","transacoes":3,"animais":10,"vgv":288900,"ticket_medio":96300,"pct_total":0.4713},
    {"posicao":2,"nome":"Douglas Bispo","empresa":"Bula Assessoria","transacoes":4,"animais":4,"vgv":276000,"ticket_medio":69000,"pct_total":0.4503},
    {"posicao":3,"nome":"Marcelo Carneiro","empresa":"Fórmula do Boi","transacoes":1,"animais":1,"vgv":48000,"ticket_medio":48000,"pct_total":0.0783}
  ]'::jsonb,

  -- por_estado (3 UFs conhecidas; 2 lotes sem UF informada agrupados em "—")
  '[
    {"uf":"PA","estado":"Pará","lotes":5,"animais":11,"vgv":389400,"pct_total":0.6353},
    {"uf":"CE","estado":"Ceará","lotes":1,"animais":1,"vgv":58500,"pct_total":0.0954},
    {"uf":"MG","estado":"Minas Gerais","lotes":1,"animais":1,"vgv":48000,"pct_total":0.0783},
    {"uf":"—","estado":"Não informado","lotes":2,"animais":2,"vgv":117000,"pct_total":0.1909}
  ]'::jsonb,

  -- compradores (rank por VGV)
  '[
    {"rank":1,"fazenda":"Fazenda Flor de Minas","comprador":"Dr. Celso Lopes","cidade":"Ourilândia do Norte","uf":"PA","lotes":3,"animais":3,"vgv":219000},
    {"rank":2,"fazenda":"Fazenda Paraíso do Acará – Nelore FPA","comprador":"Fazenda Paraíso do Acará","cidade":"","uf":"PA","lotes":2,"animais":8,"vgv":170400},
    {"rank":3,"fazenda":"Nelore TresMar","comprador":"Sr. Luiz Carlos Freitas","cidade":"","uf":"","lotes":1,"animais":1,"vgv":60000},
    {"rank":4,"fazenda":"Fazenda Casa Amarela – NELORE BECA","comprador":"Sr. Adil Júnior","cidade":"Quixelô","uf":"CE","lotes":1,"animais":1,"vgv":58500},
    {"rank":5,"fazenda":"Nelore Itajaí","comprador":"Welton / Gustavo Miranda","cidade":"","uf":"","lotes":1,"animais":1,"vgv":57000},
    {"rank":6,"fazenda":"Nelore Leão","comprador":"Leão","cidade":"João Pinheiro","uf":"MG","lotes":1,"animais":1,"vgv":48000}
  ]'::jsonb,

  -- lances (lt 74 e 75 = mesma transação, mega lote)
  '[
    {"lote":"31","fazenda":"Nelore TresMar","comprador":"Sr. Luiz Carlos Freitas","uf":"","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":2000,"vgv":60000,"animal":"EAO C4566"},
    {"lote":"36","fazenda":"Fazenda Flor de Minas","comprador":"Dr. Celso Lopes","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Assessoria","animais":1,"parcela":1200,"vgv":36000,"animal":"EAO C4968"},
    {"lote":"49","fazenda":"Fazenda Flor de Minas","comprador":"Dr. Celso Lopes","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Assessoria","animais":1,"parcela":1800,"vgv":54000,"animal":"EAO C5318"},
    {"lote":"64","fazenda":"Nelore Leão","comprador":"Leão","uf":"MG","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":1600,"vgv":48000,"animal":"EAON 6735"},
    {"lote":"74·75","fazenda":"Fazenda Paraíso do Acará","comprador":"Nelore FPA","uf":"PA","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":8,"parcela":710,"vgv":170400,"animal":"EAO C5096 + Mega Lote (7 novilhas)"},
    {"lote":"83","fazenda":"Nelore Itajaí","comprador":"Welton / Gustavo Miranda","uf":"","assessor":"Douglas Bispo","empresa":"Bula Assessoria","animais":1,"parcela":1900,"vgv":57000,"animal":"EAO B1336 (parida)"},
    {"lote":"86","fazenda":"Fazenda Flor de Minas","comprador":"Dr. Celso Lopes","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Assessoria","animais":1,"parcela":4300,"vgv":129000,"animal":"EAON 5964"},
    {"lote":"96","fazenda":"Fazenda Casa Amarela – NELORE BECA","comprador":"Sr. Adil Júnior","uf":"CE","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":1950,"vgv":58500,"animal":"EAO C113"}
  ]'::jsonb,

  NULL,

  -- comissao_assessoria = 2% × VGV Bula (Fábio + Douglas) = 2% × 564.900 = 11.298
  -- (Marcelo / Fórmula do Boi não gera conta a pagar — intercompany)
  11298,
  -- receita_bula = 1% × VGV total 612.900 = 6.129  (DEFAULT — REVISAR)
  6129,
  -- sobra_bruta = receita_bula − comissao_assessoria
  -5169,

  'Vendas concretizadas durante o 6º Mega EAO Fêmeas (91º ExpoZebu). Curadoria FdB cobriu 109 lotes; 9 lotes (15 animais) fechados pela Bula Assessoria + Fórmula do Boi. Maior comprador: Dr. Celso Lopes (Faz. Flor de Minas/PA) com 3 lotes — R$ 219k. Lt 74·75 entrou como mega lote (1 + 7 novilhas). Lt 83 = fêmea parida. Mensagem do assessor "12F" para 74+75 não bate com o catálogo (8 animais reais — confirmar). Defaults aplicados (REVISAR): assessor Bula 2%, Receita Bula EAO 1%. Marcelo Carneiro (Fórmula do Boi) sem conta a pagar — intercompany.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-05-02'
    AND nome = '6º Mega EAO – Fêmeas – Expozebu 02/05/2026'
);

-- ── CONTA A PAGAR — COMISSÃO FÁBIO OMENA (Bula Assessoria) ───
-- 2% sobre VGV vendido pelo Fábio = 2% × R$ 288.900 = R$ 5.778
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  5778,
  'Comissão Fábio Omena (Bula Assessoria) – 2% – Lts 31, 74·75, 96 – 6º Mega EAO',
  'Leilão 02/05/2026 – 6º Mega EAO Fêmeas (Expozebu). VGV Fábio: R$ 288.900 (Lts 31, 74·75, 96) × 2% = R$ 5.778. Compradores: TresMar (Sr. Luiz), Paraíso do Acará (FPA), NELORE BECA (Quixelô/CE).',
  '2026-05-02',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Fábio Omena (Bula Assessoria) – 2% – Lts 31, 74·75, 96 – 6º Mega EAO'
    AND transaction_date = '2026-05-02'
);

-- ── CONTA A PAGAR — COMISSÃO DOUGLAS BISPO (Bula Assessoria) ─
-- 2% sobre VGV vendido pelo Douglas = 2% × R$ 276.000 = R$ 5.520
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  5520,
  'Comissão Douglas Bispo (Bula Assessoria) – 2% – Lts 36, 49, 83, 86 – 6º Mega EAO',
  'Leilão 02/05/2026 – 6º Mega EAO Fêmeas (Expozebu). VGV Douglas: R$ 276.000 (Lts 36, 49, 83, 86) × 2% = R$ 5.520. Comprador principal: Dr. Celso Lopes (Faz. Flor de Minas, Ourilândia/PA) – 3 lotes; + Welton/Gustavo Miranda (Nelore Itajaí) – Lt 83 parida.',
  '2026-05-02',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Douglas Bispo (Bula Assessoria) – 2% – Lts 36, 49, 83, 86 – 6º Mega EAO'
    AND transaction_date = '2026-05-02'
);

-- ── CONTA A RECEBER — RECEITA BULA × EAO AGROPECUÁRIA ────────
-- DEFAULT 1% sobre VGV total R$ 612.900 = R$ 6.129  (REVISAR % com chefe)
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Recebimentos' AND type = 'income' LIMIT 1),
  'income',
  6129,
  'Receita Bula – EAO Agropecuária – 1% – 6º Mega EAO 02/05/2026',
  'A receber da EAO Agropecuária (promotora). VGV total R$ 612.900 × 1% (DEFAULT, REVISAR) = R$ 6.129. 9 lotes fechados, 15 animais, 6 compradores únicos.',
  '2026-05-02',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Receita Bula – EAO Agropecuária – 1% – 6º Mega EAO 02/05/2026'
    AND transaction_date = '2026-05-02'
);
