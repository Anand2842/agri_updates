-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  type TEXT, -- Full-time, Contract, etc.
  salary_range TEXT,
  application_link TEXT,
  description TEXT,
  tags TEXT[], -- Array of strings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create startups table
CREATE TABLE IF NOT EXISTS startups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  funding_stage TEXT,
  location TEXT,
  website_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create posts table (for blog/news)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT, -- Rich text content
  cover_image TEXT,
  author_name TEXT,
  category TEXT,
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create applications table (for job applications)
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  resume_url TEXT, -- Path in Storage
  cover_letter TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewed, rejected, hired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  type TEXT,
  salary_range TEXT,
  application_link TEXT,
  description TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) implementation
-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Helper to safely create policies
DO $$
BEGIN
    -- Public read access policies
    DROP POLICY IF EXISTS "Public jobs are viewable by everyone" ON jobs;
    CREATE POLICY "Public jobs are viewable by everyone" ON jobs FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public startups are viewable by everyone" ON startups;
    CREATE POLICY "Public startups are viewable by everyone" ON startups FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;
    CREATE POLICY "Public posts are viewable by everyone" ON posts FOR SELECT USING (true);

    -- Authenticated/Admin policies (Placeholder: 'authenticated' role roughly means logged in user, usually admin in this context if we lock down signup)
    --Ideally we'd check for a specific admin role or email
    DROP POLICY IF EXISTS "Admins can insert jobs" ON jobs;
    CREATE POLICY "Admins can insert jobs" ON jobs FOR INSERT TO authenticated WITH CHECK (true);

    DROP POLICY IF EXISTS "Admins can update jobs" ON jobs;
    CREATE POLICY "Admins can update jobs" ON jobs FOR UPDATE TO authenticated USING (true);

    DROP POLICY IF EXISTS "Admins can delete jobs" ON jobs;
    CREATE POLICY "Admins can delete jobs" ON jobs FOR DELETE TO authenticated USING (true);

    DROP POLICY IF EXISTS "Admins can insert startups" ON startups;
    CREATE POLICY "Admins can insert startups" ON startups FOR INSERT TO authenticated WITH CHECK (true);

    DROP POLICY IF EXISTS "Admins can update startups" ON startups;
    CREATE POLICY "Admins can update startups" ON startups FOR UPDATE TO authenticated USING (true);

    DROP POLICY IF EXISTS "Admins can delete startups" ON startups;
    CREATE POLICY "Admins can delete startups" ON startups FOR DELETE TO authenticated USING (true);

    DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
    CREATE POLICY "Admins can insert posts" ON posts FOR INSERT TO authenticated WITH CHECK (true);

    DROP POLICY IF EXISTS "Admins can update posts" ON posts;
    CREATE POLICY "Admins can update posts" ON posts FOR UPDATE TO authenticated USING (true);

    DROP POLICY IF EXISTS "Admins can delete posts" ON posts;
    CREATE POLICY "Admins can delete posts" ON posts FOR DELETE TO authenticated USING (true);

    -- Form submission policies (Public insert)
    DROP POLICY IF EXISTS "Anyone can submit application" ON applications;
    CREATE POLICY "Anyone can submit application" ON applications FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Anyone can subscribe" ON subscribers;
    CREATE POLICY "Anyone can subscribe" ON subscribers FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Anyone can submit contact message" ON contact_messages;
    CREATE POLICY "Anyone can submit contact message" ON contact_messages FOR INSERT WITH CHECK (true);

    -- Admin read access for private tables
    DROP POLICY IF EXISTS "Admins can view applications" ON applications;
    CREATE POLICY "Admins can view applications" ON applications FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "Admins can view subscribers" ON subscribers;
    CREATE POLICY "Admins can view subscribers" ON subscribers FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "Admins can view contact messages" ON contact_messages;
    CREATE POLICY "Admins can view contact messages" ON contact_messages FOR SELECT TO authenticated USING (true);
END $$;
