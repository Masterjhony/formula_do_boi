-- Add columns for Top Criadores feature
ALTER TABLE public.breeders
ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS presentation_text TEXT,
ADD COLUMN IF NOT EXISTS history_text TEXT,
ADD COLUMN IF NOT EXISTS philosophy_text TEXT,
ADD COLUMN IF NOT EXISTS average_indices JSONB,
ADD COLUMN IF NOT EXISTS portfolio_images JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;

-- Create an index on is_partner for faster filtering
CREATE INDEX IF NOT EXISTS idx_breeders_is_partner ON public.breeders(is_partner);

-- Create an index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_breeders_slug ON public.breeders(slug);
