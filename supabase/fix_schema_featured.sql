-- Add is_featured column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add website_url column to startups table (just in case)
ALTER TABLE startups ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Verify jobs structure
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_range TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT;
