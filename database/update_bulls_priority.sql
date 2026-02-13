-- Reset all display_order to 0 first (optional, but good for cleanliness)
UPDATE public.products SET display_order = 0;

-- Update specific bulls with high display_order
-- The higher the number, the earlier it appears (assuming DESC sort)

-- 1. 385 FIV BEMACH
UPDATE public.products SET display_order = 1000 WHERE name ILIKE '%385 FIV BEMACH%';

-- 2. L4365 SINO
UPDATE public.products SET display_order = 990 WHERE name ILIKE '%L4365 SINO%';

-- 3. 3853 FIV DA MARCONDES
UPDATE public.products SET display_order = 980 WHERE name ILIKE '%3853 FIV DA MARCONDES%';

-- 4. J3869 SINO
UPDATE public.products SET display_order = 970 WHERE name ILIKE '%J3869 SINO%';

-- 5. IBIZA FIV 2014
UPDATE public.products SET display_order = 960 WHERE name ILIKE '%IBIZA FIV 2014%';

-- 6. IBIZA FIV LOBO
UPDATE public.products SET display_order = 950 WHERE name ILIKE '%IBIZA FIV LOBO%';

-- 7. LIME BRYAN
UPDATE public.products SET display_order = 940 WHERE name ILIKE '%LIME BRYAN%';

-- 8. DINAMITE FIV DA FEGO
UPDATE public.products SET display_order = 930 WHERE name ILIKE '%DINAMITE FIV DA FEGO%';

-- 9. VOLT FIV NELORE ELIZA
UPDATE public.products SET display_order = 920 WHERE name ILIKE '%VOLT FIV NELORE ELIZA%';

-- 10. ASTRO FIV NELORE ELIZA
UPDATE public.products SET display_order = 910 WHERE name ILIKE '%ASTRO FIV NELORE ELIZA%';

-- 11. 3943 DA FARROUPILHA
UPDATE public.products SET display_order = 900 WHERE name ILIKE '%3943 DA FARROUPILHA%';
