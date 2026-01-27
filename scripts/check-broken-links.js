const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Native fetch is available in Node 18+
// If running in older node, might need node-fetch, but let's try native first.

async function checkLinks() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Checking Active Ads ---');
    const { data: ads, error: adsError } = await supabase
        .from('ads')
        .select('id, title, image_url, placement')
        .eq('is_active', true);

    if (adsError) {
        console.error('Error fetching ads:', adsError);
    } else {
        console.log(`Found ${ads.length} active ads.`);
        for (const ad of ads) {
            if (ad.image_url) {
                await checkUrl(ad.image_url, `Ad - ${ad.title} (${ad.placement})`);
            }
        }
    }

    console.log('\n--- Checking Published Posts ---');
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, slug, title, image_url')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50); // Check recent 50 first

    if (postsError) {
        console.error('Error fetching posts:', postsError);
    } else {
        console.log(`Found ${posts.length} published posts.`);
        for (const post of posts) {
            if (post.image_url) {
                await checkUrl(post.image_url, `Post - ${post.title}`);
            }
        }
    }
}

async function checkUrl(url, context) {
    if (!url) return;
    if (!url.startsWith('http')) {
        // Relative URL - might be local
        console.log(`⚠️  [Local] ${context}: ${url}`);
        return;
    }

    try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
            // console.log(`✅ ${context}: ${url}`); // Verbose
        } else {
            if (res.status === 404) {
                console.error(`❌ [404] ${context}: ${url}`);
            } else {
                // Retry with GET
                const resGet = await fetch(url, { method: 'GET' });
                if (resGet.ok) {
                    // console.log(`✅ (GET) ${context}: ${url}`);
                } else {
                    console.error(`❌ [${resGet.status}] ${context}: ${url}`);
                }
            }
        }
    } catch (err) {
        console.error(`❌ [Error] ${context}: ${url} (${err.message})`);
    }
}

checkLinks();
