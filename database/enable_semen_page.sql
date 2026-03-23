INSERT INTO site_settings (key, value, updated_at) 
VALUES ('semen_page_enabled', 'true'::jsonb, NOW()) 
ON CONFLICT (key) 
DO UPDATE SET value = 'true'::jsonb, updated_at = NOW();
