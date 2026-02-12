-- Migration to expand startups table for rich company profiles
DO $$
BEGIN
    -- 1. Slug (URL-friendly identifier) - critical for SEO and clean URLs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'slug') THEN
        ALTER TABLE startups ADD COLUMN slug TEXT UNIQUE;
        -- Create an index on slug for fast lookups
        CREATE INDEX IF NOT EXISTS startups_slug_idx ON startups (slug);
    END IF;

    -- 2. Logo URL (re-adding this properly now)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'logo_url') THEN
        ALTER TABLE startups ADD COLUMN logo_url TEXT;
    END IF;

    -- 3. Founded Year
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'founded_year') THEN
        ALTER TABLE startups ADD COLUMN founded_year INTEGER;
    END IF;

    -- 4. Team Size (e.g. "11-50 employees")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'team_size') THEN
        ALTER TABLE startups ADD COLUMN team_size TEXT;
    END IF;

    -- 5. Founder Names
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'founder_names') THEN
        ALTER TABLE startups ADD COLUMN founder_names TEXT; -- Comma separated or just text
    END IF;

    -- 6. Elevator Pitch (One-liner hook)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'elevator_pitch') THEN
        ALTER TABLE startups ADD COLUMN elevator_pitch TEXT;
    END IF;

    -- 7. Long Description (Markdown story)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'long_description') THEN
        ALTER TABLE startups ADD COLUMN long_description TEXT;
    END IF;

    -- 8. Success Highlights (JSONB array of {title, description, icon})
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'success_highlights') THEN
        ALTER TABLE startups ADD COLUMN success_highlights JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- 9. Challenges (JSONB array of {title, description})
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'challenges') THEN
        ALTER TABLE startups ADD COLUMN challenges JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- 10. Milestones (JSONB array of {date, title, description})
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'milestones') THEN
        ALTER TABLE startups ADD COLUMN milestones JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- 11. Social Links (JSONB object {twitter, linkedin, instagram})
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'social_links') THEN
        ALTER TABLE startups ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- 12. Funding Amount (e.g. "$5M")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'funding_amount') THEN
        ALTER TABLE startups ADD COLUMN funding_amount TEXT;
    END IF;

    -- 13. Investors (Array of strings)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'investors') THEN
        ALTER TABLE startups ADD COLUMN investors TEXT[];
    END IF;

    -- 14. Is Featured
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'is_featured') THEN
        ALTER TABLE startups ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

END $$;

-- Policy update to allow public read access to new columns (already covered by "SELECT USING (true)")
-- Policy update to allow admins to write to new columns (already covered by "WITH CHECK (true)")
