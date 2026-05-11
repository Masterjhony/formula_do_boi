-- ============================================================================
-- whatsapp_templates: suporte a mídia (foto/vídeo/etc) e enquete nativa
-- ============================================================================
-- Data: 2026-05-11
--
-- Estende a tabela whatsapp_templates para que um template possa carregar:
--   - Um anexo (foto, vídeo, áudio ou documento) armazenado no R2.
--   - Uma enquete nativa do WhatsApp (pergunta + opções).
--
-- O template original em texto continua funcionando como antes. Os novos
-- campos são todos opcionais.
--
-- Convenção do `media_url`: armazenamos a KEY do R2 (com o prefixo padrão
-- `libmedia/`), não a URL pública/presigned. A URL é gerada na hora do envio
-- pelo Next.js (presigned curta) e passada ao VPS.
-- ============================================================================

ALTER TABLE public.whatsapp_templates
    -- Mídia (opcional). Se preenchida, é enviada ANTES da `body` no WhatsApp.
    ADD COLUMN IF NOT EXISTS media_url       TEXT,            -- key do R2 (ex.: libmedia/123_foto.jpg)
    ADD COLUMN IF NOT EXISTS media_type      TEXT,            -- image|video|audio|document
    ADD COLUMN IF NOT EXISTS media_mime      TEXT,            -- mimetype original
    ADD COLUMN IF NOT EXISTS media_filename  TEXT,            -- nome original (mostrado em document)
    ADD COLUMN IF NOT EXISTS media_caption   TEXT,            -- legenda (se vazio, usa body como caption)

    -- Enquete (opcional). Se preenchida, é enviada DEPOIS da `body`.
    ADD COLUMN IF NOT EXISTS poll_question         TEXT,
    ADD COLUMN IF NOT EXISTS poll_options          JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS poll_selectable_count INT  NOT NULL DEFAULT 1;

-- Restringe os tipos de mídia aceitos.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_templates_media_type_check'
    ) THEN
        ALTER TABLE public.whatsapp_templates
            ADD CONSTRAINT whatsapp_templates_media_type_check
            CHECK (media_type IS NULL OR media_type IN ('image','video','audio','document'));
    END IF;
END $$;

COMMENT ON COLUMN public.whatsapp_templates.media_url IS
    'Key do R2 (ex.: libmedia/123_foto.jpg). A presigned URL é gerada no envio.';
COMMENT ON COLUMN public.whatsapp_templates.media_type IS
    'image | video | audio | document — define como o VPS envia via Baileys.';
COMMENT ON COLUMN public.whatsapp_templates.poll_options IS
    'Array JSON de strings com as opções da enquete (ex.: ["Sêmen","Embriões",...]).';
