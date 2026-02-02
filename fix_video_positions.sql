-- Update video object position for specific bulls to improve framing
-- Setting to 'center center' explicitly, but can be adjusted to 'center 20%' (top focus) or 'center 80%' (bottom focus)
-- Based on user feedback that they are "not adjusted correctly"

UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%QUINCAS%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%RAPEL%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%RELUTANTE%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%RADICAL%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%ROMANCE%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%RIQUELME%';

-- Previous bulls from screenshots
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%UNICO%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%URI%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%LEGENDARIO%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%JACARANDA%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%GARFIELD%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%PONTO%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%1443%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%CIMENTO%';
UPDATE products SET video_object_position = 'center 30%' WHERE name ILIKE '%GENETICA%';
