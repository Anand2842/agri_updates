import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// This endpoint is meant to be called by a cron job service (e.g. Vercel Cron, cron-job.org)
export async function GET(request: Request) {
    try {
        // Simple security check (optional, but recommended)
        const authHeader = request.headers.get('authorization');
        // You can set CRON_SECRET in your Vercel Environment Variables
        const cronSecret = process.env.CRON_SECRET;
        
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date().toISOString();

        console.log(`[CRON] Checking for scheduled posts at ${now}...`);

        // Find and update posts
        const { data, error } = await supabaseAdmin
            .from('posts')
            .update({ status: 'published', published_at: now })
            .eq('status', 'scheduled')
            .lte('scheduled_for', now)
            .select('id, title'); // Just return id/title for logging

        if (error) {
            console.error('[CRON] Supabase update error:', error);
            return NextResponse.json({ error: 'Failed to publish posts', details: error.message }, { status: 500 });
        }

        const publishedCount = data ? data.length : 0;
        console.log(`[CRON] Successfully published ${publishedCount} posts.`);
        if (publishedCount > 0) {
            console.log(data);
        }

        return NextResponse.json({
            success: true,
            message: `Published ${publishedCount} scheduled posts.`,
            posts: data,
        });

    } catch (error: any) {
        console.error('[CRON] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
