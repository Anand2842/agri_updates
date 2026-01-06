-- Add analytics columns to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Initial migration: Set updated_at to created_at if null
UPDATE posts SET updated_at = created_at WHERE updated_at IS NULL;

-- Function to atomically increment views
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$;
