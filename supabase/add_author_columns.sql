-- Migration to add author columns to posts table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_bio') THEN
        ALTER TABLE posts ADD COLUMN author_bio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_image') THEN
        ALTER TABLE posts ADD COLUMN author_image TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_social_twitter') THEN
        ALTER TABLE posts ADD COLUMN author_social_twitter TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_social_linkedin') THEN
        ALTER TABLE posts ADD COLUMN author_social_linkedin TEXT;
    END IF;
END $$;
