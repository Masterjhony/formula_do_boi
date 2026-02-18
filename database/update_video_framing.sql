
-- Add the video_object_position column to the products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS video_object_position TEXT DEFAULT 'center center';

-- Optional: Update existing records to default (already handled by DEFAULT, but meant for future inserts)
COMMENT ON COLUMN products.video_object_position IS 'CSS object-position value for the video/image (e.g., "center top", "center center")';
