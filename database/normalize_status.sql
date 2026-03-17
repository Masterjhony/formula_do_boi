-- ============================================================
-- Normalização do campo status dos animais
--
-- Problema: o campo details->>'status' (e a coluna status) foi
-- usado incorretamente em vários inserts para armazenar o TIPO
-- do animal ('Touro', 'Matriz') ou o STATUS de ESTOQUE
-- ('Em Estoque', 'Matriz Parida e Prenha'), ao invés do status
-- de disponibilidade real.
--
-- Consequência: no dashboard, apenas 13 animais apareciam como
-- "Disponíveis" pois a lógica só reconhecia 'Disponível' como
-- status válido — os demais caíam fora de todas as contagens.
--
-- Solução: normalizar para os únicos 4 statuses válidos:
--   'Disponível' | 'Vendido' | 'Reservado' | 'Inativo'
-- ============================================================

-- 1. Valores que indicam disponibilidade → 'Disponível'
--    ('Touro', 'Matriz', 'Em Estoque', 'Matriz Parida e Prenha', etc.
--     são tipo/estado reprodutivo, não status de venda)
UPDATE public.products
SET
    status  = 'Disponível',
    details = CASE
                WHEN details IS NOT NULL
                THEN jsonb_set(details, '{status}', '"Disponível"')
                ELSE details
              END
WHERE
    active = true
    AND sold = false
    AND COALESCE(details->>'status', '') NOT IN ('Disponível', 'Vendido', 'Reservado', 'Inativo', '');

-- 2. Garantir coerência com o boolean sold=true → 'Vendido'
UPDATE public.products
SET
    status  = 'Vendido',
    details = CASE
                WHEN details IS NOT NULL
                THEN jsonb_set(details, '{status}', '"Vendido"')
                ELSE details
              END
WHERE
    sold = true
    AND COALESCE(status, '') != 'Vendido';

-- 3. Animais inativos (active=false, sold=false) → 'Inativo'
UPDATE public.products
SET
    status  = 'Inativo',
    details = CASE
                WHEN details IS NOT NULL
                THEN jsonb_set(details, '{status}', '"Inativo"')
                ELSE details
              END
WHERE
    active = false
    AND sold = false
    AND COALESCE(status, '') NOT IN ('Inativo', 'Vendido');

-- 4. Normalizar 'Em Estoque' remanescente → 'Disponível'
UPDATE public.products
SET
    status  = 'Disponível',
    details = CASE
                WHEN details IS NOT NULL
                THEN jsonb_set(details, '{status}', '"Disponível"')
                ELSE details
              END
WHERE COALESCE(details->>'status', status, '') = 'Em Estoque';

-- Verificar resultado
SELECT
    COALESCE(details->>'status', status, 'sem status') AS status_atual,
    COUNT(*) AS total
FROM public.products
GROUP BY 1
ORDER BY 2 DESC;
