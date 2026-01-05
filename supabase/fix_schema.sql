-- Run this in the Supabase SQL Editor to fix your existing tables
-- This adds the missing columns without deleting your data

-- 1. Fix Jobs Table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company TEXT DEFAULT 'Confidential'; 
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_range TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_link TEXT;

-- 2. Fix Startups Table (if needed)
ALTER TABLE startups ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE startups ADD COLUMN IF NOT EXISTS website_url TEXT;

-- 3. Fix Posts Table (if needed)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. Re-run Seed Data (Optional, to fill the new columns for existing rows)
-- You can run seed.sql again after this if you want to populate these new fields properly.
