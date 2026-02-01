-- ==============================================================================
-- CLEANUP (CAREFUL: This deletes existing product data to ensure a clean slate)
-- ==============================================================================
DROP TABLE IF EXISTS public.products CASCADE;
-- We do NOT drop profiles to avoid messing up existing auth links, but we ensure columns exist.

-- ==============================================================================
-- PROFILES (ROLES)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text check (role in ('admin', 'user')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Profiles Policies (Drop first to avoid errors if they exist)
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- ==============================================================================
-- PRODUCTS
-- ==============================================================================
create table public.products (
  id bigint generated always as identity primary key,
  name text not null,
  category text, -- 'Touro PO', 'Matriz PO'
  classificacao text, -- 'touro', 'matriz'
  modalidade text, -- 'venda_direta'
  logistica text, -- 'retira_fazenda'
  forma_pagamento text, -- 'parcelado_24x', 'a_vista'
  location text,
  image_url text,
  gallery text[], -- Array of strings
  price numeric, 
  installments text, 
  tag text, 
  details jsonb, 
  active boolean default true,
  sold boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Products
alter table public.products enable row level security;

-- Products Policies
drop policy if exists "Products are viewable by everyone." on public.products;
create policy "Products are viewable by everyone." on public.products
  for select using (true);

drop policy if exists "Only Admins can insert products." on public.products;
create policy "Only Admins can insert products." on public.products
  for insert with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Only Admins can update products." on public.products;
create policy "Only Admins can update products." on public.products
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Only Admins can delete products." on public.products;
create policy "Only Admins can delete products." on public.products
  for delete using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ==============================================================================
-- TRIGGERS
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- INITIAL DATA MIGRATION
-- ==============================================================================
INSERT INTO public.products (name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details)
VALUES
(
  'MIRAGEM FIV VISUAL',
  'Matriz PO',
  'matriz',
  'venda_direta',
  'retira_fazenda',
  'parcelado_24x',
  'Esmeraldas - MG',
  'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483484/VIS_4596_uzetue.mp4',
  ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483484/VIS_4596_uzetue.mp4', 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769366221/VIS_4596_l1dmnj.mp4'],
  27000.00,
  '1.125,00',
  'DESTAQUE',
  '{"registro": "VIS 4596", "raca": "Nelore", "nascimento": "01/08/2023", "pai": "ESPARTANO MAT.", "mae": "ESQUADRIA SINO", "peso": "600 kg", "mgte": "27.50", "top": "4%", "status": "Matriz Parida e Prenha", "tipo": "Matriz", "comentario": "Animal de excelente avaliação genética.", "pdf": "/ancp_vis_4596.pdf"}'::jsonb
),
(
  'MAGICA FIV VISUAL',
  'Matriz PO',
  'matriz',
  'venda_direta',
  'retira_fazenda',
  'parcelado_24x',
  'Esmeraldas - MG',
  'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483488/VIS_4588_2_lnbf65.mp4',
  ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483488/VIS_4588_2_lnbf65.mp4', 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483480/VIS_4588_f4nlzq.mp4'],
  27000.00,
  '1.125,00',
  'NOVO',
  '{"registro": "VIS 4588", "raca": "Nelore", "nascimento": "17/12/2023", "pai": "JUSTIN FIV VISUAL", "mae": "A2844 MAT.", "peso": "Sob Consulta", "mgte": "27.15", "top": "4%", "status": "Matriz Parida e Prenha", "tipo": "Matriz", "comentario": "Excelente animal com MGTe TOP 4%.", "pdf": "/ANCP VIS-4588.pdf"}'::jsonb
),
(
  'MANHOSA FIV VISUAL',
  'Matriz PO',
  'matriz',
  'venda_direta',
  'retira_fazenda',
  'parcelado_24x',
  'Esmeraldas - MG',
  'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483487/VIS_4590_2_ktfcma.mp4',
  ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483487/VIS_4590_2_ktfcma.mp4', 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483473/VIS_4590_jpv1gv.mp4'],
  27000.00,
  '1.125,00',
  'NOVO',
  '{"registro": "VIS 4590", "raca": "Nelore", "nascimento": "21/12/2023", "pai": "JUSTIN FIV VISUAL", "mae": "A2852 MAT.", "peso": "Sob Consulta", "mgte": "28.20", "top": "3%", "status": "Matriz Parida e Prenha", "tipo": "Matriz", "comentario": "Destaque genético com MGTe TOP 3%.", "pdf": "/ANCP VIS-4590.pdf"}'::jsonb
),
(
  'MARASCA FIV VISUAL',
  'Matriz PO',
  'matriz',
  'venda_direta',
  'retira_fazenda',
  'parcelado_24x',
  'Esmeraldas - MG',
  'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483483/VIS_4541_em2n0s.mp4',
  ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483483/VIS_4541_em2n0s.mp4'],
  27000.00,
  '1.125,00',
  'NOVO',
  '{"registro": "VIS 4541", "raca": "Nelore", "nascimento": "20/10/2023", "pai": "DON QUIXOTE MAT.", "mae": "IMACULADA FIV VISUAL", "peso": "Sob Consulta", "mgte": "27.56", "top": "Deca 1", "status": "Matriz Parida e Prenha", "tipo": "Matriz", "comentario": "Excelente avaliação genética.", "pdf": "/ANCP VIS-4541.pdf"}'::jsonb
),
(
  'MARCHA FIV VISUAL',
  'Matriz PO',
  'matriz',
  'venda_direta',
  'retira_fazenda',
  'parcelado_24x',
  'Esmeraldas - MG',
  'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483482/VIS_4551_tsvs1u.mp4',
  ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483482/VIS_4551_tsvs1u.mp4'],
  27000.00,
  '1.125,00',
  'NOVO',
  '{"registro": "VIS 4551", "raca": "Nelore", "nascimento": "01/11/2023", "pai": "URI DE NAVIRAI", "mae": "A3044 MAT.", "peso": "Sob Consulta", "mgte": "27.00", "top": "5%", "status": "Matriz Parida e Prenha", "tipo": "Matriz", "comentario": "Animal equilibrado com MGTe TOP 5%.", "pdf": "/ANCP VIS-4551.pdf"}'::jsonb
),
(
  'MAYA FIV VISUAL',
  'Matriz PO',
  'matriz',
  'venda_direta',
  'retira_fazenda',
  'parcelado_24x',
  'Esmeraldas - MG',
  'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483482/VIS_4427_acwnx4.mp4',
  ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483482/VIS_4427_acwnx4.mp4', 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483475/VIS_4427_2_hn5m45.mp4'],
  27000.00,
  '1.125,00',
  'NOVO',
  '{"registro": "VIS 4427", "raca": "Nelore", "nascimento": "02/11/2022", "pai": "EL ZORRERO SINO", "mae": "JORDANIA FIV VISUAL", "peso": "Sob Consulta", "mgte": "29.17", "top": "Deca 1", "status": "Matriz Parida e Prenha", "tipo": "Matriz", "comentario": "iABCZ excepcional.", "pdf": "/ANCP VIS-4427.pdf"}'::jsonb
),
(
  'LEILANI FIV VISUAL',
  'Matriz PO',
  'matriz',
  'venda_direta',
  'retira_fazenda',
  'parcelado_24x',
  'Esmeraldas - MG',
  'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483476/VIS_4102_2_yz1scn.mp4',
  ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769483476/VIS_4102_2_yz1scn.mp4'],
  27000.00,
  '1.125,00',
  'NOVO',
  '{"registro": "VIS 4102", "raca": "Nelore", "nascimento": "04/11/2021", "pai": "DODGE MAT.", "mae": "HENA FIV VISUAL", "peso": "Sob Consulta", "mgte": "28.14", "top": "Deca 1", "status": "Matriz Parida e Prenha", "tipo": "Matriz", "comentario": "Matriz de alta qualidade.", "pdf": "/ANCP VIS-4102.pdf"}'::jsonb
),
(
  '11112 MAFRA',
  'Touro PO',
  'touro',
  'venda_direta',
  'retira_fazenda',
  'a_vista',
  'Cumaru do Norte - PA',
  'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769524792/MFRA_11112_tes647.mp4',
  ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769524792/MFRA_11112_tes647.mp4'],
  15000.00,
  'À Vista',
  'NOVO',
  '{"registro": "MFRA 11112", "raca": "Nelore", "nascimento": "20/11/2020", "pai": "REM DHEEF", "mae": "4719 TE MAFRA", "peso": "Sob Consulta", "mgte": "iABCZ 13.60", "top": "Deca 2", "status": "Touro", "tipo": "Touro", "comentario": "Touro PO com iABCZ 13.60 (Deca 2).", "pdf": "/MFRA 11112.pdf"}'::jsonb
),
(
  '10622 MAFRA',
  'Touro PO',
  'touro',
  'venda_direta',
  'retira_fazenda',
  'a_vista',
  'Cumaru do Norte - PA',
  'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769524791/MFRA_10622_mno6vk.mp4',
  ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769524791/MFRA_10622_mno6vk.mp4'],
  15000.00,
  'À Vista',
  'NOVO',
  '{"registro": "MFRA 10622", "raca": "Nelore", "nascimento": "08/09/2020", "pai": "CALIBRE FIV CAMPARINO", "mae": "6470 MAFRA", "peso": "Sob Consulta", "mgte": "Sob Consulta", "top": "", "status": "Touro", "tipo": "Touro", "comentario": "Touro PO de excelente linhagem.", "pdf": "/MFRA 10622.pdf"}'::jsonb
);

-- UPDATE ADMIN
update public.profiles
set role = 'admin'
where email = 'formuladoboi@gmail.com';
