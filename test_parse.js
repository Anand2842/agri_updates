const fs = require('fs');

async function testFetch() {
    const supabase = require('@supabase/supabase-js').createClient("https://ulqzicqxnaygfergqrbe.supabase.co", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscXppY3F4bmF5Z2ZlcmdxcmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwMzY5MjUsImV4cCI6MjAyMDExMjkyNX0.placeholder");
    const { data: posts, error } = await supabase.from('posts').select('content').eq('slug', 'rkvy-raftaar-agri-food-business-incubation-centre-afbic-iit-kharagpur-complete-verified-overview-jan-2026').single();

    if (error) {
        console.error("fetch err:", error.message);
        return;
    }
    const html = posts.content;
    const startIndex = html.indexOf('Updated for');
    const extract = html.substring(Math.max(0, startIndex - 50), startIndex + 300);
    console.log("--- RAW HTML SNIPPET AROUND UPDATED FOR ---");
    console.log(extract);
    console.log("-----------------------------------------");
}
testFetch();
