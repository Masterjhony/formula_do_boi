-- Add INSERT policy for site_settings to allow upsert operations
-- This fixes the "Erro ao salvar configurações" issue in the Admin Panel

DO $$
BEGIN
    -- Check if the policy already exists to avoid errors
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'site_settings'
        AND policyname = 'Allow admin insert'
    ) THEN
        -- Allow authenticated users (admin) to insert new settings
        CREATE POLICY "Allow admin insert" ON "public"."site_settings"
            FOR INSERT 
            WITH CHECK (auth.role() = 'authenticated');
    END IF;
END
$$;
