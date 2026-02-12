-- Insert dummy Top Criadores
INSERT INTO public.breeders (
    name, 
    slug, 
    is_partner, 
    presentation_text, 
    history_text, 
    philosophy_text, 
    average_indices, 
    profile_image_url, 
    cover_image_url, 
    website_url, 
    instagram_url, 
    whatsapp_url
) VALUES 
(
    'Fazenda Santa Nice',
    'fazenda-santa-nice',
    TRUE,
    'Excelência em genética Nelore PO com mais de 50 anos de tradição.',
    'Fundada em 1970, a Fazenda Santa Nice é referência nacional em melhoramento genético.',
    'Foco em precocidade, rusticidade e habilidade materna.',
    '{"iabcZ": "28.5", "mgte": "24.5", "pmgz": "Top 0.1%"}',
    'https://images.unsplash.com/photo-1545656191-20d0f5c1e544?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJvZGVvJTIwY293Ym95fGVufDB8fDB8fHww',
    'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFybXxlbnwwfHwwfHx8MA%3D%3D',
    'https://santanice.com.br',
    'https://instagram.com/santanice',
    '5511999999999'
),
(
    'Agropecuária Naviraí',
    'agropecuaria-navirai',
    TRUE,
    'Símbolo de raça e produtividade no Nelore.',
    'A Naviraí construiu sua história baseada na seleção criteriosa e uso de tecnologias avançadas.',
    'Produzir animais funcionais e rentáveis para a pecuária moderna.',
    '{"iabcZ": "26.1", "mgte": "23.1", "pmgz": "Top 0.5%"}',
    'https://images.unsplash.com/photo-1595822398436-d74825902e86?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNhdHRsZXxlbnwwfHwwfHx8MA%3D%3D',
    'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFybXxlbnwwfHwwfHx8MA%3D%3D',
    'https://navirai.com.br',
    'https://instagram.com/navirai',
    '5511988888888'
),
(
    'Estância Nelore Verde',
    'estancia-nelore-verde',
    TRUE,
    'Tradição e inovação na criação de Nelore de alta performance.',
    'Com mais de 30 anos de seleção, a Nelore Verde se destaca pela consistência de seu rebanho.',
    'Aliar a rusticidade do Nelore com as mais modernas técnicas de melhoramento genético.',
    '{"iabcZ": "25.4", "mgte": "21.8", "pmgz": "Top 1%"}',
    'https://images.unsplash.com/photo-1541625699-54d7e6c38234?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=1600&auto=format&fit=crop&q=60',
    'https://neloreverde.com.br',
    'https://instagram.com/neloreverde',
    '5511977777777'
)
ON CONFLICT (slug) DO UPDATE SET
    is_partner = EXCLUDED.is_partner,
    presentation_text = EXCLUDED.presentation_text,
    history_text = EXCLUDED.history_text,
    philosophy_text = EXCLUDED.philosophy_text,
    average_indices = EXCLUDED.average_indices,
    profile_image_url = EXCLUDED.profile_image_url,
    cover_image_url = EXCLUDED.cover_image_url;
