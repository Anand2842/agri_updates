-- Add display_location column to posts table to allow explicit layout control
-- Values: 'hero', 'featured_grid', 'trending', 'dont_miss', 'standard'
ALTER TABLE posts ADD COLUMN IF NOT EXISTS display_location TEXT DEFAULT 'standard';

-- Add index for faster filtering by location
CREATE INDEX IF NOT EXISTS idx_posts_display_location ON posts(display_location);
