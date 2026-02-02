-- ==============================================================================
-- UPDATE LOCATION AND BREEDER FOR MAFRA BULLS
-- ==============================================================================
-- Location: João Pinheiro-MG
-- Breeder: Arthur Couto

-- 1. 11112 MAFRA
UPDATE public.products
SET
    location = 'João Pinheiro-MG',
    details = jsonb_set(COALESCE(details, '{}'::jsonb), '{breeder}', '"Arthur Couto"')
WHERE name = '11112 MAFRA';

-- 2. 10622 MAFRA
UPDATE public.products
SET
    location = 'João Pinheiro-MG',
    details = jsonb_set(COALESCE(details, '{}'::jsonb), '{breeder}', '"Arthur Couto"')
WHERE name = '10622 MAFRA';
