-- Add is_featured column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create index for faster filtering by featured status
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured);
