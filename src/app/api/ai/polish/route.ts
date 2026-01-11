
import { NextRequest, NextResponse } from 'next/server';
import { polishContent } from '@/lib/ai';

export async function POST(request: NextRequest) {
    try {
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        const polishedContent = await polishContent(content);

        return NextResponse.json({ content: polishedContent });
    } catch (error) {
        console.error('API Error polish:', error);
        return NextResponse.json(
            { error: 'Failed to polish content' },
            { status: 500 }
        );
    }
}
