-- ============================================================================
-- embrioes_pelagem_raca.sql
--
-- Normaliza a classificação de pelagem (Nelore Padrão x Nelore Pintado) dos
-- produtos de embriao/doadora. Esse e o criterio usado pelo filtro da pagina
-- publica /embrioes (componente EmbrioesClient -> helper toPelagem()).
--
-- Fonte da verdade: products.raca (coluna), mantida em sincronia com
-- products.details->>'raca' — esse ultimo e o campo editado pelo formulario de
-- admin em /web-admin/products (datalist com "Nelore Padrao" / "Nelore Pintado").
--
-- A partir daqui, para reclassificar uma doadora basta o operador trocar a
-- "Raca" do produto no admin. Idempotente: pode reaplicar sem efeito colateral.
-- ============================================================================

BEGIN;

-- 1) Doadoras VIS - Safra 2026 (Nelore Visual) -> pelagem PADRAO (pelo branco)
UPDATE products
   SET raca    = 'Nelore Padrão',
       details = jsonb_set(coalesce(details, '{}'::jsonb), '{raca}', '"Nelore Padrão"')
 WHERE tag = 'SAFRA_VIS_2026';

-- 2) Catalogo de embrioes atual -> pelagem PINTADA
UPDATE products
   SET raca    = 'Nelore Pintado',
       details = jsonb_set(coalesce(details, '{}'::jsonb), '{raca}', '"Nelore Pintado"')
 WHERE classificacao = 'embriao'
   AND (tag IS NULL OR tag <> 'SAFRA_VIS_2026')
   AND name IN (
       'TRUFA BERRANTE DE OURO - Pacote 10 Embriões',
       'DANDARA EAJR 2 - Pacote 10 Embriões',
       'FADA IBIZ 2331 - Pacote 10 Embriões',
       'MEDUZA - Pacote 10 Embriões',
       'IBIZA FIV RONDA - PCT 09 EMBRIÕES'
   );

COMMIT;

-- Conferencia (rode separado para validar):
-- SELECT id, name, tag, raca, details->>'raca' AS details_raca
--   FROM products
--  WHERE classificacao = 'embriao'
--  ORDER BY id;
