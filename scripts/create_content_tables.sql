-- ============================================
-- Unified Content Architecture - Supabase Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE,
  publish_date TIMESTAMPTZ DEFAULT now(),
  is_private BOOLEAN DEFAULT false,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Articles
CREATE TABLE IF NOT EXISTS articles_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE,
  publish_date TIMESTAMPTZ DEFAULT now(),
  is_private BOOLEAN DEFAULT false,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Essays
CREATE TABLE IF NOT EXISTS essays_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE,
  publish_date TIMESTAMPTZ DEFAULT now(),
  is_private BOOLEAN DEFAULT false,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Short Stories
CREATE TABLE IF NOT EXISTS short_stories_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE,
  publish_date TIMESTAMPTZ DEFAULT now(),
  is_private BOOLEAN DEFAULT false,
  cover_image TEXT,
  series_name TEXT,
  series_part INTEGER,
  tags TEXT[] DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Thoughts
CREATE TABLE IF NOT EXISTS thoughts_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE,
  publish_date TIMESTAMPTZ DEFAULT now(),
  is_private BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Diary
CREATE TABLE IF NOT EXISTS diary_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE,
  publish_date TIMESTAMPTZ DEFAULT now(),
  is_private BOOLEAN DEFAULT true,  -- Private by default for diary
  tags TEXT[] DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE essays_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_stories_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_v2 ENABLE ROW LEVEL SECURITY;

-- Public read access (non-private entries only)
CREATE POLICY "Public read" ON blog_posts FOR SELECT USING (is_private = false);
CREATE POLICY "Public read" ON articles_v2 FOR SELECT USING (is_private = false);
CREATE POLICY "Public read" ON essays_v2 FOR SELECT USING (is_private = false);
CREATE POLICY "Public read" ON short_stories_v2 FOR SELECT USING (is_private = false);
CREATE POLICY "Public read" ON thoughts_v2 FOR SELECT USING (is_private = false);
CREATE POLICY "Public read" ON diary_v2 FOR SELECT USING (is_private = false);

-- Anon insert/update/delete (for admin API - consider using service_role key in production)
CREATE POLICY "Anon write" ON blog_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write" ON articles_v2 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write" ON essays_v2 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write" ON short_stories_v2 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write" ON thoughts_v2 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write" ON diary_v2 FOR ALL USING (true) WITH CHECK (true);
