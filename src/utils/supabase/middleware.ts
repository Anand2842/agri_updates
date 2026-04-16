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
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co https://ui-avatars.com https://www.googletagmanager.com https://www.google-analytics.com https://www.google.co.in https://www.google.com https://stats.g.doubleclick.net https://www.transparenttextures.com;
    connect-src 'self' https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net;
    font-src 'self' https://fonts.gstatic.com;
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

    // IMPORTANT: Only call getUser() — this is the secure JWT validation method.
    // Do NOT call getSession() here as well; it causes cookie-setter race conditions
    // (both calls can trigger setAll, each recreating the response object) and adds
    // unnecessary latency. Role-based access control is handled by admin/layout.tsx
    // via requireStaff(), so middleware only needs to gate on authentication.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect Admin Routes — unauthenticated users go to /login
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            // Clear any stale auth cookies before redirecting to login
            const loginRedirect = NextResponse.redirect(new URL('/login', request.url))
            request.cookies.getAll().forEach(cookie => {
                if (cookie.name.startsWith('sb-')) {
                    loginRedirect.cookies.delete(cookie.name)
                }
            })
            return loginRedirect
        }
        // Role checking (admin vs moderator vs user) is handled by admin/layout.tsx
        // via requireStaff(). Middleware just ensures authentication.
    }

    // Redirect logged-in users away from /login — go straight to dashboard
    if (request.nextUrl.pathname === '/login') {
        if (!user) {
            // No valid user — if stale Supabase cookies linger, clear them so login renders cleanly
            const hasSupabaseCookies = request.cookies.getAll().some(c => c.name.startsWith('sb-'))
            if (hasSupabaseCookies) {
                const cleanResponse = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                })
                request.cookies.getAll().forEach(cookie => {
                    if (cookie.name.startsWith('sb-')) {
                        cleanResponse.cookies.delete(cookie.name)
                    }
                })
                return cleanResponse
            }
        } else {
            // Authenticated user on /login — send them to the admin dashboard.
            // The admin layout will handle role-based access (redirect non-staff to /).
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
    }

    return response
}
