-- ============================================================
-- Normalização de Localizações
--
-- Padrão adotado: 'Cidade - UF'  (espaço-hífen-espaço)
-- Problema: alguns registros usavam 'Cidade-UF' (sem espaços)
--           e 'Cidade UF' (sem hífen), causando cidades duplicadas
--           nos dashboards.
-- ============================================================

-- Corrigir entradas sem espaços ao redor do hífen
UPDATE public.products SET location = 'Curvelo - MG'               WHERE location = 'Curvelo-MG';
UPDATE public.products SET location = 'João Pinheiro - MG'          WHERE location = 'João Pinheiro-MG';
UPDATE public.products SET location = 'Prata - MG'                  WHERE location = 'Prata-MG';
UPDATE public.products SET location = 'Juatuba - MG'                WHERE location = 'Juatuba-MG';
UPDATE public.products SET location = 'São Joaquim de Bicas - MG'   WHERE location = 'São Joaquim de Bicas-MG';
UPDATE public.products SET location = 'São Simão - GO'              WHERE location = 'São Simão-GO';
UPDATE public.products SET location = 'Jordânia - MG'               WHERE location = 'Jordânia-MG';

-- Corrigir entrada sem acento (Jordania → Jordânia)
UPDATE public.products SET location = 'Jordânia - MG'               WHERE location = 'Jordania - MG';

-- Corrigir entrada sem separador (espaço em vez de ' - ')
UPDATE public.products SET location = 'Comendador Gomes - MG'       WHERE location = 'Comendador Gomes MG';

-- Verificar resultado
SELECT location, COUNT(*) AS total
FROM public.products
GROUP BY location
ORDER BY location;
