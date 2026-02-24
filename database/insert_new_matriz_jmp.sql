-- Insert New Matriz JMP
-- 1. 13951S FIV JMP (RGD: NJMP 13951)

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '13951S FIV JMP') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771968042/NJMP13951_o6yyj7.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771968042/NJMP13951_o6yyj7.mp4'],
            price = 22500.00,
            installments = '15X',
            forma_pagamento = 'parcelado',
            location = 'Comendador Gomes MG',
            details = jsonb_build_object(
                'registro', 'NJMP 13951',
                'raca', 'Nelore Padrão',
                'nascimento', '07/09/2024',
                'pai', 'REM1715L FIV GENETICA ADITIVA',
                'mae', '2419C JMP',
                'iabcz', '30.61',
                'mgte', '26.07',
                'iqg', '38.15',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore da Mata',
                'proprietario', 'Nelore da Mata',
                'comissao', '4%',
                'pdf', '/NJMP13951.pdf'
            )
        WHERE name = '13951S FIV JMP';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '13951S FIV JMP',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'parcelado',
            'Comendador Gomes MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771968042/NJMP13951_o6yyj7.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771968042/NJMP13951_o6yyj7.mp4'],
            22500.00,
            '15X',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'NJMP 13951',
                'raca', 'Nelore Padrão',
                'nascimento', '07/09/2024',
                'pai', 'REM1715L FIV GENETICA ADITIVA',
                'mae', '2419C JMP',
                'iabcz', '30.61',
                'mgte', '26.07',
                'iqg', '38.15',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore da Mata',
                'proprietario', 'Nelore da Mata',
                'comissao', '4%',
                'pdf', '/NJMP13951.pdf'
            )
        );
    END IF;
END $$;
