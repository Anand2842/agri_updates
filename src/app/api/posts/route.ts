import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Webhook API Endpoint for Creating Opportunities
 * 
 * Accepts POST requests with opportunity data (jobs, scholarships, grants, fellowships, conferences)
 * and saves them to the posts table.
 * 
 * Authentication: Requires API key in Authorization header (Bearer token)
 * 
 * Example request:
 * POST /api/posts
 * Authorization: Bearer YOUR_API_KEY
 * Content-Type: application/json
 * 
 * {
 *   "title": "Software Engineer at AgriTech Startup",
 *   "category": "Jobs",
 *   "company": "GreenHarvest Technologies",
 *   "location": "Bangalore, India",
 *   "job_type": "Full-time",
 *   "salary_range": "₹8-12 LPA",
 *   "application_link": "https://example.com/apply",
 *   "content": "We are looking for a passionate software engineer...",
 *   "tags": ["engineering", "agritech", "full-time"]
 * }
 */

// Helper function to generate URL-friendly slugs
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
}

export async function POST(request: NextRequest) {
    try {
        // 1. Validate API Key
        const authHeader = request.headers.get('authorization');
        const expectedApiKey = process.env.PLANTSAATHI_API_KEY;

        if (!expectedApiKey) {
            console.error('PLANTSAATHI_API_KEY is not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Missing or invalid Authorization header. Use: Bearer YOUR_API_KEY' },
                { status: 401 }
            );
        }

        const providedApiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
        if (providedApiKey !== expectedApiKey) {
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 401 }
            );
        }

        // 2. Parse request body
        const body = await request.json();
        const { title, ...otherFields } = body;

        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        // 3. Generate slug from title
        const baseSlug = generateSlug(title);
        const timestamp = Date.now();
        const slug = `${baseSlug}-${timestamp}`;

        // 4. Prepare post data with defaults
        const postData = {
            slug,
            title,
            author_name: otherFields.author_name || 'Agri Updates',
            is_active: otherFields.is_active !== undefined ? otherFields.is_active : true,
            published_at: new Date().toISOString(),
            ...otherFields, // Include all other fields as-is
        };

        // 5. Insert into database using admin client (bypasses RLS)
        const { data, error } = await supabaseAdmin
            .from('posts')
            .insert([postData])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to create post', details: error.message },
                { status: 500 }
            );
        }

        // 6. Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'Opportunity created successfully',
                data: {
                    id: data.id,
                    slug: data.slug,
                    title: data.title,
                    category: data.category,
                    created_at: data.created_at
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Webhook API Error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
