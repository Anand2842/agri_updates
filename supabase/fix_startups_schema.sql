-- check and add missing columns for startups table
DO $$
BEGIN
    -- Add funding_stage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'funding_stage') THEN
        ALTER TABLE startups ADD COLUMN funding_stage TEXT;
    END IF;

    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'location') THEN
        ALTER TABLE startups ADD COLUMN location TEXT;
    END IF;

    -- Add website_url column if it doesn't exist (previously might have been logo_url or missing)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'website_url') THEN
        ALTER TABLE startups ADD COLUMN website_url TEXT;
    END IF;

    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'tags') THEN
        ALTER TABLE startups ADD COLUMN tags TEXT[];
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups' AND column_name = 'description') THEN
        ALTER TABLE startups ADD COLUMN description TEXT;
    END IF;

    -- Add logo_url column if it doesn't exist (it was removed from code but DB might want it, actually code removed it so likely not needed, but no harm having it for legacy or future)
    -- Actually, code definitely removed it, so maybe don't add it.
    
    -- Ensure Row Level Security is enabled
    ALTER TABLE startups ENABLE ROW LEVEL SECURITY;

END $$;

-- Re-apply policies to be safe (idempotent if using CREATE OR REPLACE or dropping first)
DROP POLICY IF EXISTS "Public startups are viewable by everyone" ON startups;
CREATE POLICY "Public startups are viewable by everyone" ON startups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert startups" ON startups;
CREATE POLICY "Admins can insert startups" ON startups FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update startups" ON startups;
CREATE POLICY "Admins can update startups" ON startups FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can delete startups" ON startups;
CREATE POLICY "Admins can delete startups" ON startups FOR DELETE TO authenticated USING (true);
