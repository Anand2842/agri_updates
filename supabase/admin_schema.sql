-- Admin CRM Schema (Safe / Idempotent Version)
-- Run this in your Supabase SQL Editor to set up Admin tables
-- This version is safe to run multiple times

-- 1. Applicants Table
CREATE TABLE IF NOT EXISTS applicants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL,
    stage TEXT NOT NULL,
    type TEXT DEFAULT 'Full-time',
    match_score INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to companies (safe to run if they already exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'location') THEN
        ALTER TABLE companies ADD COLUMN location TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'contact_email') THEN
        ALTER TABLE companies ADD COLUMN contact_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'website') THEN
        ALTER TABLE companies ADD COLUMN website TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'health_score') THEN
        ALTER TABLE companies ADD COLUMN health_score INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'active_jobs') THEN
        ALTER TABLE companies ADD COLUMN active_jobs INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'total_hires') THEN
        ALTER TABLE companies ADD COLUMN total_hires INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'logo_type') THEN
        ALTER TABLE companies ADD COLUMN logo_type TEXT DEFAULT 'default';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'last_interaction') THEN
        ALTER TABLE companies ADD COLUMN last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Research Projects Table
CREATE TABLE IF NOT EXISTS research_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT,
    progress INTEGER DEFAULT 0,
    budget_utilized INTEGER DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    team_count INTEGER DEFAULT 1,
    lead_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (safe to run multiple times)
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;

-- Create Policies (DROP IF EXISTS then CREATE to be idempotent)
DROP POLICY IF EXISTS "Allow public read applicants" ON applicants;
DROP POLICY IF EXISTS "Allow public insert applicants" ON applicants;
DROP POLICY IF EXISTS "Allow public update applicants" ON applicants;
CREATE POLICY "Allow public read applicants" ON applicants FOR SELECT USING (true);
CREATE POLICY "Allow public insert applicants" ON applicants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update applicants" ON applicants FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read companies" ON companies;
DROP POLICY IF EXISTS "Allow public insert companies" ON companies;
DROP POLICY IF EXISTS "Allow public update companies" ON companies;
CREATE POLICY "Allow public read companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Allow public insert companies" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update companies" ON companies FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read research_projects" ON research_projects;
DROP POLICY IF EXISTS "Allow public insert research_projects" ON research_projects;
DROP POLICY IF EXISTS "Allow public update research_projects" ON research_projects;
CREATE POLICY "Allow public read research_projects" ON research_projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert research_projects" ON research_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update research_projects" ON research_projects FOR UPDATE USING (true);

-- 4. Seed Data
-- NOTE: Seed data removed to avoid conflicts with existing enum types.
-- The tables are now set up and ready to use. Add data manually via the dashboard or Supabase UI.
