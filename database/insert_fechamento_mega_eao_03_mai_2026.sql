-- ============================================================
-- Fechamento — 6º Mega EAO (Touros) — 03/05/2026
-- Local: Fazenda Reunidas Uberaba — MG 427 km 12 — 91º ExpoZebu
-- Promotor/Vendedor: EAO Agropecuária
-- VGV calculado pela tabela do catálogo (pág. 2):
--   • Touro Individual: parcela × 30  (2+2+2+2+2+20)
--   • Touro de Central / Mega Lote / Mangalarga: parcela × 40  (1+39)
-- Defaults aplicados (a revisar pelo chefe):
--   • Comissão assessores Bula Assessoria: 2% (mesma taxa MAFRA / EAO Fêmeas)
--   • Receita Bula sobre VGV total: 1% (default IPB/Pérolas/EAO Fêmeas)
--   • Bulinha (Felipe Andrade) = sócio Fórmula do Boi → intercompany, sem conta a pagar
-- Lotes mapeados via prints WhatsApp (Marcelo Primo Carneiro) cruzados com
-- Curadoria 6 Mega EAO Expozebu Touros.xlsx + Catálogo Digital Touros PDF.
-- PENDÊNCIA: Lote 115 (EAO C3472) — comprador não identificado nos prints.
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
  '6º Mega EAO – Touros – Expozebu 03/05/2026',
  '2026-05-03',
  'Fazenda Reunidas Uberaba – MG 427 km 12 – 91º ExpoZebu',
  180, 16, 19,
  640500, 40031.25, 2000,
  5, 2,

  -- por_assessor
  -- Bulinha (sócio Fórmula do Boi + fundador Bula Assessoria/Bula Remates) → intercompany
  -- Fábio Omena (Bula Assessoria) → comissão 2%
  '[
    {"posicao":1,"nome":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","transacoes":15,"animais":18,"vgv":603000,"ticket_medio":40200,"pct_total":0.9415},
    {"posicao":2,"nome":"Fábio Omena","empresa":"Bula Assessoria","transacoes":1,"animais":1,"vgv":37500,"ticket_medio":37500,"pct_total":0.0585}
  ]'::jsonb,

  -- por_estado (MS dominante; SP via intermediação Bula; 1 lote sem UF — Lt 115)
  '[
    {"uf":"MS","estado":"Mato Grosso do Sul","lotes":14,"animais":17,"vgv":565500,"pct_total":0.8829},
    {"uf":"SP","estado":"São Paulo","lotes":1,"animais":1,"vgv":37500,"pct_total":0.0586},
    {"uf":"—","estado":"Não informado","lotes":1,"animais":1,"vgv":37500,"pct_total":0.0586}
  ]'::jsonb,

  -- compradores (rank por VGV)
  '[
    {"rank":1,"fazenda":"Agropecuária Martins","comprador":"Agropecuária Martins","cidade":"Coxim","uf":"MS","lotes":6,"animais":6,"vgv":273500},
    {"rank":2,"fazenda":"Fazenda Londrina","comprador":"Paulinho e Marcelo Vilela","cidade":"","uf":"MS","lotes":5,"animais":5,"vgv":168000},
    {"rank":3,"fazenda":"MARCA 15","comprador":"Izanélio Rezende","cidade":"","uf":"MS","lotes":3,"animais":6,"vgv":124000},
    {"rank":4,"fazenda":"Victor Meirelles","comprador":"Victor Meirelles","cidade":"Tambaú","uf":"SP","lotes":1,"animais":1,"vgv":37500},
    {"rank":5,"fazenda":"⚠ A confirmar","comprador":"Comprador não identificado nos prints","cidade":"","uf":"","lotes":1,"animais":1,"vgv":37500}
  ]'::jsonb,

  -- lances (16 transações; Mega 03 = 4 animais em 1 lote)
  '[
    {"lote":"02","fazenda":"MARCA 15","comprador":"Izanélio Rezende","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":2000,"vgv":60000,"animal":"EAO C3404 (A++ – TOP 0,1% iABCZ/MGTe/IQG)"},
    {"lote":"35","fazenda":"Fazenda Londrina","comprador":"Paulinho e Marcelo Vilela","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":1150,"vgv":34500,"animal":"EAO C3679 (A)"},
    {"lote":"36","fazenda":"Fazenda Londrina","comprador":"Paulinho e Marcelo Vilela","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":1250,"vgv":37500,"animal":"EAO C3326 (A++)"},
    {"lote":"46","fazenda":"Agropecuária Martins","comprador":"Agropecuária Martins","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":1400,"vgv":42000,"animal":"EAO C3546 (A)"},
    {"lote":"54","fazenda":"Agropecuária Martins","comprador":"Agropecuária Martins","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":1200,"vgv":36000,"animal":"EAO C3634 (A)"},
    {"lote":"56","fazenda":"Agropecuária Martins","comprador":"Agropecuária Martins","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":1400,"vgv":42000,"animal":"EAO C3637 (A)"},
    {"lote":"62","fazenda":"Agropecuária Martins","comprador":"Agropecuária Martins","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":1550,"vgv":46500,"animal":"EAO C3549 (A++)"},
    {"lote":"76","fazenda":"Agropecuária Martins","comprador":"Agropecuária Martins","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":1400,"vgv":56000,"animal":"EAO C4489 — Touro de Central (1+39 = 40x)"},
    {"lote":"86","fazenda":"Fazenda Londrina","comprador":"Paulinho e Marcelo Vilela","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":900,"vgv":27000,"animal":"EAO C3615 (A)"},
    {"lote":"99","fazenda":"Agropecuária Martins","comprador":"Agropecuária Martins","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":1700,"vgv":51000,"animal":"EAO C3302 (A+)"},
    {"lote":"105","fazenda":"Fazenda Londrina","comprador":"Paulinho e Marcelo Vilela","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":1150,"vgv":34500,"animal":"EAO C3164 (A+)"},
    {"lote":"111","fazenda":"Fazenda Londrina","comprador":"Paulinho e Marcelo Vilela","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":1150,"vgv":34500,"animal":"EAON 6256 (A+)"},
    {"lote":"115","fazenda":"⚠ A confirmar","comprador":"Comprador não identificado","uf":"","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":1250,"vgv":37500,"animal":"EAO C3472 (A) — REVISAR comprador"},
    {"lote":"119","fazenda":"Victor Meirelles","comprador":"Victor Meirelles","uf":"SP","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":1250,"vgv":37500,"animal":"EAON 6319 (A+) — Tambaú/SP"},
    {"lote":"121","fazenda":"MARCA 15","comprador":"Izanélio Rezende","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":1,"parcela":1200,"vgv":36000,"animal":"EAO C1811 (A)"},
    {"lote":"Mega 03","fazenda":"MARCA 15","comprador":"Izanélio Rezende","uf":"MS","assessor":"Bulinha (Felipe Andrade)","empresa":"Fórmula do Boi","animais":4,"parcela":700,"vgv":28000,"animal":"Mega Lote 03 — 4 animais (filhos de Estoril Mat, REM Hermoso, D8 EAO) — 40x (1+39)"}
  ]'::jsonb,

  NULL,

  -- comissao_assessoria = 2% × VGV Bula (Fábio Omena Lt 119) = 2% × 37.500 = 750
  -- (Bulinha = intercompany Fórmula do Boi, sem conta a pagar)
  750,
  -- receita_bula = 1% × VGV total 640.500 = 6.405  (DEFAULT — REVISAR)
  6405,
  -- sobra_bruta = receita_bula − comissao_assessoria
  5655,

  'Vendas concretizadas durante o 6º Mega EAO Touros (91ª ExpoZebu, 03/05/2026 – domingo). Catálogo: 180 touros (Individuais + Repasse + Central + Mangalarga); curadoria FdB classificou 146 lotes (A++ 23 / A+ 41 / A 82). 16 lotes fechados (15 IND + 1 Mega Lote = 19 animais). Maior comprador: Agropecuária Martins (Coxim/MS) – 6 lotes, R$ 273,5k (incl. Lt 76 Touro de Central). MARCA 15 (Izanélio Rezende/MS) levou 6 animais em 3 lotes (R$ 124k) – encontro de visita marcado para 30/06. Lt 119 intermediado por Fábio Omena → Victor Meirelles (Tambaú/SP). PENDÊNCIAS: (1) Lote 115 (EAO C3472, R$ 37.500) – comprador não identificado nos prints – REVISAR com Bulinha. (2) Cobertura: confirmar se há lotes adicionais não reportados. Defaults aplicados (REVISAR): comissão Bula Assessoria 2%, Receita Bula EAO 1%. Bulinha (Felipe Andrade) tratado como intercompany Fórmula do Boi – sem conta a pagar.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-05-03'
    AND nome = '6º Mega EAO – Touros – Expozebu 03/05/2026'
);

