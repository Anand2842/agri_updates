const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('posts')
    .select('content')
    .eq('slug', 'big-opportunity-for-agri-startups-9016')
    .single();
    
  if (error) {
    console.error("Error:", error);
    process.exit(1);
  }
  
  console.log("--- RAW HTML START ---");
  console.log(data.content.substring(0, 1500));
  console.log("--- RAW HTML END ---");
}

run();
