-- ==============================================================================
-- BULK UPDATE: SET LOCATION FOR ALL R3 BULLS TO 'Itacarambi - MG'
-- ==============================================================================

UPDATE public.products
SET location = 'Itacarambi - MG'
WHERE 
    name LIKE '%RJ DA R3%' 
    OR (details->>'registro') LIKE '%RJPS%';
