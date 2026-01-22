const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSlug() {
    const slug = 'seed-treatment-market';
    console.log(`Checking for slug: ${slug}...`);

    const { data, error } = await supabase
        .from('posts')
        .select('*, authors(*)')
        .eq('slug', slug)
        // .eq('status', 'published') // Temporarily comment out status check to see if it exists at all
        .single();

    if (error) {
        console.error('Supabase Error:', error);
    } else {
        console.log('Data found:', data ? 'Yes' : 'No');
        if (data) {
            console.log('Status:', data.status);
        }
    }
}

checkSlug();
