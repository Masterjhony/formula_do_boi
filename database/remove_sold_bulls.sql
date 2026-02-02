-- Remove sold bulls from the products table
-- List: GSOL1566, NAJ0087, NAJ104, NAJ0062, GSOL1614, NAJ0070, NAJ0076, NAJ0056, GSOL1571, NAJ0078, GSOL1592, GSOL1649

DELETE FROM public.products 
WHERE details->>'registro' IN (
    'GSOL1566', 
    'NAJ0087', 
    'NAJ104', 
    'NAJ0062', 
    'GSOL1614', 
    'NAJ0070', 
    'NAJ0076', 
    'NAJ0056', 
    'GSOL1571', 
    'NAJ0078', 
    'GSOL1592', 
    'GSOL1649'
);
