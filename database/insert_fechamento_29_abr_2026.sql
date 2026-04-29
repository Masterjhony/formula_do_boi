-- ============================================================
-- Fechamento — leilão do dia 29 de abril de 2026
-- Leilão Genética Aditiva e Terra Brava – Expozebu
-- Lt 28 — comprador Sr. Adil Júnior / NELORE BECA / Fazenda Casa Amarela (Quixelô | CE)
-- Assessor: Fábio Omena – Bula Assessoria (primeira vez na Expozebu)
-- VGV = 3.300 × 30 parcelas = R$ 99.000
-- Só o Fábio vendeu → comissão = 3% × R$ 99.000 = R$ 2.970
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
  'Leilão Genética Aditiva e Terra Brava – Expozebu 29/04/2026',
  '2026-04-29',
  'Expozebu – Uberaba, MG',
  1, 1, 1,
  99000, 99000, 3300,
  1, 1,
  '[
    {"posicao":1,"nome":"Fábio Omena","empresa":"Bula Assessoria","transacoes":1,"animais":1,"vgv":99000,"ticket_medio":99000,"pct_total":1}
  ]'::jsonb,
  '[
    {"uf":"CE","estado":"Ceará","lotes":1,"animais":1,"vgv":99000,"pct_total":1}
  ]'::jsonb,
  '[
    {"rank":1,"fazenda":"Fazenda Casa Amarela – NELORE BECA","comprador":"Sr. Adil Júnior","cidade":"Quixelô","uf":"CE","lotes":1,"animais":1,"vgv":99000}
  ]'::jsonb,
  '[
    {"lote":"28","fazenda":"Fazenda Casa Amarela – NELORE BECA","comprador":"Sr. Adil Júnior","uf":"CE","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":3300,"vgv":99000}
  ]'::jsonb,
  NULL,
  2970, 0, -2970,
  'Comprador estreante na Expozebu. Único vendedor: Fábio Omena (taxa 3%). Conta a pagar gerada: R$ 2.970.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-04-29'
    AND nome = 'Leilão Genética Aditiva e Terra Brava – Expozebu 29/04/2026'
);

-- ── CONTA A PAGAR — COMISSÃO FÁBIO OMENA ─────────────────────
-- Único assessor que vendeu neste leilão → taxa 3% sobre VGV
-- Categoria: Fornecedores | Status: pending

INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  2970,
  'Comissão Fábio Omena (Bula Assessoria) – 3% – Lt 28 Genética Aditiva e Terra Brava',
  'Leilão 29/04/2026 – Expozebu. VGV R$ 99.000 × 3% = R$ 2.970. Único assessor vendedor.',
  '2026-04-29',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Fábio Omena (Bula Assessoria) – 3% – Lt 28 Genética Aditiva e Terra Brava'
    AND transaction_date = '2026-04-29'
);
