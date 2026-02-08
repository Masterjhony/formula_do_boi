-- Insert Owner: FEGO Agropecuária
INSERT INTO public.breeders (name)
SELECT 'FEGO Agropecuária'
WHERE NOT EXISTS (
    SELECT 1 FROM public.breeders WHERE name = 'FEGO Agropecuária'
);

-- 1. 8922 DA CABACAL (BAM 8922)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '8922 DA CABACAL') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578558/BAM8922_hhovhw.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578558/BAM8922_hhovhw.mp4'],
             price = 9500.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Patos de Minas - MG',
            details = jsonb_build_object(
                'registro', 'BAM 8922',
                'raca', 'Nelore Padrão',
                'nascimento', '04/12/2024',
                'pai', 'ESTORIL MAT.',
                'mae', '7571 DA CABACAL',
                'iabcz', '19.85',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/BAM8922.pdf'
            )
        WHERE name = '8922 DA CABACAL';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '8922 DA CABACAL',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Patos de Minas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578558/BAM8922_hhovhw.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578558/BAM8922_hhovhw.mp4'],
            9500.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'BAM 8922',
                'raca', 'Nelore Padrão',
                'nascimento', '04/12/2024',
                'pai', 'ESTORIL MAT.',
                'mae', '7571 DA CABACAL',
                'iabcz', '19.85',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/BAM8922.pdf'
            )
        );
    END IF;
END $$;

-- 2. DIESEL FIV DA FEGO (FEGO 39)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'DIESEL FIV DA FEGO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578559/FEGO39_qpkumg.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578559/FEGO39_qpkumg.mp4'],
             price = 9500.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Patos de Minas - MG',
            details = jsonb_build_object(
                'registro', 'FEGO 39',
                'raca', 'Nelore Padrão',
                'nascimento', '10/08/2024',
                'pai', 'LANDAU DA DI GENIO',
                'mae', 'MACKENZIEH FIV VRI VILA REAL',
                'iabcz', '7.97',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO39.pdf'
            )
        WHERE name = 'DIESEL FIV DA FEGO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'DIESEL FIV DA FEGO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Patos de Minas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578559/FEGO39_qpkumg.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578559/FEGO39_qpkumg.mp4'],
            9500.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'FEGO 39',
                'raca', 'Nelore Padrão',
                'nascimento', '10/08/2024',
                'pai', 'LANDAU DA DI GENIO',
                'mae', 'MACKENZIEH FIV VRI VILA REAL',
                'iabcz', '7.97',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO39.pdf'
            )
        );
    END IF;
END $$;

-- 3. DALLAS FIV DA FEGO (FEGO 51)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'DALLAS FIV DA FEGO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578561/FEGO51_jiejjr.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578561/FEGO51_jiejjr.mp4'],
             price = 9500.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Patos de Minas - MG',
            details = jsonb_build_object(
                'registro', 'FEGO 51',
                'raca', 'Nelore Padrão',
                'nascimento', '26/08/2024',
                'pai', 'FORD FIV CAMPARINO',
                'mae', '7571 DA CABACAL',
                'iabcz', '22.04',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO51.pdf'
            )
        WHERE name = 'DALLAS FIV DA FEGO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'DALLAS FIV DA FEGO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Patos de Minas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578561/FEGO51_jiejjr.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578561/FEGO51_jiejjr.mp4'],
            9500.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'FEGO 51',
                'raca', 'Nelore Padrão',
                'nascimento', '26/08/2024',
                'pai', 'FORD FIV CAMPARINO',
                'mae', '7571 DA CABACAL',
                'iabcz', '22.04',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO51.pdf'
            )
        );
    END IF;
END $$;

-- 4. DINAMITE FIV DA FEGO (FEGO 55)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'DINAMITE FIV DA FEGO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578559/FEGO55_e13d7h.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578559/FEGO55_e13d7h.mp4'],
             price = 9500.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Patos de Minas - MG',
            details = jsonb_build_object(
                'registro', 'FEGO 55',
                'raca', 'Nelore Padrão',
                'nascimento', '30/08/2024',
                'pai', 'EMBATE DA AGRONOVA',
                'mae', 'HERA DA FEGO',
                'iabcz', '22.48',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO55.pdf'
            )
        WHERE name = 'DINAMITE FIV DA FEGO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'DINAMITE FIV DA FEGO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Patos de Minas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578559/FEGO55_e13d7h.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578559/FEGO55_e13d7h.mp4'],
            9500.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'FEGO 55',
                'raca', 'Nelore Padrão',
                'nascimento', '30/08/2024',
                'pai', 'EMBATE DA AGRONOVA',
                'mae', 'HERA DA FEGO',
                'iabcz', '22.48',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO55.pdf'
            )
        );
    END IF;
END $$;

-- 5. DRAKE DA FEGO (FEGO 69)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'DRAKE DA FEGO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578562/FEGO69_fm5uqb.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578562/FEGO69_fm5uqb.mp4'],
             price = 9500.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Patos de Minas - MG',
            details = jsonb_build_object(
                'registro', 'FEGO 69',
                'raca', 'Nelore Padrão',
                'nascimento', '20/11/2024',
                'pai', '1153F DA ARZ',
                'mae', '8417 TE MAFRA',
                'iabcz', '25.51',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO69.pdf'
            )
        WHERE name = 'DRAKE DA FEGO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'DRAKE DA FEGO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Patos de Minas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578562/FEGO69_fm5uqb.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578562/FEGO69_fm5uqb.mp4'],
            9500.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'FEGO 69',
                'raca', 'Nelore Padrão',
                'nascimento', '20/11/2024',
                'pai', '1153F DA ARZ',
                'mae', '8417 TE MAFRA',
                'iabcz', '25.51',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO69.pdf'
            )
        );
    END IF;
