-- ============================================================================
-- whatsapp_campaigns: suporte a anexar mídia direto na campanha
-- ============================================================================
-- Data: 2026-05-11
--
-- Espelha os campos de mídia que já existem em `whatsapp_templates` para que
-- uma campanha possa carregar foto/vídeo/PDF sem precisar criar template.
--
-- Convenção: mesma do template — `media_url` guarda a KEY do R2 (com prefixo
-- libmedia/), nunca a URL pública. A presigned URL é gerada no envio pelo
-- /api/whatsapp/central/campaigns/[id]/send.
--
-- Quando a campanha tem `template_id` E `media_url` próprio, o `send` route
-- prefere a mídia DA CAMPANHA (override). Permite reaproveitar o texto do
-- template mas trocar o anexo por campanha — útil pra "mesmo welcome, foto
-- diferente por evento".
-- ============================================================================

ALTER TABLE public.whatsapp_campaigns
    ADD COLUMN IF NOT EXISTS media_url       TEXT,
    ADD COLUMN IF NOT EXISTS media_type      TEXT,
    ADD COLUMN IF NOT EXISTS media_mime      TEXT,
    ADD COLUMN IF NOT EXISTS media_filename  TEXT,
    ADD COLUMN IF NOT EXISTS media_caption   TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_campaigns_media_type_check'
    ) THEN
        ALTER TABLE public.whatsapp_campaigns
            ADD CONSTRAINT whatsapp_campaigns_media_type_check
            CHECK (media_type IS NULL OR media_type IN ('image','video','audio','document'));
    END IF;
END $$;

COMMENT ON COLUMN public.whatsapp_campaigns.media_url IS
    'Key do R2 (ex.: libmedia/123_foto.jpg). Sobrescreve media do template, se houver.';
