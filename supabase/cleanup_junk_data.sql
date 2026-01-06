-- Cleanup Script: Remove junk/test data from production
-- Run this in Supabase SQL Editor BEFORE launching

-- 1. Delete posts with short meaningless titles or known gibberish patterns
DELETE FROM posts 
WHERE 
    LENGTH(title) < 10 
    OR title ILIKE '%dwa%' 
    OR title ILIKE '%efv%' 
    OR title ILIKE '%Hi- Greetings%'
    OR title ILIKE '%wds ewjhsbmn%'
    OR content ILIKE '%dsvgbnm gvhjbk%'
    OR content ILIKE '%hfcgvmn%'
    OR content ILIKE '%hcgvjbkn%';

-- 2. Verify cleanup
SELECT COUNT(*) as remaining_posts FROM posts;

-- 3. If posts table is now empty, re-run seed.sql to populate with real content
