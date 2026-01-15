import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET - Get single hub
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('hubs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return NextResponse.json({ error: 'Hub not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch hub' }, { status: 500 });
    }
}

// PUT - Update hub
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const supabase = await createClient();
        const body = await request.json();

        const { data, error } = await supabase
            .from('hubs')
            .update({
                slug: body.slug,
                title: body.title,
                description: body.description,
                h1: body.h1,
                intro: body.intro,
                filter_tag: body.filter_tag,
                filter_category: body.filter_category || 'Jobs',
                related_hubs: body.related_hubs || [],
                is_active: body.is_active,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'A hub with this slug already exists' },
                    { status: 409 }
                );
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update hub' }, { status: 500 });
    }
}

// DELETE - Delete hub
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const supabase = await createClient();

        const { error } = await supabase
            .from('hubs')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to delete hub' }, { status: 500 });
    }
}
