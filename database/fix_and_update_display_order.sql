-- 1. Add display_order column to products table (if it doesn't exist)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- 2. Create index for faster sorting (if it doesn't exist)
CREATE INDEX IF NOT EXISTS products_display_order_idx ON public.products (display_order DESC);

-- 3. Reset all display_order to 0 first
UPDATE public.products SET display_order = 0;

-- 4. Update specific bulls with high display_order
-- The higher the number, the earlier it appears

-- 385 FIV BEMACH
UPDATE public.products SET display_order = 1000 WHERE name ILIKE '%385 FIV BEMACH%';

-- L4365 SINO
UPDATE public.products SET display_order = 990 WHERE name ILIKE '%L4365 SINO%';

-- 3853 FIV DA MARCONDES
UPDATE public.products SET display_order = 980 WHERE name ILIKE '%3853 FIV DA MARCONDES%';

-- J3869 SINO
UPDATE public.products SET display_order = 970 WHERE name ILIKE '%J3869 SINO%';

-- IBIZA FIV 2014
UPDATE public.products SET display_order = 960 WHERE name ILIKE '%IBIZA FIV 2014%';

-- IBIZA FIV LOBO
UPDATE public.products SET display_order = 950 WHERE name ILIKE '%IBIZA FIV LOBO%';

-- LIME BRYAN
UPDATE public.products SET display_order = 940 WHERE name ILIKE '%LIME BRYAN%';

-- DINAMITE FIV DA FEGO
UPDATE public.products SET display_order = 930 WHERE name ILIKE '%DINAMITE FIV DA FEGO%';

-- VOLT FIV NELORE ELIZA
UPDATE public.products SET display_order = 920 WHERE name ILIKE '%VOLT FIV NELORE ELIZA%';

-- ASTRO FIV NELORE ELIZA
UPDATE public.products SET display_order = 910 WHERE name ILIKE '%ASTRO FIV NELORE ELIZA%';

-- 3943 DA FARROUPILHA
UPDATE public.products SET display_order = 900 WHERE name ILIKE '%3943 DA FARROUPILHA%';
