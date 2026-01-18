import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 0;

export async function GET(request: Request) {
    // 1. Verify authorization
    // In production, we expect a CRON_SECRET header to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date().toISOString();

        // 2. Find and update posts that are scheduled and due
        // We use supabaseAdmin to bypass RLS policies if necessary
        const { data, error } = await supabaseAdmin
            .from('posts')
            .update({ status: 'published' })
            .eq('status', 'scheduled')
            .lte('scheduled_for', now)
            .select('id, title, scheduled_for');

        if (error) {
            console.error('Error publishing scheduled posts:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully published ${data.length} post(s)`,
            published_count: data.length,
            posts: data
        });

    } catch (error) {
        console.error('Cron job internal error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
