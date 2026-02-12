-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- Turn on RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON site_settings
    FOR SELECT USING (true);

-- Allow authenticated users (admin) to update
CREATE POLICY "Allow admin update" ON site_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert the initial setting for Top Criadores page visibility (default to hidden as requested)
INSERT INTO site_settings (key, value, description)
VALUES ('top_breeders_enabled', 'false'::jsonb, 'Controls the visibility of the Top Criadores page for public users')
ON CONFLICT (key) DO NOTHING;
