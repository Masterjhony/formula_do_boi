-- ============================================================
-- Fechamento — 2º Leilão Pintado Raiz (05/05/2026, Maceió/AL)
-- Leiloeira: Agreste Leilões  •  Promoção: Programa Leilões Nordeste
-- Origem dos dados: PDF "OE - 2 Leilão Pintado Raiz" (Ordem de
-- Entrada oficial). 40 lotes ofertados, 1 animal por lote (sem
-- crias ao pé na coluna OBSERVAÇÃO) → 40 animais ofertados.
--
-- Pré-leilão: lotes_vendidos / animais_vendidos / VGV ficam em 0 e
-- serão atualizados após a batida do martelo.
-- Idempotente — pode rodar repetidamente.
-- ============================================================

INSERT INTO public.bula_leilao_fechamento (
  nome, data, local,
  lotes_ofertados, lotes_vendidos, animais_vendidos,
  vgv_total, ticket_medio, maior_lance,
  compradores_unicos, estados_alcancados,
  por_assessor, por_estado, compradores, lances, perfil_genetico,
  comissao_assessoria, receita_bula, sobra_bruta,
  observacoes
)
SELECT
  '2º Leilão Pintado Raiz – 05/05/2026',
  '2026-05-05',
  'Maceió – AL',
  40, 0, 0,
  0, 0, 0,
  0, 0,
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL,
  0, 0, 0,
  'Leilão virtual da Fazenda Garoa pela Agreste Leilões. 40 lotes ofertados (Nelore Pintado, mistos: 26 fêmeas + 14 machos). Pagamento em 40x (1+39) ou à vista com 15% de desconto; comissão de compra 8%. Frete grátis em BA/SE/AL/PE/PB/RN/CE/PI/MA/TO.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-05-05'
    AND nome = '2º Leilão Pintado Raiz – 05/05/2026'
);

-- Caso o registro já exista (criado pelo admin), apenas garante
-- que lotes_ofertados/animais ofertados refletem o catálogo oficial.
UPDATE public.bula_leilao_fechamento
SET lotes_ofertados = 40,
    updated_at      = NOW()
WHERE nome = '2º Leilão Pintado Raiz – 05/05/2026'
  AND data = '2026-05-05'
  AND lotes_ofertados <> 40;
