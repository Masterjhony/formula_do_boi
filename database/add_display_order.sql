-- Add display_order column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Index for faster sorting
CREATE INDEX IF NOT EXISTS products_display_order_idx ON public.products (display_order DESC);
