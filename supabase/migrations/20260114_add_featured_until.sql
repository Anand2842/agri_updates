-- Add featured_until column for time-based featured expiration
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ NULL;

-- Optional: Add index for faster expiration queries
CREATE INDEX IF NOT EXISTS idx_posts_featured_until ON posts(featured_until) WHERE is_featured = true;
