-- Migration to add draft support to posts table
DO $$
BEGIN
    -- Add is_published column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_published') THEN
        ALTER TABLE posts ADD COLUMN is_published BOOLEAN DEFAULT true;
    END IF;

    -- Add original_source column to track where the post came from (e.g. 'whatsapp', 'admin')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'source') THEN
        ALTER TABLE posts ADD COLUMN source TEXT DEFAULT 'admin';
    END IF;
END $$;
