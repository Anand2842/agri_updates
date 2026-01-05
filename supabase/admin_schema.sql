-- Admin CRM Schema
-- Run this in your Supabase SQL Editor to verify the Admin tables

-- 1. Applicants Table
CREATE TABLE IF NOT EXISTS applicants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('New Applied', 'Screening', 'Technical Interview', 'Offer Sent', 'Hired', 'Rejected')),
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
    status TEXT CHECK (status IN ('Active Partner', 'Research Partner', 'Lead', 'Churned', 'Pending')),
    location TEXT,
    contact_email TEXT,
    website TEXT,
    health_score INTEGER DEFAULT 0,
    active_jobs INTEGER DEFAULT 0,
    total_hires INTEGER DEFAULT 0,
    logo_type TEXT DEFAULT 'default', -- for UI icon selection
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Research Projects Table
CREATE TABLE IF NOT EXISTS research_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('Active', 'Pending Review', 'Planning', 'Completed')),
    progress INTEGER DEFAULT 0,
    budget_utilized INTEGER DEFAULT 0, -- percentage
    start_date DATE DEFAULT CURRENT_DATE,
    team_count INTEGER DEFAULT 1,
    lead_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow all for demo/admin purposes)
CREATE POLICY "Allow public read applicants" ON applicants FOR SELECT USING (true);
CREATE POLICY "Allow public insert applicants" ON applicants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update applicants" ON applicants FOR UPDATE USING (true);

CREATE POLICY "Allow public read companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Allow public insert companies" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update companies" ON companies FOR UPDATE USING (true);

CREATE POLICY "Allow public read research_projects" ON research_projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert research_projects" ON research_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update research_projects" ON research_projects FOR UPDATE USING (true);


-- 4. Seed Data

-- Seed Applicants
INSERT INTO applicants (name, email, role, type, stage, match_score, image_url) VALUES 
('Aarav Patel', 'aarav.p@example.com', 'Senior Agritech Researcher', 'Full-time', 'Technical Interview', 92, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80'),
('Sarah Jenkins', 's.jenkins@design.co', 'UX/UI Designer for AI Tools', 'Contract', 'Screening', 78, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80'),
('Marcus Chen', 'm.chen@uni.edu', 'Botanical Data Analyst Intern', 'Internship', 'Offer Sent', 98, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80'),
('Elara Leafwalker', 'elara@nature.org', 'Sustainability Consultant', 'Full-time', 'New Applied', 45, NULL),
('Dr. Priyansh Gupta', 'p.gupta@research.in', 'Soil Microbiologist', 'Full-time', 'Screening', 88, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80');

-- Seed Companies
INSERT INTO companies (name, industry, status, location, contact_email, website, health_score, active_jobs, total_hires, logo_type, last_interaction) VALUES
('GreenTech Agro', 'Agri-Tech AI', 'Active Partner', 'San Francisco, CA', 'contact@greentech-agro.ai', 'www.greentech-agro.ai', 94, 3, 12, 'leaf', NOW() - INTERVAL '2 hours'),
('BioGen Labs', 'Research', 'Research Partner', 'Boston, MA', 'partnerships@biogen.edu', 'www.biogenlabs.edu', 85, 1, 5, 'micro', NOW() - INTERVAL '1 day'),
('EcoSoil Systems', 'Sustainability', 'Lead', 'Austin, TX', 'sales@ecosoil.io', 'www.ecosoil.io', 60, 0, 0, 'soil', NOW() - INTERVAL '5 days'),
('AgriDrone Sys', 'Hardware', 'Churned', 'Shenzhen, CN', 'support@agridrone.cn', 'www.agridrone.cn', 20, 0, 8, 'drone', NOW() - INTERVAL '60 days'),
('AquaCulture AI', 'Water Mgmt', 'Active Partner', 'Mumbai, IN', 'hello@aquaculture.ai', 'www.aquaculture.ai', 91, 5, 20, 'water', NOW() - INTERVAL '1 week');

-- Seed Research Projects
INSERT INTO research_projects (title, description, status, progress, budget_utilized, team_count, lead_name, start_date) VALUES
('AI-Driven Crop Yield Prediction Model', 'Developing a machine learning model to predict crop yields based on soil health and satellite imagery.', 'Active', 65, 78, 4, 'Dr. Aditi Rao', '2023-10-24'),
('Soil Microbiome Analysis', 'Comprehensive sequencing of soil bacteria in arid regions to identify drought-resistant strains.', 'Pending Review', 90, 95, 12, 'Prof. Alan Grant', '2023-08-15'),
('Vertical Farming Optimization', 'Designing energy-efficient lighting schedules for leafy greens in controlled environments.', 'Planning', 15, 10, 2, 'Sarah Lee', '2023-12-01'),
('Drought Resistance Gene Editing', 'Using CRISPR-Cas9 to target specific alleles in wheat to enhance water retention.', 'Active', 42, 50, 6, 'Dr. Chen Wei', '2023-09-10');
