import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
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

        const { data: original, error: fetchError } = await supabaseAdmin
            .from('posts')
            .select()
            .eq('id', id)
            .single();

        if (fetchError || !original) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = original;
        const timestamp = Date.now();
        const duplicate = {
            ...rest,
            title: `Copy of ${original.title}`,
            slug: `${original.slug}-copy-${timestamp}`,
            status: 'draft',
            published_at: null,
            views: 0,
        };

        const { data, error } = await supabaseAdmin
            .from('posts')
            .insert(duplicate)
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
