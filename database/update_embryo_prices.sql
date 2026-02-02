-- Update prices and installments for Embryos
-- Trufa (ID 1), Dandara (ID 4), Fada (ID 5)

-- 1. TRUFA BERRANTE DE OURO (ID 1) -> 30x R$ 40,00 = 1.200,00
UPDATE public.products
SET 
    price = 1200.00,
    installments = '40,00',
    forma_pagamento = 'parcelado_30x'
WHERE id = 1;

-- 4. DANDARA EAJR 2 (ID 4) -> 30x R$ 36,66 = 1.100,00
UPDATE public.products
SET 
    price = 1100.00,
    installments = '36,66',
    forma_pagamento = 'parcelado_30x'
WHERE id = 4;

-- 5. FADA IBIZ 2331 (ID 5) -> 30x R$ 50,00 = 1.500,00
UPDATE public.products
SET 
    price = 1500.00,
    installments = '50,00',
    forma_pagamento = 'parcelado_30x'
WHERE id = 5;
