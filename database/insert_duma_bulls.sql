-- Register New Bulls for Owner Nelore DUMA (Feb 20, 2026)

-- 1. CURIO DUMA (DUMA 141)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'CURIO DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612130/DUMA141_ebm2oy.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612130/DUMA141_ebm2oy.mp4'],
            price = 12000.00,
            installments = NULL,
            forma_pagamento = 'A vista',
            category = 'Touro PO',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 141',
                'raca', 'Nelore Pintado',
                'nascimento', '28/02/2025',
                'pai', 'LAMBARI GC DA SL', 
                'mae', 'QUININA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA141.pdf',
                'comissao', '4%'
            )
        WHERE name = 'CURIO DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'CURIO DUMA',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612130/DUMA141_ebm2oy.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612130/DUMA141_ebm2oy.mp4'],
            12000.00,
            NULL,
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 141',
                'raca', 'Nelore Pintado',
                'nascimento', '28/02/2025',
                'pai', 'LAMBARI GC DA SL', 
                'mae', 'QUININA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA141.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 2. CURISCO DUMA (DUMA 139)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'CURISCO DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612127/DUMA139_im6dti.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612127/DUMA139_im6dti.mp4'],
            price = 12000.00,
            installments = NULL,
            forma_pagamento = 'A vista',
            category = 'Touro PO',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 139',
                'raca', 'Nelore Pintado',
                'nascimento', '26/02/2025',
                'pai', 'ZEKA SL NOVO', 
                'mae', 'VIVIANE SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA139.pdf',
                'comissao', '4%'
            )
        WHERE name = 'CURISCO DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'CURISCO DUMA',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612127/DUMA139_im6dti.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612127/DUMA139_im6dti.mp4'],
            12000.00,
            NULL,
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 139',
                'raca', 'Nelore Pintado',
                'nascimento', '26/02/2025',
                'pai', 'ZEKA SL NOVO', 
                'mae', 'VIVIANE SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA 139.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 3. BOB MARLEY DUMA (DUMA 111)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BOB MARLEY DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA111_n0hxay.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA111_n0hxay.mp4'],
            price = 12000.00,
            installments = NULL,
            forma_pagamento = 'A vista',
            category = 'Touro PO',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 111',
                'raca', 'Nelore Pintado',
                'nascimento', '14/11/2024',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'AZGEDA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA111.pdf',
                'comissao', '4%'
            )
        WHERE name = 'BOB MARLEY DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BOB MARLEY DUMA',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA111_n0hxay.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA111_n0hxay.mp4'],
            12000.00,
            NULL,
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 111',
                'raca', 'Nelore Pintado',
                'nascimento', '14/11/2024',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'AZGEDA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA 111.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 4. BOEMIA DUMA (DUMA 119)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BOEMIA DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA119_ydrha5.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA119_ydrha5.mp4'],
            price = 12000.00,
            installments = NULL,
            forma_pagamento = 'A vista',
            category = 'Touro PO',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 119',
                'raca', 'Nelore Pintado',
                'nascimento', '10/12/2024',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'AMEIXA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA119.pdf',
                'comissao', '4%'
            )
        WHERE name = 'BOEMIA DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BOEMIA DUMA',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA119_ydrha5.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA119_ydrha5.mp4'],
            12000.00,
            NULL,
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 119',
                'raca', 'Nelore Pintado',
                'nascimento', '10/12/2024',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'AMEIXA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA 119.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 5. CORISCO DUMA (DUMA 138)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'CORISCO DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA138_c82xjw.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA138_c82xjw.mp4'],
            price = 12000.00,
            installments = NULL,
            forma_pagamento = 'A vista',
            category = 'Touro PO',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 138',
                'raca', 'Nelore Pintado',
                'nascimento', '18/02/2025',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'VIDA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA138.pdf',
                'comissao', '4%'
            )
        WHERE name = 'CORISCO DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'CORISCO DUMA',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA138_c82xjw.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA138_c82xjw.mp4'],
            12000.00,
            NULL,
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 138',
                'raca', 'Nelore Pintado',
                'nascimento', '18/02/2025',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'VIDA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA138.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 6. CUTILLO DUMA (DUMA 127)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'CUTILLO DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA127_htvbxu.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA127_htvbxu.mp4'],
            price = 12000.00,
            installments = NULL,
            forma_pagamento = 'A vista',
            category = 'Touro PO',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 127',
                'raca', 'Nelore Pintado',
                'nascimento', '04/01/2025',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'QUIDIVA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA127.pdf',
                'comissao', '4%'
            )
        WHERE name = 'CUTILLO DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'CUTILLO DUMA',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA127_htvbxu.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612126/DUMA127_htvbxu.mp4'],
            12000.00,
            NULL,
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 127',
                'raca', 'Nelore Pintado',
                'nascimento', '04/01/2025',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'QUIDIVA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA127.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 7. BLACK WHITE DUMA (DUMA 93)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BLACK WHITE DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612125/DUMA93_bl9mzv.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612125/DUMA93_bl9mzv.mp4'],
            price = 12000.00,
            installments = NULL,
            forma_pagamento = 'A vista',
            category = 'Touro PO',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 93',
                'raca', 'Nelore Pintado',
                'nascimento', '04/10/2024',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'XARA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA93.pdf',
                'comissao', '4%'
            )
        WHERE name = 'BLACK WHITE DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BLACK WHITE DUMA',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612125/DUMA93_bl9mzv.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612125/DUMA93_bl9mzv.mp4'],
            12000.00,
            NULL,
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 93',
                'raca', 'Nelore Pintado',
                'nascimento', '04/10/2024',
                'pai', 'VITORIOSO SL NOVO', 
                'mae', 'XARA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA93.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 8. BERLOQUE DUMA (DUMA 112)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BERLOQUE DUMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612125/DUMA112_lerwm2.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612125/DUMA112_lerwm2.mp4'],
            price = 12000.00,
            installments = NULL,
            forma_pagamento = 'A vista',
            category = 'Touro PO',
            classificacao = 'touro',
            location = 'São Simão-GO',
            details = products.details || jsonb_build_object(
                'registro', 'DUMA 112',
                'raca', 'Nelore Pintado',
                'nascimento', '14/11/2024',
                'pai', 'ADHANKY DA CA', 
                'mae', 'VILHENA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA112.pdf',
                'comissao', '4%'
            )
        WHERE name = 'BERLOQUE DUMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BERLOQUE DUMA',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'São Simão-GO',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612125/DUMA112_lerwm2.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771612125/DUMA112_lerwm2.mp4'],
            12000.00,
            NULL,
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DUMA 112',
                'raca', 'Nelore Pintado',
                'nascimento', '14/11/2024',
                'pai', 'ADHANKY DA CA', 
                'mae', 'VILHENA SL NOVO', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore DUMA',
                'pdf', '/DUMA112.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;
