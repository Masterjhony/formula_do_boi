-- Revert video object position to default 'center center' as requested
-- This undoes the changes from fix_video_positions.sql

UPDATE products SET video_object_position = 'center center' WHERE video_object_position IS NOT NULL;
