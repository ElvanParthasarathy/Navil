-- Adding pinning and taxonomy columns to all content tables to standardize with Poems & Quotes

DO $$
DECLARE
    t text;
    tables text[] := ARRAY['blog_posts', 'articles_v2', 'essays_v2', 'short_stories_v2', 'thoughts_v2', 'diary_v2'];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS pin_expires_at TIMESTAMPTZ;', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS pin_type TEXT DEFAULT ''auto'';', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS style TEXT;', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS theme TEXT;', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS meter TEXT;', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS classification TEXT;', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;', t);
    END LOOP;
END $$;
