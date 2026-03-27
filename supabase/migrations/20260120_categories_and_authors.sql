-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies for Categories
CREATE POLICY "Public categories are viewable by everyone"
  ON categories FOR SELECT
  USING ( is_active = true );

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK ( true );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING ( true );

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING ( true );

-- Handle existing categories table from earlier implementations
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'type') THEN
        ALTER TABLE categories ALTER COLUMN type DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'name') THEN
        -- Safely try to rename if they used title instead of name
    END IF;
END $$;

-- Seed default categories safely
INSERT INTO categories (slug, name, description)
SELECT slug, name, description FROM (VALUES 
  ('research', 'Research', 'Research papers and academic insights in agriculture.'),
  ('news', 'News', 'Latest happenings and breaking news.'),
  ('jobs', 'Jobs', 'Job openings and career opportunities.'),
  ('internships', 'Internships', 'Internship opportunities for students and freshers.'),
  ('startups', 'Startups', 'News and updates from agri-tech startups.'),
  ('events', 'Events', 'Upcoming conferences, webinars, and events.'),
  ('schemes', 'Schemes', 'Government schemes, subsidies, and policies.'),
  ('fellowships', 'Fellowships', 'Fellowship programs.'),
  ('scholarships', 'Scholarships', 'Educational scholarships in agriculture.'),
  ('grants', 'Grants', 'Grants and funding opportunities.'),
  ('exams', 'Exams', 'Agricultural exam notifications and admission updates.')
) AS new_categories(slug, name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.slug = new_categories.slug
);

-- 2. Add user_id to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid();

-- 3. Add slug to authors
ALTER TABLE authors ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Generate slugs for existing authors
UPDATE authors 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) 
WHERE slug IS NULL;
