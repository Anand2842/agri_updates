import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all hubs
export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('hubs')
            .select('*')
            .order('title', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch hubs' }, { status: 500 });
    }
}

// POST - Create new hub
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Validate required fields
        const { slug, title, h1, filter_tag } = body;
        if (!slug || !title || !h1 || !filter_tag) {
            return NextResponse.json(
                { error: 'Missing required fields: slug, title, h1, filter_tag' },
                { status: 400 }
            );
        }

        // Generate slug from title if not provided
        const finalSlug = slug || title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const { data, error } = await supabase
            .from('hubs')
            .insert({
                slug: finalSlug,
                title: body.title,
                description: body.description || null,
                h1: body.h1,
                intro: body.intro || null,
                filter_tag: body.filter_tag,
                filter_category: body.filter_category || 'Jobs',
                related_hubs: body.related_hubs || [],
                is_active: body.is_active ?? true,
            })
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

        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to create hub' }, { status: 500 });
    }
}
