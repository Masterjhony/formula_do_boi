-- Add extra_data JSONB column to crm_leads for storing custom field values
-- This supports the CRM Settings feature where admins can define custom fields

ALTER TABLE crm_leads
ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN crm_leads.extra_data IS 'Stores values for custom fields configured in site_settings.crm_config';
