-- Add scheduled_for column
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS scheduled_for timestamptz DEFAULT NULL;

-- Drop existing check constraint on status
-- Drop existing check constraint on status (handling both potential names)
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS check_status_valid;

ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_status_check;

-- Add updated check constraint including new statuses
ALTER TABLE posts 
ADD CONSTRAINT posts_status_check 
CHECK (status IN ('draft', 'published', 'archived', 'scheduled', 'pending_review'));

-- Comment for documentation
COMMENT ON COLUMN posts.scheduled_for IS 'Timestamp when the post should be automatically published';