END $$;

-- 6. DODGE RAM DA FEGO (FEGO 72)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'DODGE RAM DA FEGO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578558/FEGO72_wkwcfx.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578558/FEGO72_wkwcfx.mp4'],
             price = 9500.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Patos de Minas - MG',
            details = jsonb_build_object(
                'registro', 'FEGO 72',
                'raca', 'Nelore Padrão',
                'nascimento', '15/12/2024',
                'pai', 'FALUCK DO CRISPIM',
                'mae', 'JOLIE FIV DA FEGO',
                'iabcz', '21.04',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO72.pdf'
            )
        WHERE name = 'DODGE RAM DA FEGO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'DODGE RAM DA FEGO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Patos de Minas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578558/FEGO72_wkwcfx.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578558/FEGO72_wkwcfx.mp4'],
            9500.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'FEGO 72',
                'raca', 'Nelore Padrão',
                'nascimento', '15/12/2024',
                'pai', 'FALUCK DO CRISPIM',
                'mae', 'JOLIE FIV DA FEGO',
                'iabcz', '21.04',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO72.pdf'
            )
        );
    END IF;
END $$;

-- 7. DELTA FIV DA FEGO (FEGO 45)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'DELTA FIV DA FEGO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578561/FEGO45_lvssdu.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578561/FEGO45_lvssdu.mp4'],
             price = 9500.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Patos de Minas - MG',
            details = jsonb_build_object(
                'registro', 'FEGO 45',
                'raca', 'Nelore Padrão',
                'nascimento', '12/08/2024',
                'pai', 'DELEGADO FIV DA EAO',
                'mae', 'HERA DA FEGO',
                'iabcz', '22.61',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO45.pdf'
            )
        WHERE name = 'DELTA FIV DA FEGO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'DELTA FIV DA FEGO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Patos de Minas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578561/FEGO45_lvssdu.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578561/FEGO45_lvssdu.mp4'],
            9500.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'FEGO 45',
                'raca', 'Nelore Padrão',
                'nascimento', '12/08/2024',
                'pai', 'DELEGADO FIV DA EAO',
                'mae', 'HERA DA FEGO',
                'iabcz', '22.61',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO45.pdf'
            )
        );
    END IF;
END $$;

-- 8. DOURADO DA FEGO (FEGO 68)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'DOURADO DA FEGO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578562/FEGO68_xobmt1.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578562/FEGO68_xobmt1.mp4'],
             price = 9500.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Patos de Minas - MG',
            details = jsonb_build_object(
                'registro', 'FEGO 68',
                'raca', 'Nelore Padrão',
                'nascimento', '15/11/2024',
                'pai', '1153F DA ARZ',
                'mae', '6522 RG ^',
                'iabcz', '27.89',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO68.pdf'
            )
        WHERE name = 'DOURADO DA FEGO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'DOURADO DA FEGO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Patos de Minas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578562/FEGO68_xobmt1.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578562/FEGO68_xobmt1.mp4'],
            9500.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'FEGO 68',
                'raca', 'Nelore Padrão',
                'nascimento', '15/11/2024',
                'pai', '1153F DA ARZ',
                'mae', '6522 RG ^',
                'iabcz', '27.89',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO68.pdf'
            )
        );
    END IF;
END $$;

-- 9. DEL REY FIV DA FEGO (FEGO 46)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'DEL REY FIV DA FEGO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578561/FEGO46_xo8fmv.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578561/FEGO46_xo8fmv.mp4'],
             price = 9500.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Patos de Minas - MG',
            details = jsonb_build_object(
                'registro', 'FEGO 46',
                'raca', 'Nelore Padrão',
                'nascimento', '12/08/2024',
                'pai', 'OURO NEGRO FVC',
                'mae', '2170 FIV FVC',
                'iabcz', '29.24',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO46.pdf'
            )
        WHERE name = 'DEL REY FIV DA FEGO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'DEL REY FIV DA FEGO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Patos de Minas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578561/FEGO46_xo8fmv.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578561/FEGO46_xo8fmv.mp4'],
            9500.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'FEGO 46',
                'raca', 'Nelore Padrão',
                'nascimento', '12/08/2024',
                'pai', 'OURO NEGRO FVC',
                'mae', '2170 FIV FVC',
                'iabcz', '29.24',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO46.pdf'
            )
        );
    END IF;
END $$;

-- 10. DOM JUAN FIV DA FEGO (FEGO 50)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'DOM JUAN FIV DA FEGO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578558/FEGO50_vudoyb.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578558/FEGO50_vudoyb.mp4'],
             price = 9500.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Patos de Minas - MG',
            details = jsonb_build_object(
                'registro', 'FEGO 50',
                'raca', 'Nelore Padrão',
                'nascimento', '25/08/2024',
                'pai', 'DELEGADO FIV DA EAO',
                'mae', 'HERA DA FEGO',
                'iabcz', '22.61',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO50.pdf'
            )
        WHERE name = 'DOM JUAN FIV DA FEGO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'DOM JUAN FIV DA FEGO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Patos de Minas - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578558/FEGO50_vudoyb.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770578558/FEGO50_vudoyb.mp4'],
            9500.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'FEGO 50',
                'raca', 'Nelore Padrão',
                'nascimento', '25/08/2024',
                'pai', 'DELEGADO FIV DA EAO',
                'mae', 'HERA DA FEGO',
                'iabcz', '22.61',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'FEGO Agropecuária',
                'proprietario', 'FEGO Agropecuária',
                'comissao', '4%',
                'pdf', '/FEGO50.pdf'
            )
        );
    END IF;
END $$;
