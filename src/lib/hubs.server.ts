import 'server-only';
import { createClient } from '@/utils/supabase/server';
import { Hub, HubConfig, JOB_HUBS, dbHubToConfig } from './hubs';

// Server-side function to get hub from DB
export async function getHubFromDB(slug: string): Promise<HubConfig | null> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('hubs')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            // Fall back to static config
            return JOB_HUBS[slug] || null;
        }

        return dbHubToConfig(data as Hub);
    } catch {
        // Fall back to static config on error
        return JOB_HUBS[slug] || null;
    }
}

export async function getAllHubsFromDB(): Promise<HubConfig[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('hubs')
            .select('*')
            .eq('is_active', true)
            .order('title', { ascending: true });

        if (error || !data || data.length === 0) {
            // Fall back to static config
            return Object.values(JOB_HUBS);
        }

        return (data as Hub[]).map(dbHubToConfig);
    } catch {
        // Fall back to static config on error
        return Object.values(JOB_HUBS);
    }
}

// Get all hub slugs for generateStaticParams
export async function getAllHubSlugs(): Promise<string[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('hubs')
            .select('slug')
            .eq('is_active', true);

        if (error || !data || data.length === 0) {
            return Object.keys(JOB_HUBS);
        }

        return data.map(h => h.slug);
    } catch {
        return Object.keys(JOB_HUBS);
    }
}
