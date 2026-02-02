-- ==============================================================================
-- REMOVE OBSOLETE RJPS BULLS (CLEANUP DUPLICATES)
-- ==============================================================================
-- Deletes records with the old names "RJPS 592" and "RJPS 603".
-- The correct records ("REVOLUCAO RJ DA R3" and "RISPIDO FIV RJ DA R3") will remain.

DELETE FROM public.products
WHERE name IN ('RJPS 592', 'RJPS 603');
