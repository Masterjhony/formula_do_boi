-- Update IBIZA FIV ORQUIDEA with new price conditions and special flag
UPDATE public.products
SET 
    price = 20000.00,
    installments = '850,00',
    forma_pagamento = '30x',
    details = jsonb_set(details, '{special_price}', 'true'::jsonb)
WHERE name = 'IBIZA FIV ORQUIDEA';
