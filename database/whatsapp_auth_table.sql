-- Create whatsapp_auth table to store Baileys session data
CREATE TABLE public.whatsapp_auth (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.whatsapp_auth ENABLE ROW LEVEL SECURITY;

-- Allow full access to authenticated users (admin panel) and service role
CREATE POLICY "Allow full access to whatsapp_auth" ON public.whatsapp_auth
    FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Create an index to make finding records faster
CREATE INDEX whatsapp_auth_id_idx ON public.whatsapp_auth (id);
