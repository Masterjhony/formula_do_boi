-- Insert New Animals Nelore Visual

DO $$
BEGIN
    -- 1. NEVADA FIV VISUAL (RGD: VIS 4864)
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'NEVADA FIV VISUAL') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974408/VIS4864_ke07xm.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974408/VIS4864_ke07xm.mp4'],
            price = 20000.00,
            installments = 'À vista',
            forma_pagamento = 'a_vista',
            location = 'Esmeraldas - MG',
            iabcz = '16.27',
            details = jsonb_build_object(
                'registro', 'VIS 4864',
                'raca', 'Nelore Padrão',
                'nascimento', '04/08/2023',
                'pai', 'ESPARTANO MAT',
                'mae', 'ESQUADRIA SINO',
                'iabcz', '16.27',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/VIS4864.pdf'
            )
        WHERE name = 'NEVADA FIV VISUAL';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, iabcz, details
        ) VALUES (
            'NEVADA FIV VISUAL',
            'Matriz',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Esmeraldas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974408/VIS4864_ke07xm.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974408/VIS4864_ke07xm.mp4'],
            20000.00,
            'À vista',
            'Em Estoque',
            '16.27',
            jsonb_build_object(
                'registro', 'VIS 4864',
                'raca', 'Nelore Padrão',
                'nascimento', '04/08/2023',
                'pai', 'ESPARTANO MAT',
                'mae', 'ESQUADRIA SINO',
                'iabcz', '16.27',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/VIS4864.pdf'
            )
        );
    END IF;

    -- 2. MARILIA FIV VISUAL (RGD: VIS 4559)
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'MARILIA FIV VISUAL') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974403/VIS4559_uhsjad.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974403/VIS4559_uhsjad.mp4'],
            price = 20000.00,
            installments = 'À vista',
            forma_pagamento = 'a_vista',
            location = 'Esmeraldas - MG',
            iabcz = '21.47',
            details = jsonb_build_object(
                'registro', 'VIS 4559',
                'raca', 'Nelore Padrão',
                'nascimento', '03/11/2023',
                'pai', 'DIPLOMATA DA AGRONOVA',
                'mae', 'CHER MAT.',
                'iabcz', '21.47',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/VIS4559.pdf'
            )
        WHERE name = 'MARILIA FIV VISUAL';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, iabcz, details
        ) VALUES (
            'MARILIA FIV VISUAL',
            'Matriz',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Esmeraldas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974403/VIS4559_uhsjad.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974403/VIS4559_uhsjad.mp4'],
            20000.00,
            'À vista',
            'Em Estoque',
            '21.47',
            jsonb_build_object(
                'registro', 'VIS 4559',
                'raca', 'Nelore Padrão',
                'nascimento', '03/11/2023',
                'pai', 'DIPLOMATA DA AGRONOVA',
                'mae', 'CHER MAT.',
                'iabcz', '21.47',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/VIS4559.pdf'
            )
        );
    END IF;

    -- 3. CIGANO (RGD: RDM463)
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'CIGANO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974399/RDM463_wdmriv.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974399/RDM463_wdmriv.mp4'],
            price = 25000.00,
            installments = 'À vista',
            forma_pagamento = 'a_vista',
            location = 'Esmeraldas - MG',
            iabcz = '',
            details = jsonb_build_object(
                'registro', 'RDM463',
                'raca', 'Nelore Padrão',
                'nascimento', '20/10/1998',
                'pai', 'HAHIMYAT DA GUANAC',
                'mae', 'ABOBODA 71',
                'iabcz', '',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/RDM463.pdf'
            )
        WHERE name = 'CIGANO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, iabcz, details
        ) VALUES (
            'CIGANO',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Esmeraldas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974399/RDM463_wdmriv.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974399/RDM463_wdmriv.mp4'],
            25000.00,
            'À vista',
            'Em Estoque',
            '',
            jsonb_build_object(
                'registro', 'RDM463',
                'raca', 'Nelore Padrão',
                'nascimento', '20/10/1998',
                'pai', 'HAHIMYAT DA GUANAC',
                'mae', 'ABOBODA 71',
                'iabcz', '',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/RDM463.pdf'
            )
        );
    END IF;

    -- 4. MANSAO FIV VISUAL (RGD: VIS 4591)
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'MANSAO FIV VISUAL') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974405/VIS4591_m31fru.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974405/VIS4591_m31fru.mp4'],
            price = 20000.00,
            installments = 'À vista',
            forma_pagamento = 'a_vista',
            location = 'Esmeraldas - MG',
            iabcz = '22.65',
            details = jsonb_build_object(
                'registro', 'VIS 4591',
                'raca', 'Nelore Padrão',
                'nascimento', '23/12/2023',
                'pai', 'JUSTIN FIV VISUAL',
                'mae', 'BISA MAT',
                'iabcz', '22.65',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/VIS4591.pdf'
            )
        WHERE name = 'MANSAO FIV VISUAL';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, iabcz, details
        ) VALUES (
            'MANSAO FIV VISUAL',
            'Matriz',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Esmeraldas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974405/VIS4591_m31fru.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974405/VIS4591_m31fru.mp4'],
            20000.00,
            'À vista',
            'Em Estoque',
            '22.65',
            jsonb_build_object(
                'registro', 'VIS 4591',
                'raca', 'Nelore Padrão',
                'nascimento', '23/12/2023',
                'pai', 'JUSTIN FIV VISUAL',
                'mae', 'BISA MAT',
                'iabcz', '22.65',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/VIS4591.pdf'
            )
        );
    END IF;

    -- 5. MATILDA FIV VISUAL (RGD: VIS 4342)
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'MATILDA FIV VISUAL') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974399/VIS4342_wgmswx.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974399/VIS4342_wgmswx.mp4'],
            price = 20000.00,
            installments = 'À vista',
            forma_pagamento = 'a_vista',
            location = 'Esmeraldas - MG',
            iabcz = '20.01',
            details = jsonb_build_object(
                'registro', 'VIS 4342',
                'raca', 'Nelore Padrão',
                'nascimento', '10/11/2022',
                'pai', 'URI DE NAVIRAI',
                'mae', 'GERBY FIV VISUAL',
                'iabcz', '20.01',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/VIS4342.pdf'
            )
        WHERE name = 'MATILDA FIV VISUAL';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, iabcz, details
        ) VALUES (
            'MATILDA FIV VISUAL',
            'Matriz',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Esmeraldas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974399/VIS4342_wgmswx.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974399/VIS4342_wgmswx.mp4'],
            20000.00,
            'À vista',
            'Em Estoque',
            '20.01',
            jsonb_build_object(
                'registro', 'VIS 4342',
                'raca', 'Nelore Padrão',
                'nascimento', '10/11/2022',
                'pai', 'URI DE NAVIRAI',
                'mae', 'GERBY FIV VISUAL',
                'iabcz', '20.01',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/VIS4342.pdf'
            )
        );
    END IF;

    -- 6. MAJESTOSA VISUAL (RGD: VIS 4200)
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'MAJESTOSA VISUAL') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974410/VIS4200_bswapj.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974410/VIS4200_bswapj.mp4'],
            price = 20000.00,
            installments = 'À vista',
            forma_pagamento = 'a_vista',
            location = 'Esmeraldas - MG',
            iabcz = '22.92',
            details = jsonb_build_object(
                'registro', 'VIS 4200',
                'raca', 'Nelore Padrão',
                'nascimento', '01/07/2022',
                'pai', 'DODGE MAT',
                'mae', 'A2585 MAT.',
                'iabcz', '22.92',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/VIS4200.pdf'
            )
        WHERE name = 'MAJESTOSA VISUAL';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, iabcz, details
        ) VALUES (
            'MAJESTOSA VISUAL',
            'Matriz',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Esmeraldas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974410/VIS4200_bswapj.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974410/VIS4200_bswapj.mp4'],
            20000.00,
            'À vista',
            'Em Estoque',
            '22.92',
            jsonb_build_object(
                'registro', 'VIS 4200',
                'raca', 'Nelore Padrão',
                'nascimento', '01/07/2022',
                'pai', 'DODGE MAT',
                'mae', 'A2585 MAT.',
                'iabcz', '22.92',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/VIS4200.pdf'
            )
        );
    END IF;

    -- 7. LINDEZA FIV VISUAL (RGD: VIS 3975)
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'LINDEZA FIV VISUAL') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974393/VIS3975_ns927c.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974393/VIS3975_ns927c.mp4'],
            price = 25000.00,
            installments = 'À vista',
            forma_pagamento = 'a_vista',
            location = 'Esmeraldas - MG',
            iabcz = '25.13',
            details = jsonb_build_object(
                'registro', 'VIS 3975',
                'raca', 'Nelore Padrão',
                'nascimento', '18/08/2021',
                'pai', 'IMPERADOR CAMPARINO',
                'mae', 'GAETA FIV VISUAL',
                'iabcz', '25.13',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/VIS3975.pdf'
            )
        WHERE name = 'LINDEZA FIV VISUAL';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, iabcz, details
        ) VALUES (
            'LINDEZA FIV VISUAL',
            'Matriz',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Esmeraldas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974393/VIS3975_ns927c.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771974393/VIS3975_ns927c.mp4'],
            25000.00,
            'À vista',
            'Em Estoque',
            '25.13',
            jsonb_build_object(
                'registro', 'VIS 3975',
                'raca', 'Nelore Padrão',
                'nascimento', '18/08/2021',
                'pai', 'IMPERADOR CAMPARINO',
                'mae', 'GAETA FIV VISUAL',
                'iabcz', '25.13',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Disponível',
                'breeder', 'Nelore Visual',
                'proprietario', 'Nelore Visual',
                'comissao', '4%',
                'pdf', '/VIS3975.pdf'
            )
        );
    END IF;

END $$;
