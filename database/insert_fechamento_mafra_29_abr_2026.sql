-- ============================================================
-- Fechamento — Leilão MAFRA — 29/04/2026
-- Não estava previamente agendado, mas houve venda.
-- Lt 20 — Aspiração da REM 2484N — parcela R$ 9.500 (30x) → VGV R$ 285.000
-- Lt 19 — 100% 3355                — parcela R$ 6.500 (30x) → VGV R$ 195.000
-- Comprador: Agropecuária Vale do Ouro – Parazão (Itaituba | PA)
-- Assessor: Douglas Bispo (Bula Assessoria) — taxa 2%
-- VGV total = R$ 480.000 | Comissão = 2% × 480.000 = R$ 9.600
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
  'Leilão MAFRA – 29/04/2026',
  '2026-04-29',
  '',
  2, 2, 2,
  480000, 240000, 9500,
  1, 1,
  '[
    {"posicao":1,"nome":"Douglas Bispo","empresa":"Bula Assessoria","transacoes":2,"animais":2,"vgv":480000,"ticket_medio":240000,"pct_total":1}
  ]'::jsonb,
  '[
    {"uf":"PA","estado":"Pará","lotes":2,"animais":2,"vgv":480000,"pct_total":1}
  ]'::jsonb,
  '[
    {"rank":1,"fazenda":"Agropecuária Vale do Ouro","comprador":"Parazão","cidade":"Itaituba","uf":"PA","lotes":2,"animais":2,"vgv":480000}
  ]'::jsonb,
  '[
    {"lote":"20","fazenda":"Agropecuária Vale do Ouro","comprador":"Parazão","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Assessoria","animais":1,"parcela":9500,"vgv":285000},
    {"lote":"19","fazenda":"Agropecuária Vale do Ouro","comprador":"Parazão","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Assessoria","animais":1,"parcela":6500,"vgv":195000}
  ]'::jsonb,
  NULL,
  9600, 0, -9600,
  'Leilão não previsto na agenda — venda registrada via WhatsApp pelo assessor. Lt 20 = aspiração da REM 2484N; Lt 19 = 100% do animal 3355. Comprador estreante: Agropecuária Vale do Ouro (Parazão), Itaituba/PA. Único assessor: Douglas Bispo (Bula Assessoria, taxa 2%). Conta a pagar gerada: R$ 9.600. Receita Bula a definir conforme acordo com a promotora MAFRA.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-04-29'
    AND nome = 'Leilão MAFRA – 29/04/2026'
);

-- ── CONTA A PAGAR — COMISSÃO DOUGLAS BISPO ───────────────────
-- Único assessor que vendeu neste leilão → taxa 2% sobre VGV
-- Categoria: Fornecedores | Status: pending

INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  9600,
  'Comissão Douglas Bispo (Bula Assessoria) – 2% – Lts 19 e 20 Leilão MAFRA',
  'Leilão 29/04/2026 – MAFRA. VGV R$ 480.000 × 2% = R$ 9.600. Único assessor vendedor. Comprador: Agropecuária Vale do Ouro (Parazão) – Itaituba/PA.',
  '2026-04-29',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Douglas Bispo (Bula Assessoria) – 2% – Lts 19 e 20 Leilão MAFRA'
    AND transaction_date = '2026-04-29'
);
