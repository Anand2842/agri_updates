-- =====================================================
-- Migration: Integrate Jobs into Posts System
-- =====================================================
-- This migration adds job-specific fields to the posts table,
-- migrates existing jobs to posts, and updates the applications table.
-- 
-- WARNING: This is a one-way migration. Backup your database first!
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Add job-specific columns to posts table
-- =====================================================
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS job_type TEXT,
  ADD COLUMN IF NOT EXISTS salary_range TEXT,
  ADD COLUMN IF NOT EXISTS application_link TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add image_url column if it doesn't exist (for consistency)
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Rename cover_image to match the new naming convention if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'cover_image'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE posts RENAME COLUMN cover_image TO image_url;
  END IF;
END $$;

-- Add display_location if it doesn't exist (from previous work)
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS display_location TEXT DEFAULT 'standard';

-- Add is_featured if it doesn't exist (from previous work)
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

COMMIT;

-- =====================================================
-- STEP 2: Migrate existing jobs to posts
-- =====================================================
BEGIN;

-- Create a temporary function to generate slugs
CREATE OR REPLACE FUNCTION generate_slug(title TEXT) 
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Insert jobs as posts with category='Jobs'
-- Make sure we don't duplicate if this migration runs multiple times
INSERT INTO posts (
  id,
  slug,
  title,
  excerpt,
  content,
  image_url,
  author_name,
  category,
  tags,
  company,
  location,
  job_type,
  salary_range,
  application_link,
  is_active,
  published_at,
  created_at
)
SELECT 
  j.id,
  -- Generate unique slug from title + id to avoid conflicts
  generate_slug(j.title) || '-' || substring(j.id::text, 1, 8) as slug,
  j.title,
  -- Use first 200 chars of description as excerpt
  substring(j.description, 1, 200) || '...' as excerpt,
  j.description as content,
  NULL as image_url, -- Jobs don't have images in old schema
  'Agri Updates' as author_name,
  'Jobs' as category,
  j.tags,
  j.company,
  j.location,
  j.type as job_type,
  j.salary_range,
  j.application_link,
  j.is_active,
  j.created_at as published_at,
  j.created_at
FROM jobs j
WHERE NOT EXISTS (
  -- Prevent duplicates if migration runs multiple times
  SELECT 1 FROM posts p WHERE p.id = j.id
);

-- Drop the temporary function
DROP FUNCTION IF EXISTS generate_slug(TEXT);

COMMIT;

-- =====================================================
-- STEP 3: Update applications table
-- =====================================================
BEGIN;

-- Add post_id column if it doesn't exist
ALTER TABLE applications 
  ADD COLUMN IF NOT EXISTS post_id UUID;

-- Copy job_id to post_id (jobs now exist as posts with same IDs)
UPDATE applications 
SET post_id = job_id 
WHERE post_id IS NULL AND job_id IS NOT NULL;

-- Drop the old foreign key constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'applications_job_id_fkey' 
    AND table_name = 'applications'
  ) THEN
    ALTER TABLE applications DROP CONSTRAINT applications_job_id_fkey;
  END IF;
END $$;

-- Add new foreign key to posts
ALTER TABLE applications
  ADD CONSTRAINT applications_post_id_fkey 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- Drop RLS policies that depend on job_id column
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON applications;
DROP POLICY IF EXISTS "Recruiters can update application status" ON applications;

-- Drop the job_id column (now using post_id)
ALTER TABLE applications 
  DROP COLUMN IF EXISTS job_id;

COMMIT;

-- =====================================================
-- STEP 4: Clean up old jobs table
-- =====================================================
BEGIN;

-- Drop all RLS policies for jobs table
DROP POLICY IF EXISTS "Public jobs are viewable by everyone" ON jobs;
DROP POLICY IF EXISTS "Admins can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Admins can update jobs" ON jobs;
DROP POLICY IF EXISTS "Admins can delete jobs" ON jobs;

-- Drop the jobs table
DROP TABLE IF EXISTS jobs CASCADE;

COMMIT;

-- =====================================================
-- STEP 5: Final verification queries
-- =====================================================
-- Uncomment these to verify the migration

-- SELECT COUNT(*) as total_posts FROM posts;
-- SELECT COUNT(*) as total_jobs FROM posts WHERE category = 'Jobs';
-- SELECT COUNT(*) as total_applications FROM applications;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'posts' ORDER BY ordinal_position;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'applications' ORDER BY ordinal_position;
