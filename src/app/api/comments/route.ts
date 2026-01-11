
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');

    if (!postId) {
        return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true }); // Oldest first for threads usually, or newest. Let's do oldest to follow conversation.

    if (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { post_id, parent_id, user_name, content } = body;

        if (!post_id || !user_name || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('comments')
            .insert([
                { post_id, parent_id, user_name, content }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error adding comment:', error);
            return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error adding comment:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
