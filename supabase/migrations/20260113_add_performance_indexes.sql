-- Create indexes for frequently accessed columns to improve query performance

-- 1. Index for slug lookups (Single post view)
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- 2. Index for category filtering (Jobs vs Blog)
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

-- 3. Index for filtering active/published posts (Homepage feeds)
CREATE INDEX IF NOT EXISTS idx_posts_is_active ON posts(is_active);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);

-- 4. Composite index for common job queries (Active Jobs)
CREATE INDEX IF NOT EXISTS idx_posts_active_jobs ON posts(category, is_active) WHERE category = 'Jobs' AND is_active = true;
