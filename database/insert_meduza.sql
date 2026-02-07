-- Insert MEDUZA - Pacote 10 Embriões
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'MEDUZA - Pacote 10 Embriões') THEN
        UPDATE public.products SET
            category = 'DOADORA',
            classificacao = 'embriao',
            modalidade = 'venda_direta',
            logistica = 'frete_compartilhado',
            forma_pagamento = 'Entrada + 30x',
            location = 'Uberaba - MG',
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770078735/SYA537_f8ahhu.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770078735/SYA537_f8ahhu.mp4'],
            price = 17000.00,
            installments = '453,33',
            tag = 'DESTAQUE',
            details = jsonb_build_object(
                'registro', 'SYA 537',
                'raca', 'Nelore',
                'nascimento', '15/06/2023',
                'pai', 'PAO DE LO DA CA',
                'mae', 'IBIZA FIV MERLIN',
                'proprietario', 'BERRANTE DE OURO',
                'peso', 'Sob Consulta',
                'comentario', 'Excelente animal.',
                'pdf', '/SYA537.pdf'
            )
        WHERE name = 'MEDUZA - Pacote 10 Embriões';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'MEDUZA - Pacote 10 Embriões',
            'DOADORA',
            'embriao',
            'venda_direta',
            'frete_compartilhado',
            'Entrada + 30x',
            'Uberaba - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770078735/SYA537_f8ahhu.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770078735/SYA537_f8ahhu.mp4'],
            17000.00,
            '453,33',
            'DESTAQUE',
            jsonb_build_object(
                'registro', 'SYA 537',
                'raca', 'Nelore',
                'nascimento', '15/06/2023',
                'pai', 'PAO DE LO DA CA',
                'mae', 'IBIZA FIV MERLIN',
                'proprietario', 'BERRANTE DE OURO',
                'peso', 'Sob Consulta',
                'comentario', 'Excelente animal.',
                'pdf', '/SYA537.pdf'
            )
        );
    END IF;
END $$;
