-- ==============================================================================
-- SEED: Doadoras Nelore Visual — Safra 2026 (VIS) no catálogo `products`
-- ==============================================================================
-- Migra as 5 doadoras hardcoded em src/data/doadoras.ts para a tabela `products`
-- pra que apareçam no web-admin /lotes-doadoras junto com as demais.
--
-- Fonte: src/data/doadoras.ts (DOADORAS) + DOADORAS_CONDICOES.
-- Proprietário comum: Antonio Martins Araújo Neto · Fazenda Visual · Esmeraldas/MG.
-- Pacote: 12 embriões VIT, 4 prenhezes garantidas, 10× sem juros.
--
-- Idempotente: cada linha só é inserida se ainda não existir um product com o
-- mesmo `details->>'registro'` (RGD).
-- ==============================================================================

INSERT INTO public.products (
  name, category, classificacao, modalidade, logistica, forma_pagamento,
  location, image_url, gallery, price, installments, tag, details, active, display_order
)
SELECT v.*
FROM (VALUES
  -- VIS 4622 — MILA FIV VISUAL × REM CH LIDER
  (
    'MILA FIV VISUAL - Pacote 12 Embriões VIT',
    'Embrião VIT',
    'embriao',
    'venda_direta',
    'frete_compartilhado',
    'Entrada + 9x',
    'Esmeraldas - MG',
    'https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177233/vis4622_lg0dc2.mp4',
    ARRAY['https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177233/vis4622_lg0dc2.mp4'],
    1100::numeric,
    '10x sem juros',
    'SAFRA_VIS_2026',
    jsonb_build_object(
      'registro', 'VIS 4622',
      'raca', 'Nelore PO',
      'nascimento', '22/06/2024',
      'pai', 'REM CH LIDER',
      'mae', null,
      'iabcz', '26,78',
      'iqg', '33,29',
      'mgte', '31,83',
      'top', 'TOP 0,1%',
      'status', 'Disponível',
      'proprietario', 'Antonio Martins Araújo Neto',
      'breeder', 'Fazenda Visual',
      'comentario', 'Embrião VIT Safra 2026 Nelore Visual × FdB. Pacote 12 embriões, 4 prenhezes garantidas. iABCZ 26,78 (P 0,5%) · IQG 33,29 (TOP 1%) · MGTe 31,83 (TOP 0,5%).',
      'slug', 'vis-4622',
      'cruzamento', 'REM CH LIDER',
      'classificacao_top', 'TOP 0,1%',
      'id_abcz', '21034225',
      'pacote_total', 13200,
      'quantidade_embrioes', 12,
      'parcelamento', '10× sem juros (1 entrada + 9 parcelas)',
      'video', 'https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177233/vis4622_lg0dc2.mp4'
    ),
    true,
    1004
  ),

  -- VIS 4711 × REM NOCAUTE (nome ABCZ pendente)
  (
    'VIS 4711 - Pacote 12 Embriões VIT',
    'Embrião VIT',
    'embriao',
    'venda_direta',
    'frete_compartilhado',
    'Entrada + 9x',
    'Esmeraldas - MG',
    NULL::text,
    ARRAY[]::text[],
    1100::numeric,
    '10x sem juros',
    'SAFRA_VIS_2026',
    jsonb_build_object(
      'registro', 'VIS 4711',
      'raca', 'Nelore PO',
      'nascimento', null,
      'pai', 'REM NOCAUTE',
      'mae', null,
      'iabcz', '36,51',
      'iqg', '43,62',
      'mgte', '33,33',
      'top', 'TOP 0,1%',
      'status', 'Disponível',
      'proprietario', 'Antonio Martins Araújo Neto',
      'breeder', 'Fazenda Visual',
      'comentario', 'Embrião VIT Safra 2026 Nelore Visual × FdB. Pacote 12 embriões, 4 prenhezes garantidas. iABCZ 36,51 (P 0,1%) · IQG 43,62 (TOP 0,1%) · MGTe 33,33 (TOP 0,5%). Nome ABCZ e genealogia em validação.',
      'slug', 'vis-4711',
      'cruzamento', 'REM NOCAUTE',
      'classificacao_top', 'TOP 0,1%',
      'pacote_total', 13200,
      'quantidade_embrioes', 12,
      'parcelamento', '10× sem juros (1 entrada + 9 parcelas)'
    ),
    true,
    1003
  ),

  -- VIS 4817 × GANADEIRO EAO (nome ABCZ pendente)
  (
    'VIS 4817 - Pacote 12 Embriões VIT',
    'Embrião VIT',
    'embriao',
    'venda_direta',
    'frete_compartilhado',
    'Entrada + 9x',
    'Esmeraldas - MG',
    'https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177432/vis4817_abo2in.mp4',
    ARRAY['https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177432/vis4817_abo2in.mp4'],
    900::numeric,
    '10x sem juros',
    'SAFRA_VIS_2026',
    jsonb_build_object(
      'registro', 'VIS 4817',
      'raca', 'Nelore PO',
      'nascimento', null,
      'pai', 'GANADEIRO EAO',
      'mae', null,
      'iabcz', '36,76',
      'iqg', '45,25',
      'mgte', '31,83',
      'top', 'TOP 0,5%',
      'status', 'Disponível',
      'proprietario', 'Antonio Martins Araújo Neto',
      'breeder', 'Fazenda Visual',
      'comentario', 'Embrião VIT Safra 2026 Nelore Visual × FdB. Pacote 12 embriões, 4 prenhezes garantidas. iABCZ 36,76 (P 0,1%) · IQG 45,25 (TOP 0,1%) · MGTe 31,83 (TOP 0,5%). Nome ABCZ e genealogia em validação.',
      'slug', 'vis-4817',
      'cruzamento', 'GANADEIRO EAO',
      'classificacao_top', 'TOP 0,5%',
      'pacote_total', 10800,
      'quantidade_embrioes', 12,
      'parcelamento', '10× sem juros (1 entrada + 9 parcelas)',
      'video', 'https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177432/vis4817_abo2in.mp4'
    ),
    true,
    1002
  ),

  -- VIS 4632 × REM NOCAUTE (nome ABCZ pendente)
  (
    'VIS 4632 - Pacote 12 Embriões VIT',
    'Embrião VIT',
    'embriao',
    'venda_direta',
    'frete_compartilhado',
    'Entrada + 9x',
    'Esmeraldas - MG',
    'https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177460/vis4632_bsphoi.mp4',
    ARRAY['https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177460/vis4632_bsphoi.mp4'],
    650::numeric,
    '10x sem juros',
    'SAFRA_VIS_2026',
    jsonb_build_object(
      'registro', 'VIS 4632',
      'raca', 'Nelore PO',
      'nascimento', null,
      'pai', 'REM NOCAUTE',
      'mae', null,
      'iabcz', '32,61',
      'iqg', '38,19',
      'mgte', '33,02',
      'top', 'TOP 1%',
      'status', 'Disponível',
      'proprietario', 'Antonio Martins Araújo Neto',
      'breeder', 'Fazenda Visual',
      'comentario', 'Embrião VIT Safra 2026 Nelore Visual × FdB. Pacote 12 embriões, 4 prenhezes garantidas. iABCZ 32,61 (P 0,1%) · IQG 38,19 (TOP 0,5%) · MGTe 33,02 (TOP 0,5%). Nome ABCZ e genealogia em validação.',
      'slug', 'vis-4632',
      'cruzamento', 'REM NOCAUTE',
      'classificacao_top', 'TOP 1%',
      'pacote_total', 7800,
      'quantidade_embrioes', 12,
      'parcelamento', '10× sem juros (1 entrada + 9 parcelas)',
      'video', 'https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177460/vis4632_bsphoi.mp4'
    ),
    true,
    1001
  ),

  -- VIS 4634 × IVANOV ARZ (nome ABCZ pendente)
  (
    'VIS 4634 - Pacote 12 Embriões VIT',
    'Embrião VIT',
    'embriao',
    'venda_direta',
    'frete_compartilhado',
    'Entrada + 9x',
    'Esmeraldas - MG',
    'https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177484/vis4634_wxd4ms.mp4',
    ARRAY['https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177484/vis4634_wxd4ms.mp4'],
    650::numeric,
    '10x sem juros',
    'SAFRA_VIS_2026',
    jsonb_build_object(
      'registro', 'VIS 4634',
      'raca', 'Nelore PO',
      'nascimento', null,
      'pai', 'IVANOV ARZ',
      'mae', null,
      'iabcz', '31,31',
      'iqg', '38,85',
      'mgte', '32,41',
      'top', 'TOP 2%',
      'status', 'Disponível',
      'proprietario', 'Antonio Martins Araújo Neto',
      'breeder', 'Fazenda Visual',
      'comentario', 'Embrião VIT Safra 2026 Nelore Visual × FdB. Pacote 12 embriões, 4 prenhezes garantidas. iABCZ 31,31 (P 0,1%) · IQG 38,85 (TOP 0,5%) · MGTe 32,41 (TOP 0,5%). Nome ABCZ e genealogia em validação.',
      'slug', 'vis-4634',
      'cruzamento', 'IVANOV ARZ',
      'classificacao_top', 'TOP 2%',
      'pacote_total', 7800,
      'quantidade_embrioes', 12,
      'parcelamento', '10× sem juros (1 entrada + 9 parcelas)',
      'video', 'https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177484/vis4634_wxd4ms.mp4'
    ),
    true,
    1000
  )
) AS v(
  name, category, classificacao, modalidade, logistica, forma_pagamento,
  location, image_url, gallery, price, installments, tag, details, active, display_order
)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.products p
  WHERE p.details->>'registro' = v.details->>'registro'
);
