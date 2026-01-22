require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log('1. Fetching a random published slug to test with...');
    const { data: posts, error: listError } = await supabase
        .from('posts')
        .select('slug')
        .eq('status', 'published')
        .limit(1);

    if (listError) {
        console.error('Failed to list posts:', listError);
        return;
    }

    if (!posts || posts.length === 0) {
        console.error('No published posts found to test with.');
        return;
    }

    const slug = posts[0].slug;
    console.log(`Found slug: ${slug}`);
    console.log('2. Attempting detailed fetch (simulating page.tsx)...');

    // Exact query from src/app/blog/[slug]/page.tsx
    const query = supabase
        .from('posts')
        .select('*, authors(*)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

    const { data, error } = await query;

    if (error) {
        console.error('❌ Detailed fetch failed!');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Hint:', error.hint);
    } else {
        console.log('✅ Detailed fetch successful!');
        console.log('Data returned structure keys:', Object.keys(data));
        if (data.authors) {
            console.log('Authors relation:', Array.isArray(data.authors) ? 'Array' : 'Object');
            console.log('Authors data:', data.authors);
        } else {
            console.log('Authors relation is null or missing.');
        }
    }
}

testFetch();
