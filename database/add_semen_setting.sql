-- Insert the setting for Semen page visibility (default to hidden as requested)
INSERT INTO site_settings (key, value, description)
VALUES ('semen_page_enabled', 'false'::jsonb, 'Controls the visibility of the Semen page for public users')
ON CONFLICT (key) DO NOTHING;
