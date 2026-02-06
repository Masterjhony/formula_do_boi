-- Insert Luden Bulls (Feb 6, 2026)
-- Owner: LUDEN
-- Location: Prata-MG
-- Payment: À Vista (R$ 15.000,00)

-- 1. LWD 6 (RGD: LWD6)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'LWD 6') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770308701/LWD6_oabs1a.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770308701/LWD6_oabs1a.mp4'],
            price = 15000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Prata-MG',
            details = jsonb_build_object(
                'registro', 'LWD6',
                'raca', 'Nelore Padrão',
                'nascimento', '08/12/2023',
                'pai', 'QUARRIE FIV COL',
                'mae', '1',
                'iabcz', '7.32',
                'mgte', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/LWD6.pdf'
            )
        WHERE name = 'LWD 6';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'LWD 6',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Prata-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770308701/LWD6_oabs1a.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770308701/LWD6_oabs1a.mp4'],
            15000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'LWD6',
                'raca', 'Nelore Padrão',
                'nascimento', '08/12/2023',
                'pai', 'QUARRIE FIV COL',
                'mae', '1',
                'iabcz', '7.32',
                'mgte', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/LWD6.pdf'
            )
        );
    END IF;
END $$;

-- 2. LWD 3 (RGD: LWD 3)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'LWD 3') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770308965/LWD3_etffjk.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770308965/LWD3_etffjk.mp4'],
            price = 15000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Prata-MG',
            details = jsonb_build_object(
                'registro', 'LWD 3',
                'raca', 'Nelore Padrão',
                'nascimento', '05/12/2023',
                'pai', 'QUARRIE FIV COL',
                'mae', '6',
                'iabcz', '5.68',
                'mgte', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/LWD3.pdf'
            )
        WHERE name = 'LWD 3';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'LWD 3',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Prata-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770308965/LWD3_etffjk.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770308965/LWD3_etffjk.mp4'],
            15000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'LWD 3',
                'raca', 'Nelore Padrão',
                'nascimento', '05/12/2023',
                'pai', 'QUARRIE FIV COL',
                'mae', '6',
                'iabcz', '5.68',
                'mgte', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/LWD3.pdf'
            )
        );
    END IF;
END $$;

-- 3. J3875 SINO (RGD: SINO 3875)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'J3875 SINO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392337/SINO3875_wduuxk.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392337/SINO3875_wduuxk.mp4'],
            price = 15000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
             location = 'Prata-MG',
            details = jsonb_build_object(
                'registro', 'SINO 3875',
                'raca', 'Nelore Padrão',
                'nascimento', '01/10/2023',
                'pai', 'HANU SINO',
                'mae', 'H2885 SINO',
                'iabcz', '22.62',
                'mgte', '',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/SINO3875.pdf'
            )
        WHERE name = 'J3875 SINO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'J3875 SINO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Prata-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392337/SINO3875_wduuxk.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392337/SINO3875_wduuxk.mp4'],
            15000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SINO 3875',
                'raca', 'Nelore Padrão',
                'nascimento', '01/10/2023',
                'pai', 'HANU SINO',
                'mae', 'H2885 SINO',
                'iabcz', '22.62',
                'mgte', '',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/SINO3875.pdf'
            )
        );
    END IF;
END $$;

-- 4. J3859 SINO (RGD: SINO 3859)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'J3859 SINO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392329/SINO3859_nfnyup.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392329/SINO3859_nfnyup.mp4'],
            price = 15000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
             location = 'Prata-MG',
            details = jsonb_build_object(
                'registro', 'SINO 3859',
                'raca', 'Nelore Padrão',
                'nascimento', '29/09/2023',
                'pai', 'HANU SINO',
                'mae', 'H2885 SINO',
                'iabcz', '23.43',
                'mgte', '',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/SINO3859.pdf'
            )
        WHERE name = 'J3859 SINO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'J3859 SINO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Prata-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392329/SINO3859_nfnyup.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392329/SINO3859_nfnyup.mp4'],
            15000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SINO 3859',
                'raca', 'Nelore Padrão',
                'nascimento', '29/09/2023',
                'pai', 'HANU SINO',
                'mae', 'H2885 SINO',
                'iabcz', '23.43',
                'mgte', '',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/SINO3859.pdf'
            )
        );
    END IF;
END $$;

-- 5. J3869 SINO (RGD: SINO 3869)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'J3869 SINO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392339/SINO3869_fivvcz.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392339/SINO3869_fivvcz.mp4'],
            price = 15000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
             location = 'Prata-MG',
            details = jsonb_build_object(
                'registro', 'SINO 3869',
                'raca', 'Nelore Padrão',
                'nascimento', '30/09/2023',
                'pai', 'EXPRESSO MAT',
                'mae', 'DANCE SINO',
                'iabcz', '19.95',
                'mgte', '',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/SINO3869.pdf'
            )
        WHERE name = 'J3869 SINO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'J3869 SINO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Prata-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392339/SINO3869_fivvcz.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392339/SINO3869_fivvcz.mp4'],
            15000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SINO 3869',
                'raca', 'Nelore Padrão',
                'nascimento', '30/09/2023',
                'pai', 'EXPRESSO MAT',
                'mae', 'DANCE SINO',
                'iabcz', '19.95',
                'mgte', '',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/SINO3869.pdf'
            )
        );
    END IF;
END $$;

-- 6. J3933 SINO (RGD: SINO 3933)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'J3933 SINO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392331/SINO3933_arknvx.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392331/SINO3933_arknvx.mp4'],
            price = 15000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
             location = 'Prata-MG',
            details = jsonb_build_object(
                'registro', 'SINO 3933',
                'raca', 'Nelore Padrão',
                'nascimento', '27/10/2023',
                'pai', 'EL ZORRERO SINO',
                'mae', 'EQUIPE MAT',
                'iabcz', '18.71',
                'mgte', '',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/SINO3933.pdf'
            )
        WHERE name = 'J3933 SINO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'J3933 SINO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Prata-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392331/SINO3933_arknvx.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392331/SINO3933_arknvx.mp4'],
            15000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SINO 3933',
                'raca', 'Nelore Padrão',
                'nascimento', '27/10/2023',
                'pai', 'EL ZORRERO SINO',
                'mae', 'EQUIPE MAT',
                'iabcz', '18.71',
                'mgte', '',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/SINO3933.pdf'
            )
        );
    END IF;
END $$;

-- 7. J4055 SINO (RGD: SINO 4055)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'J4055 SINO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392331/SINO4055_ds9rfy.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392331/SINO4055_ds9rfy.mp4'],
            price = 15000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
             location = 'Prata-MG',
            details = jsonb_build_object(
                'registro', 'SINO 4055',
                'raca', 'Nelore Padrão',
                'nascimento', '20/12/2023',
                'pai', 'CARANDAH MAT',
                'mae', 'DRIKA SINO',
                'iabcz', '23.5',
                'mgte', '',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/SINO4055.pdf'
            )
        WHERE name = 'J4055 SINO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'J4055 SINO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Prata-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392331/SINO4055_ds9rfy.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770392331/SINO4055_ds9rfy.mp4'],
            15000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SINO 4055',
                'raca', 'Nelore Padrão',
                'nascimento', '20/12/2023',
                'pai', 'CARANDAH MAT',
                'mae', 'DRIKA SINO',
                'iabcz', '23.5',
                'mgte', '',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'LUDEN',
                'pdf', '/SINO4055.pdf'
            )
        );
    END IF;
END $$;