-- ── CONTA A PAGAR — COMISSÃO FÁBIO OMENA (Bula Assessoria) ───
-- 2% sobre VGV vendido pelo Fábio = 2% × R$ 37.500 = R$ 750
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  750,
  'Comissão Fábio Omena (Bula Assessoria) – 2% – Lt 119 – 6º Mega EAO Touros',
  'Leilão 03/05/2026 – 6º Mega EAO Touros (Expozebu). VGV Fábio Omena: R$ 37.500 (Lt 119 – Victor Meirelles, Tambaú/SP) × 2% = R$ 750.',
  '2026-05-03',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Fábio Omena (Bula Assessoria) – 2% – Lt 119 – 6º Mega EAO Touros'
    AND transaction_date = '2026-05-03'
);

-- ── CONTA A RECEBER — RECEITA BULA × EAO AGROPECUÁRIA ────────
-- DEFAULT 1% sobre VGV total R$ 640.500 = R$ 6.405  (REVISAR % com chefe)
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Recebimentos' AND type = 'income' LIMIT 1),
  'income',
  6405,
  'Receita Bula – EAO Agropecuária – 1% – 6º Mega EAO Touros 03/05/2026',
  'A receber da EAO Agropecuária (promotora). VGV total R$ 640.500 × 1% (DEFAULT, REVISAR) = R$ 6.405. 16 lotes fechados, 19 animais, 5 compradores (4 confirmados + 1 a confirmar – Lt 115).',
  '2026-05-03',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Receita Bula – EAO Agropecuária – 1% – 6º Mega EAO Touros 03/05/2026'
    AND transaction_date = '2026-05-03'
);
