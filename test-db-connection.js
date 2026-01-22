require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase environment variables in .env.local');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);

    // Try to fetch a single row from a likely table. 
    // 'posts' is common for a blog, but let's try to list tables or just check health if possible.
    // We'll try 'posts' first as it's a blog.
    const { data, error } = await supabase.from('posts').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Connection failed or table "posts" not accessible:', error.message);
        // Try another table if posts fails, or just report error
        console.log('Trying "profiles" table...');
        const { data: profiles, error: profilesError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

        if (profilesError) {
            console.error('Connection failed on "profiles" as well:', profilesError.message);
        } else {
            console.log('Connection successful (verified via "profiles" table)!');
        }
    } else {
        console.log('Connection successful (verified via "posts" table)!');
    }
}

testConnection();
