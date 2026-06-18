import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status || !['draft', 'published', 'archived'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status. Must be draft, published, or archived' }, { status: 400 });
        }

        const updates: Record<string, unknown> = { status };
        if (status === 'published') {
            updates.published_at = new Date().toISOString();
        } else if (status === 'draft') {
            updates.published_at = null;
        }

        const { data, error } = await supabaseAdmin
            .from('posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ post: data });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
