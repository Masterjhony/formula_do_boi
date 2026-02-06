-- Add iABCZ, MGTe, and IQG columns to products table if they don't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'iabcz') then
        alter table public.products add column iabcz text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'mgte') then
        alter table public.products add column mgte text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'iqg') then
        alter table public.products add column iqg text;
    end if;
end $$;
