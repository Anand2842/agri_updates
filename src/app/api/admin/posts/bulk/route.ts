import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, ids } = body;

        if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid request: action and ids array required' }, { status: 400 });
        }

        if (!['publish', 'archive', 'delete'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action. Must be publish, archive, or delete' }, { status: 400 });
        }

        if (action === 'delete') {
            const { error } = await supabaseAdmin
                .from('posts')
                .delete()
                .in('id', ids);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        } else {
            const updates: Record<string, unknown> = {
                status: action === 'publish' ? 'published' : 'archived',
            };
            if (action === 'publish') {
                updates.published_at = new Date().toISOString();
            }

            const { error } = await supabaseAdmin
                .from('posts')
                .update(updates)
                .in('id', ids);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
