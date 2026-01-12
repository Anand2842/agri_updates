import { NextRequest, NextResponse } from 'next/server';
import { BlogGenerator } from '@/lib/blog-generator';
import { supabaseAdmin } from '@/lib/supabase';

// FORCE DYNAMIC - Important for Next.js App Router API routes to avoid caching
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        console.log('Received WhatsApp Webhook Request');

        // 1. Security Check
        const authHeader = request.headers.get('authorization');
        const expectedSecret = process.env.WHATSAPP_WEBHOOK_SECRET;

        // Logs for debugging
        if (!expectedSecret) {
            console.error('SERVER ERROR: WHATSAPP_WEBHOOK_SECRET is not set in environment variables.');
            return NextResponse.json(
                { error: 'Server misconfiguration: Missing Secret' },
                { status: 500 }
            );
        }

        if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
            console.warn('Unauthorized WhatsApp Webhook access attempt');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Parse Payload
        const body = await request.json();
        const { rawText, sender } = body;

        if (!rawText || typeof rawText !== 'string') {
            return NextResponse.json(
                { error: 'Invalid payload: rawText is required' },
                { status: 400 }
            );
        }

        console.log(`Processing WhatsApp message from ${sender || 'Unknown'}...`);

        // 3. AI Generation
        // Using existing logic to determine category, format, etc.
        const generatedPost = BlogGenerator.generate(rawText);

        const { ...postData } = generatedPost;

        // 4. Save to Database (as Draft)
        // We use supabaseAdmin to bypass RLS

        const { data, error } = await supabaseAdmin
            .from('posts')
            .insert({
                title: postData.title,
                slug: postData.slug,
                content: postData.content,
                excerpt: postData.excerpt,
                category: postData.category || 'Research',
                author_name: 'Agri Bot',
                source: 'whatsapp',
                status: 'draft',
                is_active: false,
                // Spread job details if available
                ...(postData.job_details || {})
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase Insert Error:', error);
            // Fallback: If is_published column doesn't exist yet, try without it?
            // No, we should assume migration is run. 
            return NextResponse.json(
                { error: 'Database error', details: error.message },
                { status: 500 }
            );
        }

        console.log('Successfully saved draft post:', data.title);

        // 5. Success Response
        return NextResponse.json({
            success: true,
            message: 'Draft created successfully',
            post: {
                id: data.id,
                title: data.title,
                slug: data.slug,
                url: `/admin/posts/${data.id}` // Hint for the bot to possibly send back a link?
            }
        });

    } catch (error) {
        console.error('Unexpected Webhook Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
