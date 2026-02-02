-- Remove sold embryos from the products table
-- List: VANEZA MUN 4611, AMORA AQMJ 3422, FRANÇA EAJR 7

DELETE FROM public.products 
WHERE name IN (
    'VANEZA MUN 4611',
    'AMORA AQMJ 3422',
    'FRANÇA EAJR 7'
);
