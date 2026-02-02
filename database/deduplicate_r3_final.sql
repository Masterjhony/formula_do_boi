-- ==============================================================================
-- FINAL DEDUPLICATION FOR R3 BULLS
-- ==============================================================================
-- This script keeps ONLY the latest record (highest ID) for the specific bulls 
-- and deletes any duplicates (old names OR multiple new name entries).

-- 1. Remove ANY records with the OLD names (just in case)
DELETE FROM public.products 
WHERE name IN ('RJPS 592', 'RJPS 603');

-- 2. Deduplicate "REVOLUCAO RJ DA R3"
-- Deletes all records with this name EXCEPT the one with the highest ID.
DELETE FROM public.products
WHERE name = 'REVOLUCAO RJ DA R3'
AND id NOT IN (
    SELECT MAX(id) 
    FROM public.products 
    WHERE name = 'REVOLUCAO RJ DA R3'
);

-- 3. Deduplicate "RISPIDO FIV RJ DA R3"
-- Deletes all records with this name EXCEPT the one with the highest ID.
DELETE FROM public.products
WHERE name = 'RISPIDO FIV RJ DA R3'
AND id NOT IN (
    SELECT MAX(id) 
    FROM public.products 
    WHERE name = 'RISPIDO FIV RJ DA R3'
);
