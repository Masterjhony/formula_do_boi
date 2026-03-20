-- ==============================================================================
-- ADD REGISTRATION FIELDS TO PROFILES
-- ==============================================================================

-- 1. Add the columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'farm_name') THEN
        ALTER TABLE public.profiles ADD COLUMN farm_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'estado') THEN
        ALTER TABLE public.profiles ADD COLUMN estado text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cidade') THEN
        ALTER TABLE public.profiles ADD COLUMN cidade text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'momento_pecuaria') THEN
        ALTER TABLE public.profiles ADD COLUMN momento_pecuaria text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'o_que_busca') THEN
        ALTER TABLE public.profiles ADD COLUMN o_que_busca text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'quantidade_animais') THEN
        ALTER TABLE public.profiles ADD COLUMN quantidade_animais text;
    END IF;
END $$;

-- 2. Update the handle_new_user trigger function to include all fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    full_name,
    phone,
    farm_name,
    estado,
    cidade,
    momento_pecuaria,
    o_que_busca,
    quantidade_animais
  )
  VALUES (
    new.id, 
    new.email, 
    'user',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'farm_name',
    new.raw_user_meta_data->>'estado',
    new.raw_user_meta_data->>'cidade',
    new.raw_user_meta_data->>'momento_pecuaria',
    new.raw_user_meta_data->>'o_que_busca',
    new.raw_user_meta_data->>'quantidade_animais'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill existing users
-- Update profiles with the new fields from auth.users metadata for users who already registered with them
UPDATE public.profiles p
SET 
  phone = (u.raw_user_meta_data->>'phone'),
  farm_name = (u.raw_user_meta_data->>'farm_name'),
  estado = (u.raw_user_meta_data->>'estado'),
  cidade = (u.raw_user_meta_data->>'cidade'),
  momento_pecuaria = (u.raw_user_meta_data->>'momento_pecuaria'),
  o_que_busca = (u.raw_user_meta_data->>'o_que_busca'),
  quantidade_animais = (u.raw_user_meta_data->>'quantidade_animais')
FROM auth.users u
WHERE p.id = u.id
AND (
  u.raw_user_meta_data->>'phone' IS NOT NULL
  OR u.raw_user_meta_data->>'farm_name' IS NOT NULL
  OR u.raw_user_meta_data->>'estado' IS NOT NULL
  OR u.raw_user_meta_data->>'cidade' IS NOT NULL
  OR u.raw_user_meta_data->>'momento_pecuaria' IS NOT NULL
  OR u.raw_user_meta_data->>'o_que_busca' IS NOT NULL
  OR u.raw_user_meta_data->>'quantidade_animais' IS NOT NULL
);
