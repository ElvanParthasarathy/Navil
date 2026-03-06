-- ============================================
-- Add variants column to all content tables
-- Run this in Supabase SQL Editor
-- ============================================

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE articles_v2 ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE essays_v2 ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE short_stories_v2 ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE thoughts_v2 ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE diary_v2 ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
