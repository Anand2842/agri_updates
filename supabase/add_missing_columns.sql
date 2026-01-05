-- Migration: Add ALL missing columns to jobs, startups, and posts tables
-- Run this BEFORE seed.sql

-- ============================================
-- JOBS TABLE
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'type') THEN
        ALTER TABLE jobs ADD COLUMN type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'salary_range') THEN
        ALTER TABLE jobs ADD COLUMN salary_range TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'description') THEN
        ALTER TABLE jobs ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'tags') THEN
        ALTER TABLE jobs ADD COLUMN tags TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'location') THEN
        ALTER TABLE jobs ADD COLUMN location TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'application_link') THEN
        ALTER TABLE jobs ADD COLUMN application_link TEXT;
    END IF;
END $$;

-- ============================================
-- STARTUPS TABLE
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'location') THEN
        ALTER TABLE startups ADD COLUMN location TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'funding_stage') THEN
        ALTER TABLE startups ADD COLUMN funding_stage TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'website_url') THEN
        ALTER TABLE startups ADD COLUMN website_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'tags') THEN
        ALTER TABLE startups ADD COLUMN tags TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'description') THEN
        ALTER TABLE startups ADD COLUMN description TEXT;
    END IF;
END $$;

-- ============================================
-- POSTS TABLE
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'excerpt') THEN
        ALTER TABLE posts ADD COLUMN excerpt TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'content') THEN
        ALTER TABLE posts ADD COLUMN content TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_name') THEN
        ALTER TABLE posts ADD COLUMN author_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'category') THEN
        ALTER TABLE posts ADD COLUMN category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'published_at') THEN
        ALTER TABLE posts ADD COLUMN published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- ============================================
-- VERIFY SCHEMAS
-- ============================================
SELECT 'JOBS COLUMNS:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'jobs' ORDER BY ordinal_position;

SELECT 'STARTUPS COLUMNS:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'startups' ORDER BY ordinal_position;

SELECT 'POSTS COLUMNS:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'posts' ORDER BY ordinal_position;
