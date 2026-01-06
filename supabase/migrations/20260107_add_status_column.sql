-- Add status column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Backfill data based on is_active
-- If is_active is TRUE, set status to 'published'
-- If is_active is FALSE, set status to 'draft'
UPDATE posts SET status = 'published' WHERE is_active = true AND status = 'draft';
UPDATE posts SET status = 'draft' WHERE is_active = false AND status = 'draft';

-- Add check constraint to ensure valid values
ALTER TABLE posts ADD CONSTRAINT check_status_valid CHECK (status IN ('draft', 'published', 'archived'));

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
