SELECT id, title, slug, is_active, source, created_at, tags 
FROM posts 
WHERE source = 'whatsapp' 
ORDER BY created_at DESC 
LIMIT 5;
