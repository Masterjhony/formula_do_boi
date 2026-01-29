-- Create breeders table
CREATE TABLE IF NOT EXISTS public.breeders (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.breeders ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access"
ON public.breeders
FOR SELECT
TO public
USING (true);

-- Allow write access only to specific users (or authenticated users for now for simplicity, ideally restricted to admin)
-- For this project's current state, we'll allow authenticated users to insert (so admins can add)
CREATE POLICY "Allow authenticated insert"
ON public.breeders
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow update/delete to authenticated
CREATE POLICY "Allow authenticated update"
ON public.breeders
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete"
ON public.breeders
FOR DELETE
TO authenticated
USING (true);

-- Insert some initial breeders (optional, based on existing data if known, otherwise empty)
INSERT INTO public.breeders (name) VALUES 
('Fazenda Visual'),
('Fazenda Estrela'),
('Nelore PO')
ON CONFLICT (name) DO NOTHING;
