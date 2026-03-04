-- Run this in your Supabase SQL Editor to add the missing columns
-- for both poems and quotes tables.

-- Add pin_type column (for auto vs permanent pinning)
ALTER TABLE poems ADD COLUMN IF NOT EXISTS pin_type TEXT DEFAULT 'auto';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS pin_type TEXT DEFAULT 'auto';

-- Add any other missing columns for quotes (to match poems schema)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS style TEXT DEFAULT '';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT '';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS meter TEXT DEFAULT '';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS classification TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS dedication TEXT DEFAULT '';
