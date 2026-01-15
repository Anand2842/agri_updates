-- Migration: Add hubs table for managing job hub sections
-- Run this in Supabase SQL Editor

-- Create hubs table
CREATE TABLE IF NOT EXISTS hubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  h1 TEXT NOT NULL,
  intro TEXT,
  filter_tag TEXT NOT NULL,
  filter_category TEXT DEFAULT 'Jobs',
  related_hubs TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE hubs ENABLE ROW LEVEL SECURITY;

-- Public read access for active hubs
DROP POLICY IF EXISTS "Public hubs are viewable by everyone" ON hubs;
CREATE POLICY "Public hubs are viewable by everyone" ON hubs 
  FOR SELECT USING (is_active = true);

-- Admin full access
DROP POLICY IF EXISTS "Admins can view all hubs" ON hubs;
CREATE POLICY "Admins can view all hubs" ON hubs 
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert hubs" ON hubs;
CREATE POLICY "Admins can insert hubs" ON hubs 
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update hubs" ON hubs;
CREATE POLICY "Admins can update hubs" ON hubs 
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can delete hubs" ON hubs;
CREATE POLICY "Admins can delete hubs" ON hubs 
  FOR DELETE TO authenticated USING (true);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_hubs_slug ON hubs(slug);
CREATE INDEX IF NOT EXISTS idx_hubs_filter_tag ON hubs(filter_tag);

-- Insert existing hubs from static config (seed data)
INSERT INTO hubs (slug, title, description, h1, intro, filter_tag, related_hubs) VALUES
(
  'agriculture-jobs-maharashtra',
  'Agriculture Jobs in Maharashtra 2024 - Latest Agri Vacancies',
  'Find the latest agriculture jobs in Maharashtra including sales, field officer, agronomist, fertilizer, and agrochemical roles. Updated daily.',
  'Agriculture Jobs in Maharashtra – Latest Agri Vacancies',
  'Find the latest agriculture jobs in Maharashtra including sales, field officer, agronomist, fertilizer, and agrochemical roles.',
  'Maharashtra',
  ARRAY['agriculture-sales-jobs', 'bsc-agriculture-jobs']
),
(
  'agriculture-sales-jobs',
  'Agriculture Sales Jobs in India - Sales Officer & Territory Manager Roles',
  'Apply for the best Agriculture Sales Jobs. Openings for Sales Officers, Territory Managers, and Area Managers in top agrochemical companies.',
  'Agriculture Sales Jobs in India – Sales Officer & Territory Manager Roles',
  'Explore high-paying agriculture sales opportunities. We list vacancies for Sales Officers, Territory Managers, and Regional Managers across leading fertilizer and pesticide companies.',
  'Sales',
  ARRAY['agriculture-jobs-maharashtra']
),
(
  'bsc-agriculture-jobs',
  'BSc Agriculture Jobs - Govt & Private Vacancies',
  'Latest job opportunities for BSc Agriculture graduates in seed, fertilizer, and pesticide sectors.',
  'Latest BSc Agriculture Jobs',
  'Fresh and experienced job openings specifically for BSc Agriculture graduates.',
  'BSc Agri',
  ARRAY['agriculture-sales-jobs']
)
ON CONFLICT (slug) DO NOTHING;
