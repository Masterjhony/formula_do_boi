-- ==============================================================================
-- UPDATE R3 BULLS PRICES AND CONDITIONS (CORRECTED)
-- ==============================================================================

-- 1. QUINCAS RJ DA R3 (RJPS 556)
UPDATE public.products 
SET 
    price = 18000,
    installments = '600,00',
    forma_pagamento = '30x'
WHERE name = 'QUINCAS RJ DA R3';

-- 2. RELUTANTE RJ DA R3 (RJPS 579)
UPDATE public.products 
SET 
    price = 18000,
    installments = '600,00',
    forma_pagamento = '30x'
WHERE name = 'RELUTANTE RJ DA R3';

-- 2. RAPEL RJ DA R3 (RJPS 573)
UPDATE public.products 
SET 
    price = 18000,
    installments = '600,00',
    forma_pagamento = '30x'
WHERE name = 'RAPEL RJ DA R3';

-- 3. REBELIÃO RJ DA R3 (RJPS 615)
UPDATE public.products 
SET 
    price = 18000,
    installments = '600,00',
    forma_pagamento = '30x'
WHERE name = 'REBELIÃO RJ DA R3';

-- 4. RUMINANTE FIV RJ DA R3 (RJPS 606)
UPDATE public.products 
SET 
    price = 18000,
    installments = '600,00',
    forma_pagamento = '30x'
WHERE name = 'RUMINANTE FIV RJ DA R3';

-- 5. REVOGADO FIV RJ DA R3 (RJPS 656)
UPDATE public.products 
SET 
    price = 18000,
    installments = '600,00',
    forma_pagamento = '30x'
WHERE name = 'REVOGADO FIV RJ DA R3';

-- 6. ROMANCE RJ DA R3 (RJPS 634)
UPDATE public.products 
SET 
    price = 18000,
    installments = '600,00',
    forma_pagamento = '30x'
WHERE name = 'ROMANCE RJ DA R3';

-- 7. RIQUELME FIV RJ DA R3 (RJPS 680)
UPDATE public.products 
SET 
    price = 18000,
    installments = '600,00',
    forma_pagamento = '30x'
WHERE name = 'RIQUELME FIV RJ DA R3';

-- 8. TARADO RJ DA R3 (RJPS 893)
UPDATE public.products 
SET 
    price = 15000,
    installments = '500,00',
    forma_pagamento = '30x'
WHERE name = 'TARADO RJ DA R3';

-- 9. RADICAL RJ DA R3 (RJPS 586) - VENDIDO
UPDATE public.products 
SET 
    price = 18000,
    installments = '600,00',
    forma_pagamento = '30x',
    tag = 'Vendido'
WHERE name = 'RADICAL RJ DA R3';
