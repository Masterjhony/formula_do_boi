-- Update existing whatsapp_flow config to use the root domain (formuladoboi.com)
-- after the migration from app.formuladoboi.com (marketplace) → root.
-- Safe to re-run; uses targeted JSON string replacement.

UPDATE site_settings
SET value = jsonb_strip_nulls(
    jsonb_build_object(
        'welcome_message', regexp_replace(
            COALESCE(value->>'welcome_message', ''),
            'https?://app\.formuladoboi\.com',
            'https://formuladoboi.com',
            'g'
        ),
        'options', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'key',      opt->>'key',
                    'label',    opt->>'label',
                    'response', regexp_replace(
                        COALESCE(opt->>'response', ''),
                        'https?://app\.formuladoboi\.com',
                        'https://formuladoboi.com',
                        'g'
                    )
                )
            )
            FROM jsonb_array_elements(COALESCE(value->'options', '[]'::jsonb)) AS opt
        ), '[]'::jsonb),
        'flow_timeout_minutes', COALESCE((value->>'flow_timeout_minutes')::int, 60)
    )
)
WHERE key = 'whatsapp_flow'
  AND value::text LIKE '%app.formuladoboi.com%';
