-- 1. Remove duplicates for IBIZA FIV RONDA, keeping only the most recent one
DELETE FROM public.products
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (partition BY name ORDER BY id DESC) as r_num
        FROM public.products
        WHERE name = 'IBIZA FIV RONDA - PCT 09 EMBRIÕES'
    ) t
    WHERE t.r_num > 1
);

-- 2. Update the remaining row with correct details (including PDF and Video)
UPDATE public.products
SET 
    details = jsonb_set(
        jsonb_set(
            jsonb_set(
                details, 
                '{pdf}', 
                '"/IBIZ1523.pdf"'
            ),
            '{video_touro}',
            '"https://www.youtube.com/watch?v=oOW_TO8kjzM"'
        ),
        '{comentario}',
        '"OPORTUNIDADE: 03 Pacotes de 09 embriões disponíveis (R$ 1.000,00/embrião). Total R$ 9.000,00. Acasalamento com o touro VALOR FIV V3. 35% de garantia de prenhez aos 60 dias (DG60)."'
    )
WHERE name = 'IBIZA FIV RONDA - PCT 09 EMBRIÕES';

-- 3. Check for duplicates of MEDUZA and clean up if necessary
-- Assuming "MEDUZA - Pacote 10 Embriões" matching the screenshot name
DELETE FROM public.products
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (partition BY name ORDER BY id DESC) as r_num
        FROM public.products
        WHERE name LIKE 'MEDUZA%' OR name LIKE '%MEDUZA%' -- Safer check
    ) t
    WHERE t.r_num > 1
);
