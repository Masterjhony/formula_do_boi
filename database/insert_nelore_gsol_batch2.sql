-- Insert Nelore GSOL Bulls Batch 2
-- Owner: Nelore GSOL
-- Location: Jordânia-MG
-- Pricing: R$ 18.000,00 (10x)

-- 1. Ensure Breeder Exists
INSERT INTO public.breeders (name)
VALUES ('Nelore GSOL')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Products
DO $$
DECLARE
    v_breeder text := 'Nelore GSOL';
    v_location text := 'Jordânia-MG';
    v_price numeric := 18000.00;
    v_installments text := '10x';
    v_payment text := '10x';
    v_category text := 'Touro';
    v_classification text := 'touro';
    v_tag text := 'Em Estoque';
    v_commission text := '4%';
    v_details jsonb;
BEGIN

    -- 1. GORDURA (GSOL 1689)
    v_details := jsonb_build_object(
        'registro', 'GSOL 1689',
        'raca', 'Nelore Padrão',
        'nascimento', '24/07/2024',
        'pai', 'MALAIO DA S.NICE',
        'mae', 'GUAJARATI',
        'iabcz', '22.51',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/GSOL 1689.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'GORDURA' AND details->>'registro' = 'GSOL 1689') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154471/GSOL_1689_tq2lpn.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154471/GSOL_1689_tq2lpn.mp4']::text[],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'GORDURA' AND details->>'registro' = 'GSOL 1689';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'GORDURA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154471/GSOL_1689_tq2lpn.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154471/GSOL_1689_tq2lpn.mp4']::text[],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

    -- 2. GUARANI (GSOL 1735)
    v_details := jsonb_build_object(
        'registro', 'GSOL 1735',
        'raca', 'Nelore Padrão',
        'nascimento', '12/08/2024',
        'pai', 'MALAIO DA S.NICE',
        'mae', 'AMEIXA',
        'iabcz', '31.53',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/GSOL 1735.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'GUARANI' AND details->>'registro' = 'GSOL 1735') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154480/GSOL1735_t2mtlw.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154480/GSOL1735_t2mtlw.mp4']::text[],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'GUARANI' AND details->>'registro' = 'GSOL 1735';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'GUARANI', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154480/GSOL1735_t2mtlw.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154480/GSOL1735_t2mtlw.mp4']::text[],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

    -- 3. CELTA12 (GSOL 1749)
    v_details := jsonb_build_object(
        'registro', 'GSOL 1749',
        'raca', 'Nelore Padrão',
        'nascimento', '03/09/2024',
        'pai', 'DELEGADO FIV DA EAO',
        'mae', 'CINDERELA',
        'iabcz', '21.69',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/GSOL 1749.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'CELTA12' AND details->>'registro' = 'GSOL 1749') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154489/GSOL1749_wbe1nx.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154489/GSOL1749_wbe1nx.mp4']::text[],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'CELTA12' AND details->>'registro' = 'GSOL 1749';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'CELTA12', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154489/GSOL1749_wbe1nx.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154489/GSOL1749_wbe1nx.mp4']::text[],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

    -- 4. GORDURA (GSOL 1721)
    v_details := jsonb_build_object(
        'registro', 'GSOL 1721',
        'raca', 'Nelore Padrão',
        'nascimento', '03/08/2024',
        'pai', 'DELEGADO FIV DA EAO',
        'mae', 'BIA',
        'iabcz', '22.75',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/GSOL 1721.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'GORDURA' AND details->>'registro' = 'GSOL 1721') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154486/GSOL1721_vhzm8s.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154486/GSOL1721_vhzm8s.mp4']::text[],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'GORDURA' AND details->>'registro' = 'GSOL 1721';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'GORDURA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154486/GSOL1721_vhzm8s.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154486/GSOL1721_vhzm8s.mp4']::text[],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

    -- 5. PORCAO (GSOL 1709)
    v_details := jsonb_build_object(
        'registro', 'GSOL 1709',
        'raca', 'Nelore Padrão',
        'nascimento', '28/07/2024',
        'pai', 'DELEGADO FIV DA EAO',
        'mae', 'ABCZ',
        'iabcz', '22.12',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/GSOL 1709.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'PORCAO' AND details->>'registro' = 'GSOL 1709') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154472/GSOL1709_cebtaw.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154472/GSOL1709_cebtaw.mp4']::text[],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'PORCAO' AND details->>'registro' = 'GSOL 1709';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'PORCAO', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154472/GSOL1709_cebtaw.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154472/GSOL1709_cebtaw.mp4']::text[],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

    -- 6. VASCO (GSOL 1753)
    v_details := jsonb_build_object(
        'registro', 'GSOL 1753',
        'raca', 'Nelore Padrão',
        'nascimento', '03/09/2024',
        'pai', 'MALAIO DA S.NICE',
        'mae', 'BAKIANA',
        'iabcz', '18.59',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/GSOL 1753.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'VASCO' AND details->>'registro' = 'GSOL 1753') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154480/GSOL1753_z6sgxa.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154480/GSOL1753_z6sgxa.mp4']::text[],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'VASCO' AND details->>'registro' = 'GSOL 1753';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'VASCO', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154480/GSOL1753_z6sgxa.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154480/GSOL1753_z6sgxa.mp4']::text[],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

    -- 7. FERROVIARIO (GSOL 1737)
    v_details := jsonb_build_object(
        'registro', 'GSOL 1737',
        'raca', 'Nelore Padrão',
        'nascimento', '12/08/2024',
        'pai', 'MALAIO DA S.NICE',
        'mae', 'ISA',
        'iabcz', '22.44',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/GSOL 1737.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'FERROVIARIO' AND details->>'registro' = 'GSOL 1737') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154472/GSOL1737_s6dbhy.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154472/GSOL1737_s6dbhy.mp4']::text[],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'FERROVIARIO' AND details->>'registro' = 'GSOL 1737';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'FERROVIARIO', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154472/GSOL1737_s6dbhy.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154472/GSOL1737_s6dbhy.mp4']::text[],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

    -- 8. JUVENTUS (GSOL 1751)
    v_details := jsonb_build_object(
        'registro', 'GSOL 1751',
        'raca', 'Nelore Padrão',
        'nascimento', '03/09/2024',
        'pai', 'DELEGADO FIV DA EAO',
        'mae', 'MALARINA DA AC AGRO',
        'iabcz', '20.27',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/GSOL 1751.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'JUVENTUS' AND details->>'registro' = 'GSOL 1751') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154484/GSOL1751_sjuhbl.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154484/GSOL1751_sjuhbl.mp4']::text[],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'JUVENTUS' AND details->>'registro' = 'GSOL 1751';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'JUVENTUS', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154484/GSOL1751_sjuhbl.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154484/GSOL1751_sjuhbl.mp4']::text[],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

    -- 9. MARATA (GSOL 1679)
    v_details := jsonb_build_object(
        'registro', 'GSOL 1679',
        'raca', 'Nelore Padrão',
        'nascimento', '24/07/2024',
        'pai', 'MALAIO DA S.NICE',
        'mae', 'PAMPA',
        'iabcz', '21.88',
        'mgte', '',
        'status', 'Touro',
        'breeder', v_breeder,
        'pdf', '/GSOL 1679.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'MARATA' AND details->>'registro' = 'GSOL 1679') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154484/GSOL1679_ewhfhe.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154484/GSOL1679_ewhfhe.mp4']::text[],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'MARATA' AND details->>'registro' = 'GSOL 1679';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'MARATA', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154484/GSOL1679_ewhfhe.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154484/GSOL1679_ewhfhe.mp4']::text[],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

    -- 10. TUPER (GSOL 1628)
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
        'pdf', '/GSOL 1628.pdf',
        'comissao', v_commission
    );

    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'TUPER' AND details->>'registro' = 'GSOL 1628') THEN
        UPDATE public.products SET
            price = v_price,
            installments = v_installments,
            forma_pagamento = v_payment,
            location = v_location,
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154464/GSOL1628_qby7iy.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154464/GSOL1628_qby7iy.mp4']::text[],
            tag = v_tag,
            details = products.details || v_details
        WHERE name = 'TUPER' AND details->>'registro' = 'GSOL 1628';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'TUPER', v_category, v_classification, 'venda_direta', 'retira_fazenda', v_payment, v_location,
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154464/GSOL1628_qby7iy.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1773154464/GSOL1628_qby7iy.mp4']::text[],
            v_price, v_installments, v_tag, v_details
        );
    END IF;

END $$;
