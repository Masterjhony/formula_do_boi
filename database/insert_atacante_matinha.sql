-- Inserts the "Atacante da Matinha" semen card for the Sêmen catalog page,
-- routing the card to the dedicated landing page at /atacante.

INSERT INTO public.products (
  name,
  category,
  classificacao,
  location,
  image_url,
  gallery,
  price,
  installments,
  tag,
  details
) VALUES (
  'Dose de Sêmen - ATACANTE DA MATINHA',
  'Sêmen',
  'semen',
  'Central Procriar SP',
  '/assets/atacante/atacante-video-1.mp4',
  ARRAY[
    '/assets/atacante/atacante_photo.jpg',
    '/assets/atacante/touro-02.jpeg',
    '/assets/atacante/touro-03.jpeg',
    '/assets/atacante/touro-04.jpeg',
    '/assets/atacante/atacante-video-1.mp4',
    '/assets/atacante/atacante-video-2.mp4'
  ],
  NULL,
  'Sob Consulta',
  'LANÇAMENTO 2026',
  '{
    "registro": "RDM B 3224 MAT.",
    "raca": "Nelore PO",
    "nascimento": "01/08/2024",
    "pai": "HITLER MAT.",
    "mae": "GARTA MAT.",
    "mgte": "42.38",
    "iabcz": "—",
    "iqg": "—",
    "proprietario": "Fazenda Bella Vista",
    "breeder": "Nelore Visual / Rancho da Matinha",
    "tipo": "Sêmen Convencional · Sexado",
    "comentario": "Touro Jovem Nelore PO. MGTe 42,38 — TOP 0,1% da raça. Pré-reserva aberta.",
    "customLink": "/atacante"
  }'::jsonb
);
