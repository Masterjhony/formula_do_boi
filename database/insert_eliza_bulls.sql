-- Insert Fazenda Eliza Bulls
-- Owner: Fazenda Eliza
-- Location: Riachinho - MG
-- Pricing: R$ 12.000,00 (A vista)

-- 1. Ensure Breeder Exists
INSERT INTO public.breeders (name)
VALUES ('Fazenda Eliza')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Products
DO $$
DECLARE
    v_breeder text := 'Fazenda Eliza';
    v_location text := 'Riachinho - MG';
    v_price numeric := 12000.00;
    v_installments text := 'À Vista';
    v_payment text := 'A vista'; -- Or '1x' if preferred, but screenshot says 'A vista'
    v_category text := 'Touro PO';
    v_classification text := 'touro';
    v_tag text := 'Em Estoque';
    v_details jsonb;
BEGIN

    -- 1. VOLT FIV NELORE ELIZA (AVU 10)
    v_details := jsonb_build_object(
        'registro', 'AVU 10',
        'raca', 'Nelore Padrão',
        'nascimento', '20/11/2023',
        'pai', 'LACRE FIV L.CANCADO',
        'mae', 'FACETA FIV GC DA SL',
        'iabcz', '-4.1',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/AVU10.pdf'
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'VOLT FIV NELORE ELIZA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://www.youtube.com/watch?v=OIGLYVNNI9k',
            gallery = ARRAY['https://www.youtube.com/watch?v=OIGLYVNNI9k'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'VOLT FIV NELORE ELIZA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'VOLT FIV NELORE ELIZA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://www.youtube.com/watch?v=OIGLYVNNI9k',
            ARRAY['https://www.youtube.com/watch?v=OIGLYVNNI9k'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 2. ASTRO FIV NELORE ELIZA (AVU 32)
    v_details := jsonb_build_object(
        'registro', 'AVU 32',
        'raca', 'Nelore Padrão',
        'nascimento', '04/01/2024',
        'pai', 'VITORIOSO SL NOVO',
        'mae', 'LATIFA DE FAZ. ELIZA',
        'iabcz', '0.57',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/AVU32.pdf'
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'ASTRO FIV NELORE ELIZA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://www.youtube.com/watch?v=BaQRqaW9luQ',
            gallery = ARRAY['https://www.youtube.com/watch?v=BaQRqaW9luQ'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'ASTRO FIV NELORE ELIZA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'ASTRO FIV NELORE ELIZA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://www.youtube.com/watch?v=BaQRqaW9luQ',
            ARRAY['https://www.youtube.com/watch?v=BaQRqaW9luQ'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 3. BARROCO FIV DE FAZ. ELIZA (OUB 1248)
    v_details := jsonb_build_object(
        'registro', 'OUB 1248',
        'raca', 'Nelore Padrão',
        'nascimento', '20/02/2023',
        'pai', 'VITORIOSO SL NOVO',
        'mae', 'LATIFA DE FAZ. ELIZA',
        'iabcz', '',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/OUB1248.pdf'
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BARROCO FIV DE FAZ. ELIZA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://www.youtube.com/watch?v=T6OsC-79CJk',
            gallery = ARRAY['https://www.youtube.com/watch?v=T6OsC-79CJk'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'BARROCO FIV DE FAZ. ELIZA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BARROCO FIV DE FAZ. ELIZA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://www.youtube.com/watch?v=T6OsC-79CJk',
            ARRAY['https://www.youtube.com/watch?v=T6OsC-79CJk'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

END $$;
