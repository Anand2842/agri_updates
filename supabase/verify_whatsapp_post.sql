SELECT id, title, slug, is_active, source, created_at 
FROM posts 
WHERE source = 'whatsapp' 
ORDER BY created_at DESC 
LIMIT 5;
