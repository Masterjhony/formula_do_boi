-- Create favorites table
create table if not exists public.favorites (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id bigint references public.products on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- Enable RLS
alter table public.favorites enable row level security;

-- Policies
create policy "Users can view their own favorites." on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert their own favorites." on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own favorites." on public.favorites
  for delete using (auth.uid() = user_id);
