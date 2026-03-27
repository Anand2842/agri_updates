require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Using the keys directly from the next.js config if they exist, else we can parse the file manually
const fs = require('fs');

async function testFetch() {
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Fallback if dotenv is weird
    if (!url) {
        const envCode = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = envCode.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = envCode.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
        if (urlMatch) url = urlMatch[1].trim();
        if (keyMatch) key = keyMatch[1].trim();
    }
    
    if (!url || !key) {
        console.error("Missing supabase URL/KEY");
        return;
    }

    const supabase = createClient(url, key);
    
    const { data: posts, error } = await supabase
        .from('posts')
        .select('content')
        .eq('slug', 'big-opportunity-for-agri-startups-9016')
        .single();

    if (error) {
        console.error('Failed to fetch:', error);
        return;
    }

    const html = posts.content;
    const startIndex = html.indexOf('KSHITIJ');
    const extract = html.substring(Math.max(0, startIndex - 100), startIndex + 500);
    console.log("--- RAW HTML SNIPPET ---");
    console.log(extract);
    console.log("--- RAW HTML SNIPPET END ---");
}

testFetch();
