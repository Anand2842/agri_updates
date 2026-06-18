import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getUserRole } from '@/lib/auth'
import { buildLoginRedirect } from '@/lib/safe-redirect'

function consentPageUrl(authorizationId: string, error?: string) {
    const url = new URL(`http://local/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`)
    if (error) {
        url.searchParams.set('error', error)
    }
    return `${url.pathname}${url.search}`
}

export async function POST(request: Request) {
    const formData = await request.formData()
    const authorizationId = String(formData.get('authorization_id') || '').trim()
    const action = String(formData.get('action') || '').trim()

    if (!authorizationId || (action !== 'approve' && action !== 'deny')) {
        redirect('/admin/dashboard')
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect(buildLoginRedirect(consentPageUrl(authorizationId), '/oauth/consent'))
    }

    const role = await getUserRole(supabase)
    const shouldApprove = action === 'approve' && role === 'admin'
    const result = shouldApprove
        ? await supabase.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
        : await supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true })

    if (result.error) {
        redirect(consentPageUrl(authorizationId, result.error.message))
    }

    if (result.data?.redirect_url) {
        redirect(result.data.redirect_url)
    }

    redirect('/admin/dashboard')
}
