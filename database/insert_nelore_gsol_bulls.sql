-- Insert Nelore GSOL Bulls
-- Owner: Nelore GSOL
-- Location: Jordânia-MG
-- Pricing: R$ 15.000,00 (A vista)

-- 1. Ensure Breeder Exists
INSERT INTO public.breeders (name)
VALUES ('Nelore GSOL')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Products
DO $$
DECLARE
    v_breeder text := 'Nelore GSOL';
    v_location text := 'Jordânia-MG';
    v_price numeric := 15000.00;
    v_installments text := 'À Vista';
    v_payment text := 'A vista';
    v_category text := 'Touro PO';
    v_classification text := 'touro';
    v_tag text := 'Em Estoque';
    v_commission text := '4%';
    v_details jsonb;
BEGIN

    -- 1. ZORRO (GSOL 1514)
    v_details := jsonb_build_object(
        'registro', 'GSOL 1514',
        'raca', 'Nelore Padrão',
        'nascimento', '15/08/2023',
        'pai', 'MAESTRO DA AC AGRO',
        'mae', 'BELEZA',
        'iabcz', '26.18',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/GSOL1514.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'ZORRO') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353684/GSOL1514_tdfzj4.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353684/GSOL1514_tdfzj4.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'ZORRO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'ZORRO', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353684/GSOL1514_tdfzj4.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353684/GSOL1514_tdfzj4.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 2. TUPER (GSOL 1628)
    v_details := jsonb_build_object(
        'registro', 'GSOL 1628',
        'raca', 'Nelore Padrão',
        'nascimento', '17/11/2023',
        'pai', 'DELEGADO FIV DA EAO',
        'mae', 'JA',
        'iabcz', '26.12',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/GSOL1628.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'TUPER') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353684/GSOL1628_chtrmk.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353684/GSOL1628_chtrmk.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'TUPER';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'TUPER', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353684/GSOL1628_chtrmk.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353684/GSOL1628_chtrmk.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 3. ENCANTO (GSOL 1814)
    v_details := jsonb_build_object(
        'registro', 'GSOL 1814',
        'raca', 'Nelore Padrão',
        'nascimento', '15/10/2024',
        'pai', 'VISUAL DE NAVIRAI',
        'mae', 'FIA',
        'iabcz', '19.98',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/GSOL1814.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'ENCANTO') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353680/GSOL1814_dk80b5.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353680/GSOL1814_dk80b5.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'ENCANTO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'ENCANTO', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353680/GSOL1814_dk80b5.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353680/GSOL1814_dk80b5.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 4. 385 FIV BEMACH (NBEM 385)
    v_details := jsonb_build_object(
        'registro', 'NBEM 385',
        'raca', 'Nelore Padrão',
        'nascimento', '04/02/2024',
        'pai', 'DELEGADO FIV DA EAO',
        'mae', 'B9623 DA S.NICE',
        'iabcz', '34.06',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/NBEM385.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = '385 FIV BEMACH') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353676/NBEM_385_iqmtwl.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353676/NBEM_385_iqmtwl.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = '385 FIV BEMACH';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '385 FIV BEMACH', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353676/NBEM_385_iqmtwl.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353676/NBEM_385_iqmtwl.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 5. 3853 FIV DA MARCONDES (MMAR 3853)
    v_details := jsonb_build_object(
        'registro', 'MMAR 3853',
        'raca', 'Nelore Padrão',
        'nascimento', '05/09/2023',
        'pai', 'M JACARANDA GENETICA ADITIVA',
        'mae', '3015 FIV DA MARCONDES',
        'iabcz', '32.53',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/3853 FIV DA MARCONDES.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = '3853 FIV DA MARCONDES') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353676/3853_FIV_DA_MARCONDES_oqtsl5.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353676/3853_FIV_DA_MARCONDES_oqtsl5.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = '3853 FIV DA MARCONDES';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '3853 FIV DA MARCONDES', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353676/3853_FIV_DA_MARCONDES_oqtsl5.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771353676/3853_FIV_DA_MARCONDES_oqtsl5.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

END $$;
