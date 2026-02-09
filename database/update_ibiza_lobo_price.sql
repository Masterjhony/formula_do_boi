-- Update IBIZA FIV LOBO with new price conditions and special flag
UPDATE public.products
SET 
    price = 17000.00,
    installments = '650,00',
    forma_pagamento = '30x',
    details = jsonb_set(details, '{special_price}', 'true'::jsonb)
WHERE name = 'IBIZA FIV LOBO';
