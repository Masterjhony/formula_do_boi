-- Register 8 New Bulls for Owner Nelore DUMA (Feb 23, 2026)

-- 1. BRINCO DUMA (DUMA 53)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BRINCO DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612123/DUMA53_elpykz.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612123/DUMA53_elpykz.mp4'],
            price = 12000.00,
            installments = 'À Vista',
            forma_pagamento = 'À Vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 53',
                'raca', 'Nelore Pintado',
                'nascimento', '13/02/2024',
                'pai', 'ZEKA SL NOVO', 
                'mae', 'ZAGUARIA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA 53.pdf',
                'comissao', '4%'
            )
        WHERE name = 'BRINCO DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BRINCO DUMA',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'À Vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612123/DUMA53_elpykz.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612123/DUMA53_elpykz.mp4'],
            12000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 53',
                'raca', 'Nelore Pintado',
                'nascimento', '13/02/2024',
                'pai', 'ZEKA SL NOVO', 
                'mae', 'ZAGUARIA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA 53.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 2. BRIOSO DUMA (DUMA 57)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BRIOSO DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612123/DUMA57_oiixw1.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612123/DUMA57_oiixw1.mp4'],
            price = 12000.00,
            installments = 'À Vista',
            forma_pagamento = 'À Vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 57',
                'raca', 'Nelore Pintado',
                'nascimento', '08/06/2024',
                'pai', 'LEXO MATA VELHA', 
                'mae', 'YACHA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA57.pdf',
                'comissao', '4%'
            )
        WHERE name = 'BRIOSO DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BRIOSO DUMA',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'À Vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612123/DUMA57_oiixw1.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612123/DUMA57_oiixw1.mp4'],
            12000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 57',
                'raca', 'Nelore Pintado',
                'nascimento', '08/06/2024',
                'pai', 'LEXO MATA VELHA', 
                'mae', 'YACHA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA57.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 3. BULLDOG DUMA (DUMA 61)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BULLDOG DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA61_z7m9a8.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA61_z7m9a8.mp4'],
            price = 12000.00,
            installments = 'À Vista',
            forma_pagamento = 'À Vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 61',
                'raca', 'Nelore Pintado',
                'nascimento', '12/06/2024',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'ZELIAH SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA61.pdf',
                'comissao', '4%'
            )
        WHERE name = 'BULLDOG DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BULLDOG DUMA',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'À Vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA61_z7m9a8.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA61_z7m9a8.mp4'],
            12000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 61',
                'raca', 'Nelore Pintado',
                'nascimento', '12/06/2024',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'ZELIAH SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA61.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 4. BELGRADO DUMA (DUMA 69)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BELGRADO DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA69_zm5zmw.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA69_zm5zmw.mp4'],
            price = 12000.00,
            installments = 'À Vista',
            forma_pagamento = 'À Vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 69',
                'raca', 'Nelore Pintado',
                'nascimento', '11/08/2024',
                'pai', 'B6777 DA S.NICE', 
                'mae', 'B6996 DA JANDAIA', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA69.pdf',
                'comissao', '4%'
            )
        WHERE name = 'BELGRADO DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BELGRADO DUMA',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'À Vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA69_zm5zmw.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA69_zm5zmw.mp4'],
            12000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 69',
                'raca', 'Nelore Pintado',
                'nascimento', '11/08/2024',
                'pai', 'B6777 DA S.NICE', 
                'mae', 'B6996 DA JANDAIA', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA69.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 5. BATMAN DUMA (DUMA 74)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BATMAN DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA74_m2eebs.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA74_m2eebs.mp4'],
            price = 12000.00,
            installments = 'À Vista',
            forma_pagamento = 'À Vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 74',
                'raca', 'Nelore Pintado',
                'nascimento', '22/08/2024',
                'pai', 'LIBANO DA JANDAIA', 
                'mae', 'B6930 DA JANDAIA', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA74.pdf',
                'comissao', '4%'
            )
        WHERE name = 'BATMAN DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BATMAN DUMA',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'À Vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA74_m2eebs.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA74_m2eebs.mp4'],
            12000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 74',
                'raca', 'Nelore Pintado',
                'nascimento', '22/08/2024',
                'pai', 'LIBANO DA JANDAIA', 
                'mae', 'B6930 DA JANDAIA', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA74.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 6. BROWM DUMA (DUMA 77)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BROWM DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA77_nymeb9.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA77_nymeb9.mp4'],
            price = 12000.00,
            installments = 'À Vista',
            forma_pagamento = 'À Vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 77',
                'raca', 'Nelore Pintado',
                'nascimento', '11/09/2024',
                'pai', 'ZEKA SL NOVO', 
                'mae', 'AGLAIA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA77.pdf',
                'comissao', '4%'
            )
        WHERE name = 'BROWM DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BROWM DUMA',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'À Vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA77_nymeb9.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA77_nymeb9.mp4'],
            12000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 77',
                'raca', 'Nelore Pintado',
                'nascimento', '11/09/2024',
                'pai', 'ZEKA SL NOVO', 
                'mae', 'AGLAIA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA77.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 7. BRAZUKA DUMA (DUMA 88)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BRAZUKA DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA88_ubxyxn.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA88_ubxyxn.mp4'],
            price = 12000.00,
            installments = 'À Vista',
            forma_pagamento = 'À Vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 88',
                'raca', 'Nelore Pintado',
                'nascimento', '24/09/2024',
                'pai', 'ZEKA SL NOVO', 
                'mae', 'BELEZURA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA88.pdf',
                'comissao', '4%'
            )
        WHERE name = 'BRAZUKA DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BRAZUKA DUMA',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'À Vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA88_ubxyxn.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612124/DUMA88_ubxyxn.mp4'],
            12000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 88',
                'raca', 'Nelore Pintado',
                'nascimento', '24/09/2024',
                'pai', 'ZEKA SL NOVO', 
                'mae', 'BELEZURA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA88.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 8. BEAUTY DUMA (DUMA 108)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BEAUTY DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612125/DUMA108_og5jtb.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612125/DUMA108_og5jtb.mp4'],
            price = 12000.00,
            installments = 'À Vista',
            forma_pagamento = 'À Vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 108',
                'raca', 'Nelore Pintado',
                'nascimento', '13/11/2024',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'AMIGA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA108.pdf',
                'comissao', '4%'
            )
        WHERE name = 'BEAUTY DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BEAUTY DUMA',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'À Vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612125/DUMA108_og5jtb.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612125/DUMA108_og5jtb.mp4'],
            12000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 108',
                'raca', 'Nelore Pintado',
                'nascimento', '13/11/2024',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'AMIGA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA108.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;
