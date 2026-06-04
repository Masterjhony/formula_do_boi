-- ==============================================================================
-- SEED: Doadoras GARTA MAT. e JATY MAT. no catálogo `products` — OCULTAS
-- ==============================================================================
-- Materializa as doadoras hardcoded em src/data/doadoras.ts (entries "garta-mat"
-- e "jaty-mat") na tabela `products` pra que apareçam no web-admin
-- /lotes-doadoras, e ao mesmo tempo as deixa OCULTAS no site (active=false).
--
-- A tag `SAFRA_VIS_2026` funciona como gate de visibilidade:
--   - /web-site/embrioes/page.tsx lê `active` por tag e esconde do catálogo;
--   - /web-site/embrioes/[slug]/page.tsx e /checkout-embriao/[slug] idem.
-- Com active=false, os 3 cards somem do /embrioes mas ficam disponíveis no
-- admin com o toggle de visibilidade (olho) pra religar quando quiser.
--
-- Fonte: src/data/doadoras.ts + DOADORAS_CONDICOES (criatório Nelore Leão /
-- Rancho da Matinha · Esmeraldas/MG · 12 embriões VIT · 20× sem juros).
--
-- Idempotente: insere só se ainda não existir row com o mesmo registro.
-- ==============================================================================

INSERT INTO public.products (
  name, category, classificacao, modalidade, logistica, forma_pagamento,
  location, image_url, gallery, price, installments, tag, details, active, display_order
)
SELECT v.*
FROM (VALUES
  -- GARTA MAT. (RDM A5372) × A7286 MAT.
  (
    'GARTA MAT. - Pacote 12 Embriões VIT',
    'Embrião VIT',
    'embriao',
    'venda_direta',
    'frete_compartilhado',
    'Entrada + 19x',
    'Esmeraldas - MG',
    'https://res.cloudinary.com/dny0ibgbn/video/upload/v1780514254/lote-77_Wo8Wijj8_t4fjt6.mp4',
    ARRAY['https://res.cloudinary.com/dny0ibgbn/video/upload/v1780514254/lote-77_Wo8Wijj8_t4fjt6.mp4'],
    1300::numeric,
    '20x sem juros',
    'SAFRA_VIS_2026',
    jsonb_build_object(
      'registro', 'RDM A5372',
      'raca', 'Nelore PO',
      'nascimento', '06/07/2021',
      'pai', 'A7286 MAT.',
      'mae', null,
      'iabcz', '32,83',
      'iqg', '41,14',
      'mgte', '33,02',
      'top', 'TOP 0,1%',
      'status', 'Disponível',
      'proprietario', 'Rancho da Matinha',
      'breeder', 'Nelore Leão',
      'tipo_embriao', 'VIT',
      'comentario', 'Embrião VIT Nelore PO · Criatório Nelore Leão (Esmeraldas/MG). iABCZ 32,83 (P 0,1%) · IQG 41,14 (TOP 0,1%) · MGTe 33,02 (TOP 0,5%). Pacote 12 embriões VIT, 4 prenhezes garantidas.',
      'slug', 'garta-mat',
      'cruzamento', 'A7286 MAT.',
      'classificacao_top', 'TOP 0,1%',
      'pacote_total', 15600,
      'quantidade_embrioes', 12,
      'parcelamento', '20× sem juros',
      'video', 'https://res.cloudinary.com/dny0ibgbn/video/upload/v1780514254/lote-77_Wo8Wijj8_t4fjt6.mp4'
    ),
    false,
    1007
  ),

  -- JATY MAT. (RDM B3610) × HANDI MAT.
  (
    'JATY MAT. - Pacote 12 Embriões VIT',
    'Embrião VIT',
    'embriao',
    'venda_direta',
    'frete_compartilhado',
    'Entrada + 19x',
    'Esmeraldas - MG',
    'https://res.cloudinary.com/dny0ibgbn/video/upload/v1780514262/img-8157_f11T2ejZ_aesasw.mp4',
    ARRAY['https://res.cloudinary.com/dny0ibgbn/video/upload/v1780514262/img-8157_f11T2ejZ_aesasw.mp4'],
    1300::numeric,
    '20x sem juros',
    'SAFRA_VIS_2026',
    jsonb_build_object(
      'registro', 'RDM B3610',
      'raca', 'Nelore PO',
      'nascimento', '27/08/2024',
      'pai', 'HANDI MAT.',
      'mae', null,
      'iabcz', '36,42',
      'iqg', '45,06',
      'mgte', '37,70',
      'top', 'TOP 0,1%',
      'status', 'Disponível',
      'proprietario', 'Rancho da Matinha',
      'breeder', 'Rancho da Matinha',
      'tipo_embriao', 'VIT',
      'comentario', 'Embrião VIT Nelore PO · Rancho da Matinha (Esmeraldas/MG). iABCZ 36,42 (P 0,1%) · IQG 45,06 (TOP 0,1%) · MGTe 37,70 (TOP 0,1%). Pacote 12 embriões VIT, 4 prenhezes garantidas.',
      'slug', 'jaty-mat',
      'cruzamento', 'HANDI MAT.',
      'classificacao_top', 'TOP 0,1%',
      'pacote_total', 15600,
      'quantidade_embrioes', 12,
      'parcelamento', '20× sem juros',
      'video', 'https://res.cloudinary.com/dny0ibgbn/video/upload/v1780514262/img-8157_f11T2ejZ_aesasw.mp4'
    ),
    false,
    1006
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

-- ==============================================================================
-- Ocultar também a FCCH 3955 (Cachoeirão), que já existe no catálogo com
-- active=true. Idempotente.
-- ==============================================================================
UPDATE public.products
SET active = false
WHERE details->>'registro' IN ('FCCH 3955', 'RDM A5372', 'RDM B3610');
