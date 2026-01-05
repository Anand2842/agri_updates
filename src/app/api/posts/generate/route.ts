import { NextRequest, NextResponse } from 'next/server';
import { BlogGenerator } from '@/lib/blog-generator';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { rawText } = body;

        if (!rawText) {
            return NextResponse.json(
                { error: 'Raw text is required' },
                { status: 400 }
            );
        }

        const generatedPost = BlogGenerator.generate(rawText);

        return NextResponse.json({
            success: true,
            data: generatedPost
        });

    } catch (error) {
        console.error('Generation API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
