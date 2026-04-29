-- ============================================================
-- Fechamentos — leilões dos dias 27 e 28 de abril de 2026
-- Conforme dados informados no grupo (somente venda;
-- comissionamento intencionalmente fora do escopo).
-- VGV calculado como parcela × 30 × animais (parcelamento padrão).
-- ============================================================

-- ── 27/04/2026 ────────────────────────────────────────────────
-- Lote 26 vendido pela parceria Bula (Fábio Omena).
-- Fazenda C+4 / "Fábrica de Bezerros de Qualidade" — sócios Randolfo e César.
-- Direcionamento técnico: Gustavo Rusa.
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
  'Leilão Bula Assessoria – 27/04/2026',
  '2026-04-27',
  '',
  1, 1, 1,
  81000, 81000, 2700,
  1, 0,
  '[
    {"posicao":1,"nome":"Fábio Omena","empresa":"Bula Remates","transacoes":1,"animais":1,"vgv":81000,"ticket_medio":81000,"pct_total":1}
  ]'::jsonb,
  '[]'::jsonb,
  '[
    {"rank":1,"fazenda":"Fazenda C+4","comprador":"Fábrica de Bezerros de Qualidade (Randolfo e César)","cidade":"","uf":"","lotes":1,"animais":1,"vgv":81000}
  ]'::jsonb,
  '[
    {"lote":"26","fazenda":"Fazenda C+4","comprador":"Fábrica de Bezerros de Qualidade (Randolfo e César)","uf":"","assessor":"Fábio Omena","empresa":"Bula Remates","animais":1,"parcela":2700,"vgv":81000}
  ]'::jsonb,
  NULL,
  0, 0, 0,
  'Leilão fraco — apenas 1 lote concretizado. Direcionamento técnico do comprador: Gustavo Rusa.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-04-27' AND nome = 'Leilão Bula Assessoria – 27/04/2026'
);

-- ── 28/04/2026 ────────────────────────────────────────────────
-- Leilão Matinha Expozebu — Eficiência (cronograma: 30 fêmeas, Programa Leilões).
-- Lote 08 vendido pela Fórmula do Boi (Marcelo) com a Bula Assessoria.
-- Comprador: Nuco e Ivan / Fazenda Lisboa.
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
  'Leilão Matinha Expozebu – Eficiência',
  '2026-04-28',
  'Expozebu – Uberaba, MG',
  30, 1, 1,
  84000, 84000, 2800,
  1, 0,
  '[
    {"posicao":1,"nome":"Marcelo","empresa":"Fórmula do Boi","transacoes":1,"animais":1,"vgv":84000,"ticket_medio":84000,"pct_total":1}
  ]'::jsonb,
  '[]'::jsonb,
  '[
    {"rank":1,"fazenda":"Fazenda Lisboa","comprador":"Nuco e Ivan","cidade":"","uf":"","lotes":1,"animais":1,"vgv":84000}
  ]'::jsonb,
  '[
    {"lote":"08","fazenda":"Fazenda Lisboa","comprador":"Nuco e Ivan","uf":"","assessor":"Marcelo","empresa":"Fórmula do Boi","animais":1,"parcela":2800,"vgv":84000}
  ]'::jsonb,
  NULL,
  0, 0, 0,
  'Leilão durante a Expozebu. Venda concretizada pela parceria Fórmula do Boi | Bula Assessoria.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-04-28' AND nome = 'Leilão Matinha Expozebu – Eficiência'
);
