-- 1. Ensure all canonical breeders exist in the 'breeders' table
INSERT INTO breeders (name)
VALUES 
    ('GSOL'),
    ('R3'),
    ('Arthur Couto'),
    ('Berrante de Ouro'),
    ('Nelore Visual'),
    ('Luden')
ON CONFLICT (name) DO NOTHING;

-- 2. Standardize 'Nelore Visual'
-- Update products where breeder/proprietario might be 'Fazenda Visual', 'Visual', 'Agropecuária Visual'
UPDATE products 
SET details = jsonb_set(details, '{breeder}', '"Nelore Visual"') 
WHERE details->>'breeder' ILIKE '%Visual%';

UPDATE products 
SET details = jsonb_set(details, '{proprietario}', '"Nelore Visual"') 
WHERE details->>'proprietario' ILIKE '%Visual%';

-- 3. Standardize 'Berrante de Ouro'
-- Update UPPERCASE or variations
UPDATE products 
SET details = jsonb_set(details, '{breeder}', '"Berrante de Ouro"') 
WHERE details->>'breeder' ILIKE 'BERRANTE DE OURO';

UPDATE products 
SET details = jsonb_set(details, '{proprietario}', '"Berrante de Ouro"') 
WHERE details->>'proprietario' ILIKE 'BERRANTE DE OURO';

-- 4. Standardize 'Luden'
UPDATE products 
SET details = jsonb_set(details, '{breeder}', '"Luden"') 
WHERE details->>'breeder' ILIKE 'LUDEN';

UPDATE products 
SET details = jsonb_set(details, '{proprietario}', '"Luden"') 
WHERE details->>'proprietario' ILIKE 'LUDEN';

-- 5. Link Orphans (If specific patterns match, e.g., 'MFRA' -> Arthur Couto?)
-- Based on products.ts: "MFRA" -> "Arthur Couto"
UPDATE products
SET details = jsonb_set(details, '{breeder}', '"Arthur Couto"')
WHERE details->>'registro' LIKE 'MFRA%';

-- Based on products.ts: "RJPS" -> "R3"
UPDATE products
SET details = jsonb_set(details, '{breeder}', '"R3"')
WHERE details->>'registro' LIKE 'RJPS%';

-- Based on products.ts: "VIS" -> "Nelore Visual"
UPDATE products
SET details = jsonb_set(details, '{breeder}', '"Nelore Visual"')
WHERE details->>'registro' LIKE 'VIS%';

-- 6. Clean up unused breeders (Optional, or user can do manually. Leaving for safety)
-- DELETE FROM breeders WHERE name NOT IN ('GSOL', 'R3', 'Arthur Couto', 'Berrante de Ouro', 'Nelore Visual', 'Luden');
