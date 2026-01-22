import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute per IP

const ipRequests = new Map<string, { count: number; expires: number }>();

function rateLimit(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    const MAX_IP_MAP_SIZE = 10000;

    // Preventive cleanup if map grows too large
    if (ipRequests.size > MAX_IP_MAP_SIZE) {
        ipRequests.clear();
    }

    // Clean up expired entries (simple optimization)
    if (Math.random() < 0.01) { // 1% chance to clean up
        for (const [key, data] of ipRequests.entries()) {
            if (data.expires < now) ipRequests.delete(key);
        }
    }

    const record = ipRequests.get(ip);

    if (record && record.expires > now) {
        if (record.count >= MAX_REQUESTS) {
            return true; // Rate limited
        }
        record.count++;
    } else {
        ipRequests.set(ip, { count: 1, expires: now + RATE_LIMIT_WINDOW });
    }

    return false;
}

export async function middleware(request: NextRequest) {
    if (rateLimit(request)) {
        return new NextResponse('Too Many Requests', { status: 429 });
    }
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - sitemap.xml
         * - robots.txt
         * Note: API routes are included for rate limiting if we remove 'api' from exclusion,
         * but currently the pattern EXCLUDES 'api'.
         * Let's UPDATE the matcher to INCLUDE 'api' for protection, assuming updateSession handles it gracefully.
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
