
import { NextRequest, NextResponse } from 'next/server';
import { polishContent } from '@/lib/ai';
import { BlogGenerator } from '@/lib/blog-generator';

// Helper function to strip HTML and normalize text
function stripHtmlAndNormalize(text: string): string {
    return text
        .replace(/<[^>]*>/g, '\n')  // Replace HTML tags with newlines
        .replace(/&nbsp;/gi, ' ')   // Replace &nbsp; with space
        .replace(/&amp;/gi, '&')    // Decode &amp;
        .replace(/&lt;/gi, '<')     // Decode &lt;
        .replace(/&gt;/gi, '>')     // Decode &gt;
        .replace(/&quot;/gi, '"')   // Decode &quot;
        .replace(/&#39;/gi, "'")    // Decode apostrophe
        .replace(/&[a-z]+;/gi, ' ') // Remove other HTML entities
        .replace(/\s+/g, ' ')       // Collapse whitespace
        .replace(/\n\s*\n/g, '\n')  // Remove empty lines
        .trim();
}

export async function POST(request: NextRequest) {
    try {
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        // CRITICAL: Clean the original content for fallback extraction
        // This handles HTML from Quill editor properly
        const cleanedOriginal = stripHtmlAndNormalize(content);

        const polishedContent = await polishContent(content);

        // Strip HTML tags to get clean text for the generator
        let plainText = polishedContent
            .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
            .replace(/&[a-z]+;/gi, ' ') // Remove HTML entities like &amp;
            .replace(/\s+/g, ' ')       // Collapse whitespace
            .trim();

        // Validate structured output - ensure no field mixing
        const validateAndCleanStructuredData = (text: string): string => {
            const structuredMatch = text.match(/---BEGIN STRUCTURED DATA---([\s\S]*?)---END STRUCTURED DATA---/i);
            if (!structuredMatch) return text;

            const block = structuredMatch[1];
            const lines = block.split('\n').filter(l => l.trim());
            const validatedLines: string[] = [];

            for (const line of lines) {
                const match = line.match(/^([A-Z_]+):\s*(.+)$/);
                if (match) {
                    const [, field, value] = match;
                    // Check if value contains other field labels (pollution)
                    const otherFields = ['POSITION', 'COMPANY', 'LOCATION', 'SALARY', 'EXPERIENCE', 'QUALIFICATION', 'DEADLINE', 'CONTACT'];
                    const isPolluted = otherFields.some(f => f !== field && value.includes(f + ':'));
                    if (!isPolluted) {
                        validatedLines.push(`${field}: ${value.trim()}`);
                    }
                }
            }

            const cleanedBlock = validatedLines.join('\n');
            return text.replace(structuredMatch[0], `---BEGIN STRUCTURED DATA---\n${cleanedBlock}\n---END STRUCTURED DATA---`);
        };

        plainText = validateAndCleanStructuredData(plainText);

        // Check if AI output has structured data block
        const hasStructuredData = /---BEGIN STRUCTURED DATA---/i.test(plainText);

        // First pass: generate with AI output (or cleaned original if no structured data)
        let textForGenerator = hasStructuredData ? plainText : cleanedOriginal;
        let generated = BlogGenerator.generate(textForGenerator);

        // Check if result has generic placeholder values
        const isGenericResult = (result: typeof generated): boolean => {
            const jobDetails = result.job_details;
            if (!jobDetails) return false;

            const genericChecks = [
                jobDetails.company === 'Private Agri Company',
                jobDetails.location === 'Pan India',
                result.title?.includes('Agricultural Professional'),
                result.title?.includes('Private Agri Company'),
            ];
            return genericChecks.some(check => check);
        };

        // If generic result detected, re-run with CLEANED original content
        if (isGenericResult(generated)) {
            generated = BlogGenerator.generate(cleanedOriginal);
        }

        return NextResponse.json({
            content: generated.content,
            title: generated.title,
            slug: generated.slug,
            excerpt: generated.excerpt,
            category: generated.category,
            job_details: generated.job_details,
        });
    } catch (error) {
        console.error('API Error polish:', error);
        return NextResponse.json(
            { error: 'Failed to polish content' },
            { status: 500 }
        );
    }
}
