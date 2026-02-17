-- Insert the setting for Ranking page visibility (default to hidden as requested)
INSERT INTO site_settings (key, value, description)
VALUES ('ranking_page_enabled', 'false'::jsonb, 'Controls the visibility of the Ranking page for public users')
ON CONFLICT (key) DO NOTHING;
