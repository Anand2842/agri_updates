require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { URL } = require('url');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const ALLOWED_DOMAINS = [
    'images.unsplash.com',
    'ulqzicqxnaygfergqrbe.supabase.co',
    'ui-avatars.com'
];

async function scanDomains() {
    console.log('Scanning for unconfigured image domains...');

    // 1. Scan Posts - NOW INCLUDING author_image
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('slug, image_url, author_image, authors(avatar_url)');

    if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
    }

    const foundDomains = new Set();
    const violations = [];

    for (const post of posts) {
        // Check post cover image
        if (post.image_url) {
            if (!post.image_url.startsWith('http')) {
                // Relative path or data URI
            } else {
                try {
                    const hostname = new URL(post.image_url).hostname;
                    foundDomains.add(hostname);
                    if (!ALLOWED_DOMAINS.includes(hostname)) {
                        violations.push({ type: 'post_image', slug: post.slug, url: post.image_url, domain: hostname });
                    }
                } catch (e) {
                    console.error(`Invalid URL in post ${post.slug}: ${post.image_url}`);
                }
            }
        }

        // Check post author_image (fallback)
        if (post.author_image) {
            if (!post.author_image.startsWith('http')) {
                // Relative path
            } else {
                try {
                    const hostname = new URL(post.author_image).hostname;
                    foundDomains.add(hostname);
                    if (!ALLOWED_DOMAINS.includes(hostname)) {
                        violations.push({ type: 'author_image_fallback', slug: post.slug, url: post.author_image, domain: hostname });
                    }
                } catch (e) {
                    console.error(`Invalid URL in post author_image ${post.slug}: ${post.author_image}`);
                }
            }
        }

        // Check author avatar (joined)
        const authors = Array.isArray(post.authors) ? post.authors : (post.authors ? [post.authors] : []);

        for (const author of authors) {
            if (author.avatar_url) {
                if (!author.avatar_url.startsWith('http')) continue;
                try {
                    const hostname = new URL(author.avatar_url).hostname;
                    foundDomains.add(hostname);
                    if (!ALLOWED_DOMAINS.includes(hostname)) {
                        violations.push({ type: 'author_avatar', slug: post.slug, url: author.avatar_url, domain: hostname });
                    }
                } catch (e) {
                    console.error(`Invalid URL in author avatar: ${author.avatar_url}`);
                }
            }
        }
    }

    console.log('--- Scan Results ---');
    console.log('Unique Domains Found:', Array.from(foundDomains));

    if (violations.length > 0) {
        console.error('❌ VIOLATIONS FOUND (Domains not in next.config.ts):');
        violations.forEach(v => {
            console.log(`- [${v.type}] Slug: ${v.slug} | Domain: ${v.domain}`);
        });
        console.log('\nFix: Add these domains to next.config.ts');
    } else {
        console.log('✅ All image domains are configured in next.config.ts');
    }
}

scanDomains();
