-- Run this in your Supabase SQL Editor to add the display_order column
-- for both poems and quotes tables.

ALTER TABLE poems ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Optional: If you want to initially set display_order to match the current date order
-- (oldest to newest or newest to oldest), you could do something like this, but
-- it's usually fine to leave them as 0 and let the app handle it upon first save.
