-- Update ACAC Animals to Price 25k and 25x Installments

DO $$
BEGIN
    -- 1. METENA DA AC AGRO (ACAC 8263)
    UPDATE public.products SET
        price = 25000.00,
        installments = '1.000,00',
        forma_pagamento = 'parcelado_25x'
    WHERE name = 'METENA DA AC AGRO';

    -- 2. IMORALIDADE DA AC AGRO (ACAC 5375)
    UPDATE public.products SET
        price = 25000.00,
        installments = '1.000,00',
        forma_pagamento = 'parcelado_25x'
    WHERE name = 'IMORALIDADE DA AC AGRO';
    
    -- 3. MACAIBA DA AC AGRO (ACAC 8096)
    UPDATE public.products SET
        price = 25000.00,
        installments = '1.000,00',
        forma_pagamento = 'parcelado_25x'
    WHERE name = 'MACAIBA DA AC AGRO';

    -- 4. MESURA DA AC AGRO (ACAC 8298)
    UPDATE public.products SET
        price = 25000.00,
        installments = '1.000,00',
        forma_pagamento = 'parcelado_25x'
    WHERE name = 'MESURA DA AC AGRO';

END $$;
