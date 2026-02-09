-- Insert Farroupilha Agropecuária Bulls
-- Owner: Farroupilha Agropecuária
-- Location: Paracatu - MG
-- Pricing: R$ 24.000,00 (30x R$ 800,00)

-- 1. Ensure Breeder Exists
INSERT INTO public.breeders (name)
VALUES ('Farroupilha Agropecuária')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Products
DO $$
DECLARE
    v_breeder text := 'Farroupilha Agropecuária';
    v_location text := 'Paracatu - MG';
    v_price numeric := 24000.00;
    v_installments text := '800,00'; -- 24000 / 30
    v_payment text := '30x';
    v_category text := 'Touro PO';
    v_classification text := 'touro';
    v_tag text := 'Em Estoque';
    v_details jsonb;
BEGIN

    -- 1. 3798 DA FARROUPILHA (URB 3798)
    v_details := jsonb_build_object(
        'registro', 'URB 3798',
        'raca', 'Nelore Padrão',
        'nascimento', '27/11/2023',
        'pai', '880 FIV DA FARROUPILHA',
        'mae', 'BHIRNA FIV DUTON',
        'iabcz', '16.56',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/URB3798.pdf'
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = '3798 DA FARROUPILHA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677815/URB3798_vmx03x.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677815/URB3798_vmx03x.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = '3798 DA FARROUPILHA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '3798 DA FARROUPILHA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677815/URB3798_vmx03x.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677815/URB3798_vmx03x.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 2. 3818 DA FARROUPILHA (URB 3818)
    v_details := jsonb_build_object(
        'registro', 'URB 3818',
        'raca', 'Nelore Padrão',
        'nascimento', '30/11/2023',
        'pai', 'A3875 MAT.',
        'mae', 'DOROTEIA FIV DA FARROUPILHA',
        'iabcz', '10.78',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/URB3818.pdf'
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = '3818 DA FARROUPILHA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677816/URB3818_w4q6yt.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677816/URB3818_w4q6yt.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = '3818 DA FARROUPILHA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '3818 DA FARROUPILHA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677816/URB3818_w4q6yt.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677816/URB3818_w4q6yt.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 3. 3837 FIV DA FARROUPILHA (URB 3837)
    v_details := jsonb_build_object(
        'registro', 'URB 3837',
        'raca', 'Nelore Padrão',
        'nascimento', '30/11/2023',
        'pai', 'DELEGADO FIV DA EAO',
        'mae', '1523 FIV DA FARROUPILHA',
        'iabcz', '32.79',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/URB3837.pdf'
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = '3837 FIV DA FARROUPILHA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677816/URB3837_wf6kdg.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677816/URB3837_wf6kdg.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = '3837 FIV DA FARROUPILHA';
    ELSE 
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '3837 FIV DA FARROUPILHA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677816/URB3837_wf6kdg.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677816/URB3837_wf6kdg.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 4. 3901 DA FARROUPILHA (URB 3901)
    v_details := jsonb_build_object(
        'registro', 'URB 3901',
        'raca', 'Nelore Padrão',
        'nascimento', '26/12/2023',
        'pai', 'LENDARIO FIV KATISPERA',
        'mae', '1116 FIV DA FARROUPILHA',
        'iabcz', '23.70',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/URB3901.pdf'
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = '3901 DA FARROUPILHA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677817/URB3901_tkkgx9.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677817/URB3901_tkkgx9.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = '3901 DA FARROUPILHA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '3901 DA FARROUPILHA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677817/URB3901_tkkgx9.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677817/URB3901_tkkgx9.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 5. 3935 DA FARROUPILHA (URB 3935)
    v_details := jsonb_build_object(
        'registro', 'URB 3935',
        'raca', 'Nelore Padrão',
        'nascimento', '05/01/2024',
        'pai', 'A3875 MAT.',
        'mae', '1259 DA FARROUPILHA',
        'iabcz', '25.09',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/URB3935.pdf'
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = '3935 DA FARROUPILHA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677820/URB3935_op59rn.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677820/URB3935_op59rn.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = '3935 DA FARROUPILHA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '3935 DA FARROUPILHA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677820/URB3935_op59rn.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677820/URB3935_op59rn.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 6. 3943 DA FARROUPILHA (URB 3943)
    v_details := jsonb_build_object(
        'registro', 'URB 3943',
        'raca', 'Nelore Padrão',
        'nascimento', '12/01/2024',
        'pai', 'B6777 DA S.NICE',
        'mae', '1048 FIV DA FARROUPILHA',
        'iabcz', '20.84',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/URB3943.pdf'
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = '3943 DA FARROUPILHA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677820/URB3943_mypnf3.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677820/URB3943_mypnf3.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = '3943 DA FARROUPILHA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '3943 DA FARROUPILHA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677820/URB3943_mypnf3.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677820/URB3943_mypnf3.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 7. 3946 DA FARROUPILHA (URB 3946)
    v_details := jsonb_build_object(
        'registro', 'URB 3946',
        'raca', 'Nelore Padrão',
        'nascimento', '12/01/2024',
        'pai', 'B6777 DA S.NICE',
        'mae', '1161 DA FARROUPILHA',
        'iabcz', '29.20',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/URB3946.pdf'
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = '3946 DA FARROUPILHA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677818/URB3946_zm6i8d.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677818/URB3946_zm6i8d.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = '3946 DA FARROUPILHA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '3946 DA FARROUPILHA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677818/URB3946_zm6i8d.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677818/URB3946_zm6i8d.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 8. 3958 DA FARROUPILHA (URB 3958)
    v_details := jsonb_build_object(
        'registro', 'URB 3958',
        'raca', 'Nelore Padrão',
        'nascimento', '20/01/2024',
        'pai', 'BRASIL DA BEABISA',
        'mae', '1137 FIV DA FARROUPILHA',
        'iabcz', '19.44',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/URB3958.pdf'
    );
    
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '3958 DA FARROUPILHA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677819/URB3958_a9balg.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677819/URB3958_a9balg.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = '3958 DA FARROUPILHA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '3958 DA FARROUPILHA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677819/URB3958_a9balg.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677819/URB3958_a9balg.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 9. 3962 DA FARROUPILHA (URB 3962)
    v_details := jsonb_build_object(
        'registro', 'URB 3962',
        'raca', 'Nelore Padrão',
        'nascimento', '30/01/2024',
        'pai', 'B6777 DA S.NICE',
        'mae', 'ESPESSURA FIV DA FARROUPILHA',
        'iabcz', '8.45',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/URB3962.pdf'
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = '3962 DA FARROUPILHA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677823/URB3962_sohuwl.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677823/URB3962_sohuwl.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = '3962 DA FARROUPILHA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '3962 DA FARROUPILHA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677823/URB3962_sohuwl.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677823/URB3962_sohuwl.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;


    -- 10. 4018 FIV DA FARROUPILHA (URB 4018)
    v_details := jsonb_build_object(
        'registro', 'URB 4018',
        'raca', 'Nelore Padrão',
        'nascimento', '01/12/2023',
        'pai', 'EMBATE DA AGRONOVA',
        'mae', 'GIBEIRA MAT.',
        'iabcz', '22.85',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/URB4018.pdf'
    );
    
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '4018 FIV DA FARROUPILHA') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677818/URB4018_ndwhwl.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677818/URB4018_ndwhwl.mp4'],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = '4018 FIV DA FARROUPILHA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '4018 FIV DA FARROUPILHA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677818/URB4018_ndwhwl.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770677818/URB4018_ndwhwl.mp4'],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

END $$;
