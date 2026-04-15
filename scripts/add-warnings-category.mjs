// Quick script to add missing "Warnings" category to the database
// Run: node scripts/add-warnings-category.mjs

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
    // Check existing categories
    const { data: existing } = await supabase.from('categories').select('name').order('name');
    console.log('Current categories:', existing?.map(c => c.name).join(', '));

    // Add "Warnings" if missing
    const hasWarnings = existing?.some(c => c.name === 'Warnings');
    if (!hasWarnings) {
        const { error } = await supabase.from('categories').insert({
            name: 'Warnings',
            slug: 'warnings',
            description: 'Agri warnings, pest alerts, weather advisories, and regulatory notices',
            is_active: true,
        });
        if (error) {
            console.error('Failed to add Warnings:', error.message);
        } else {
            console.log('✅ "Warnings" category added successfully!');
        }
    } else {
        console.log('ℹ️  "Warnings" already exists');
    }

    // Verify final state
    const { data: final } = await supabase.from('categories').select('name, is_active').order('name');
    console.log('\nFinal categories:');
    final?.forEach(c => console.log(`  ${c.is_active ? '✅' : '❌'} ${c.name}`));
}

main();
