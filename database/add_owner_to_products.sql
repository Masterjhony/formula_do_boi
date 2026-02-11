-- Add owner_id to products table if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'owner_id') then
        alter table public.products add column owner_id uuid references auth.users(id) on delete set null;
    end if;
end $$;

-- Update RLS policies to allow users to manage their own products

-- Drop existing policies that might conflict (or we can just add new ones?)
-- Let's check existing policies first.
-- "Only Admins can insert products."
-- "Only Admins can update products."
-- "Only Admins can delete products."

-- We want to allow insert if auth.uid() is the owner_id (or just allow authenticated users to insert, and trigger sets owner_id?)
-- Better: Allow authenticated insert, but enforce owner_id = auth.uid() via check or trigger.
-- Simplest RLS for insert:
create policy "Users can insert their own products" on public.products
  for insert with check (
    auth.uid() = owner_id
  );

-- Allow users to update their own products
create policy "Users can update their own products" on public.products
  for update using (
    auth.uid() = owner_id
  );

-- Allow users to delete their own products
create policy "Users can delete their own products" on public.products
  for delete using (
    auth.uid() = owner_id
  );

-- Grant usage on sequence if needed (usually handled by identity)
