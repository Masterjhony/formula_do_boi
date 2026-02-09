INSERT INTO public.products (
    name,
    category,
    classificacao,
    modalidade,
    logistica,
    forma_pagamento,
    location,
    image_url,
    gallery,
    price,
    installments,
    tag,
    details
) 
VALUES 
(
    'IBIZA FIV RONDA - PCT 09 EMBRIÕES',
    'Embrião',
    'embriao',
    'venda_direta',
    'consultar', -- Frete a combinar/consultar dado ser embrião
    'parcelado_6x',
    'Patos de Minas - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770665944/IBIZA_FIV_RONDA_nr78n3.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770665944/IBIZA_FIV_RONDA_nr78n3.mp4'],
    9000.00,
    '1.500,00',
    'OPORTUNIDADE',
    '{
        "special_price": true,
        "registro": "IBIZ 1523", 
        "raca": "Nelore Padrão", 
        "nascimento": "15/08/2022", 
        "pai": "MIL FIV GC DA SL", 
        "mae": "IBIZA PINK", 
        "proprietario": "Fazenda Santana",
        "breeder": "Fazenda Santana",
        "iabcz": "0.26",
        "video_touro": "https://www.youtube.com/watch?v=oOW_TO8kjzM",
        "comentario": "OPORTUNIDADE: 03 Pacotes de 09 embriões disponíveis (R$ 1.000,00/embrião). Total R$ 9.000,00. Acasalamento com o touro VALOR FIV V3. 35% de garantia de prenhez aos 60 dias (DG60).",
        "status": "Em Estoque"
    }'::jsonb
);
