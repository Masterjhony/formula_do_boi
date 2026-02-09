-- Update IBIZA FIV ORQUIDEA with new price conditions
UPDATE public.products
SET 
    price = 20000.00,
    installments = '850,00',
    forma_pagamento = '30x'
    -- removed down_payment_value line as the column does not exist
WHERE name = 'IBIZA FIV ORQUIDEA';
