-- ==============================================================================
-- SEED: Doadora FCCH 3955 (Cachoeirão) no catálogo `products`
-- ==============================================================================
-- Materializa a doadora hardcoded em src/data/doadoras.ts (entry "fcch-3955")
-- pra que apareça no web-admin /lotes-doadoras junto com as VIS.
--
-- Fonte: src/data/doadoras.ts + fichas ANCP/GenePlus/PMGZ (mai-2026).
-- Proprietário: José Rodrigues Pereira · Fazenda Cachoeirão · Bandeirantes/MS.
-- Pacote: 12 embriões VIT, 4 prenhezes garantidas, 10× sem juros (R$ 13.200 total).
--
-- Tag `SAFRA_VIS_2026` é reaproveitada como gate de visibilidade no site:
--   - /web-site/embrioes/page.tsx lê `active` por tag pra esconder doadoras;
--   - /web-site/embrioes/[slug]/page.tsx usa o mesmo gate pro detalhe;
--   - /web-site/checkout-embriao/[slug]/page.tsx idem pro checkout.
-- Renomear pra algo neutro tipo "SAFRA_FDB_2026" exige tocar 3 queries —
-- por ora mantemos compatibilidade.
--
-- Idempotente: só insere se ainda não existir row com mesmo registro FCCH 3955.
-- ==============================================================================

INSERT INTO public.products (
  name, category, classificacao, modalidade, logistica, forma_pagamento,
  location, image_url, gallery, price, installments, tag, details, active, display_order
)
SELECT v.*
FROM (VALUES
  (
    '3955 FIV FC CACHOEIRAO - Pacote 12 Embriões VIT',
    'Embrião VIT',
    'embriao',
    'venda_direta',
    'frete_compartilhado',
    'Entrada + 9x',
    'Bandeirantes - MS',
    'https://res.cloudinary.com/dny0ibgbn/video/upload/v1779738203/LOTE_09_-_FCCH_3955_1_1_wlfdau.mp4',
    ARRAY['https://res.cloudinary.com/dny0ibgbn/video/upload/v1779738203/LOTE_09_-_FCCH_3955_1_1_wlfdau.mp4'],
    1100::numeric,
    '10x sem juros',
    'SAFRA_VIS_2026',
    jsonb_build_object(
      'registro', 'FCCH 3955',
      'raca', 'Nelore PO',
      'nascimento', '15/07/2025',
      'pai', 'CASANOVA BONS',
      'mae', '3027 FC CACHOEIRAO',
      'iabcz', '33,44',
      'iqg', '37,86',
      'mgte', '28,65',
      'top', 'TOP 0,1%',
      'status', 'Disponível',
      'proprietario', 'José Rodrigues Pereira',
      'breeder', 'Fazenda Cachoeirão',
      'comentario', 'Embrião VIT Nelore PO · Doadora Cachoeirão (Bandeirantes/MS). Avaliação cruzada nos três programas: PMGZ/ABCZ iABCZg 33,44 (DECA 1 · P 0,1%) · GenePlus IQGg 37,86 (Classe E · P 0,5%) · ANCP MGTe 28,65 (TOP 4%). Pacote 12 embriões, 4 prenhezes garantidas.',
      'slug', 'fcch-3955',
      'cruzamento', null,
      'classificacao_top', 'TOP 0,1%',
      'pacote_total', 13200,
      'quantidade_embrioes', 12,
      'parcelamento', '10× sem juros (1 entrada + 9 parcelas)',
      'video', 'https://res.cloudinary.com/dny0ibgbn/video/upload/v1779738203/LOTE_09_-_FCCH_3955_1_1_wlfdau.mp4',
      'fichas_tecnicas', jsonb_build_array(
        jsonb_build_object('programa', 'PMGZ/ABCZ', 'corte', '2026-2', 'url', '/FCCH-3955-PMGZ.pdf'),
        jsonb_build_object('programa', 'GenePlus/Embrapa', 'corte', 'Abril/2026', 'url', '/FCCH-3955-GENEPLUS.pdf'),
        jsonb_build_object('programa', 'ANCP', 'corte', '1ª AG ABR/2026', 'url', '/FCCH-3955-ANCP.pdf')
      )
    ),
    true,
    1005
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
