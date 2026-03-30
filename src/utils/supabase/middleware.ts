import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getRequiredSupabaseClientConfig } from '@/lib/supabase-config'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Security Headers (Preserving existing logic)
    const nonce = btoa(crypto.randomUUID());
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co https://ui-avatars.com https://www.googletagmanager.com https://www.google-analytics.com https://www.google.co.in https://www.google.com https://stats.g.doubleclick.net https://www.transparenttextures.com;
    connect-src 'self' https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
    // Pass nonce to request (for potential usage in layout)
    response.headers.set('x-nonce', nonce);
    const { url, publishableKey } = getRequiredSupabaseClientConfig()

    const supabase = createServerClient(
        url,
        publishableKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })

                    // CRITICAL FIX: Explicitly sync Next.js's parsed cookies back into the raw HTTP 'cookie' header.
                    // If we don't do this, Next.js Server Components reading `headers()` or `cookies()` will
                    // completely ignore our refreshed token and throw an Auth error (causing redirect loops).
                    const updatedCookieStr = request.cookies
                        .getAll()
                        .map((c) => `${c.name}=${c.value}`)
                        .join('; ')
                    request.headers.set('cookie', updatedCookieStr)

                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    // Re-apply headers to the new response object
                    response.headers.set('Content-Security-Policy', cspHeader);
                    response.headers.set('X-Frame-Options', 'DENY');
                    response.headers.set('X-Content-Type-Options', 'nosniff');
                    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
                    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
                    response.headers.set('x-nonce', nonce);

                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const adminEmailEnv = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    
    // Fetch profile role once for downstream routing decisions.
    // Profiles are publicly readable in our current RLS, so this is safe to run here.
    let role: 'admin' | 'moderator' | 'user' = 'user'
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()
        if (profile?.role === 'admin' || profile?.role === 'moderator') {
            role = profile.role
        } else if (user.email && adminEmailEnv.includes(user.email.toLowerCase())) {
            role = 'admin'
        }
    }

    // Protect Admin Routes — unauthenticated users go to /login
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        // If authenticated but not staff, send to home to avoid loops
        if (role === 'user') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Redirect logged-in users away from /login — go straight to dashboard
    if (request.nextUrl.pathname === '/login' && user) {
        if (role === 'admin' || role === 'moderator') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
        // Non-staff users stay on site home when already authenticated
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}
