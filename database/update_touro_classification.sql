-- Atualizar classificação do animal IBIZA FIV LOBO (ID 260) para Touro
UPDATE public.products
SET 
    category = 'Touro PO',
    classificacao = 'touro'
WHERE 
    id = 260;
