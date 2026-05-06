-- ============================================================
-- Fechamento — 5° Expozebu Camparino & Amigos — 30/04/2026
--
-- Origem do registro: WhatsApp (Marcelo Carneiro reportou em
-- 06/05 que esse lance "não tinha mandado" antes — não havia
-- entrado nos fechamentos anteriores).
--
-- Dados do catálogo (PDF "ORDEM DE ENTRADA"):
--   • Local: Uberaba/MG
--   • Data: 30/04/2026
--   • Lotes ofertados: 30 (ordem de entrada 1º ao 30º)
--   • Pagamento: lance × 30 parcelas
--       (2 à vista + 2 com 30d + 2 com 60d + 2 com 90d + 2 com 120d
--        + 20 parcelas mensais).
--       À vista: -10%   |   1+11x: -5%
--   • Comissão de compra: 8% sobre a batida do martelo
--
-- Lance reportado pela equipe (único informado):
--   Leonardo Serafim — Bula Assessoria
--     • Lt 12 — NATALIA FIV CAMPARINO (Bezerra, 8m, 346kg)
--       Vendedor: Fazenda Camparino
--       Comprador: Rogério Zanetti — Nelore AZ — Matupá/MT
--       Parcela: R$ 2.600   →   VGV R$ 78.000 (× 30)
--
-- Comissão / receita:
--   • Leonardo Serafim é Bula Assessoria — não cai na regra dos 2%
--     dos FDB (Bulinha/Marcelo Carneiro/Matheus). A comissão dele
--     vem de outra rotina, então NÃO geramos conta a pagar aqui.
--   • Taxa de receita Bula para leilões Camparino não foi confirmada
--     → receita_bula = 0 (revisar quando a taxa for informada).
-- ============================================================

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
  '5° Expozebu Camparino & Amigos – 30/04/2026',
  '2026-04-30',
  'Uberaba/MG',
  30, 1, 1,
  78000, 78000, 2600,
  1, 1,
  '[
    {"posicao":1,"nome":"Leonardo Serafim","empresa":"Bula Assessoria","transacoes":1,"animais":1,"vgv":78000,"ticket_medio":78000,"pct_total":1}
  ]'::jsonb,
  '[
    {"uf":"MT","estado":"Mato Grosso","lotes":1,"animais":1,"vgv":78000,"pct_total":1}
  ]'::jsonb,
  '[
    {"rank":1,"fazenda":"Nelore AZ","comprador":"Rogério Zanetti","cidade":"Matupá","uf":"MT","lotes":1,"animais":1,"vgv":78000}
  ]'::jsonb,
  '[
    {"lote":"12","produto":"NATALIA FIV CAMPARINO","categoria":"Bezerra","idade":"8m","peso_kg":346,"vendedor":"Fazenda Camparino","fazenda":"Nelore AZ","comprador":"Rogério Zanetti","cidade":"Matupá","uf":"MT","assessor":"Leonardo Serafim","empresa":"Bula Assessoria","animais":1,"parcela":2600,"vgv":78000}
  ]'::jsonb,
  NULL,
  0, 0, 0,
  'Lance reportado pelo Marcelo Carneiro em 06/05 ("não tinha mandado" antes) — único da equipe Bula/Fórmula nesse leilão. Lt 12 (NATALIA FIV CAMPARINO, bezerra 8m, 346kg, vendedor Fazenda Camparino) levado pelo Leonardo Serafim (Bula Assessoria). Comprador Rogério Zanetti — Nelore AZ — Matupá/MT. Parcela R$ 2.600 × 30x = VGV R$ 78.000 (pagamento padrão do leilão: 2 à vista + 2 c/ 30d + 2 c/ 60d + 2 c/ 90d + 2 c/ 120d + 20 mensais; à vista -10%, 1+11x -5%). Catálogo total: 30 lotes (ordem de entrada 1º ao 30º). Comissão Leonardo NÃO foi gerada aqui — Bula Assessoria tem rotina própria, fora da regra 2% dos FDB. Receita Bula = 0: taxa do Camparino não foi confirmada — revisar quando informada.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-04-30'
    AND nome = '5° Expozebu Camparino & Amigos – 30/04/2026'
);
