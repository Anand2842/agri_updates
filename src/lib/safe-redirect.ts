export function sanitizeRelativeRedirect(target: string | null | undefined, fallback = '/admin/dashboard') {
    if (!target) return fallback
    if (!target.startsWith('/') || target.startsWith('//')) return fallback
    return target
}

export function buildLoginRedirect(target: string, fallback = '/admin/dashboard') {
    const redirect = sanitizeRelativeRedirect(target, fallback)
    return `/login?redirect=${encodeURIComponent(redirect)}`
}
