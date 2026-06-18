import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getUserRole } from '@/lib/auth'
import { buildLoginRedirect } from '@/lib/safe-redirect'

type ConsentPageProps = {
    searchParams: Promise<{
        authorization_id?: string
        error?: string
    }>
}

export default async function OAuthConsentPage({ searchParams }: ConsentPageProps) {
    const params = await searchParams
    const authorizationId = params.authorization_id?.trim()

    if (!authorizationId) {
        return (
            <div className="min-h-screen bg-stone-50 px-4 py-16">
                <div className="mx-auto max-w-2xl border border-stone-200 bg-white p-8 shadow-sm">
                    <h1 className="font-serif text-3xl font-bold text-stone-900">OAuth consent request is incomplete</h1>
                    <p className="mt-3 text-sm text-stone-600">The authorization request did not include an `authorization_id`.</p>
                    <Link href="/admin/dashboard" className="mt-6 inline-flex text-sm font-bold text-black hover:underline">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        )
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect(buildLoginRedirect(`/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`, '/oauth/consent'))
    }

    const role = await getUserRole(supabase)
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId)

    if (error) {
        return (
            <div className="min-h-screen bg-stone-50 px-4 py-16">
                <div className="mx-auto max-w-2xl border border-red-200 bg-white p-8 shadow-sm">
                    <h1 className="font-serif text-3xl font-bold text-stone-900">OAuth consent is unavailable</h1>
                    <p className="mt-3 text-sm text-stone-600">{error.message}</p>
                    <Link href="/admin/dashboard" className="mt-6 inline-flex text-sm font-bold text-black hover:underline">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-stone-50 px-4 py-16">
                <div className="mx-auto max-w-2xl border border-stone-200 bg-white p-8 shadow-sm">
                    <h1 className="font-serif text-3xl font-bold text-stone-900">OAuth consent request expired</h1>
                    <p className="mt-3 text-sm text-stone-600">The authorization details could not be loaded.</p>
                </div>
            </div>
        )
    }

    if ('redirect_url' in data) {
        redirect(data.redirect_url)
    }

    const scopes = data.scope.split(/\s+/).filter(Boolean)
    const canApprove = role === 'admin'

    return (
        <div className="min-h-screen bg-stone-50 px-4 py-16">
            <div className="mx-auto max-w-2xl border border-stone-200 bg-white p-8 shadow-sm">
                <div className="mb-8 border-b border-stone-200 pb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-stone-500">Agri Updates MCP</p>
                    <h1 className="mt-3 font-serif text-3xl font-bold text-stone-900">Approve ChatGPT publishing access</h1>
                    <p className="mt-3 text-sm text-stone-600">
                        Review what this OAuth client is requesting before granting access to create drafts, upload images, and schedule posts.
                    </p>
                </div>

                {(params.error || !canApprove) && (
                    <div className="mb-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        {params.error || 'Only admin accounts can approve MCP write access for this project.'}
                    </div>
                )}

                <dl className="grid gap-4 text-sm text-stone-700 md:grid-cols-2">
                    <div>
                        <dt className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Client</dt>
                        <dd className="mt-1 font-semibold text-stone-900">{data.client.name}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Client URL</dt>
                        <dd className="mt-1 break-all">
                            <a href={data.client.uri} className="font-semibold text-stone-900 hover:underline">
                                {data.client.uri}
                            </a>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Redirect URI</dt>
                        <dd className="mt-1 break-all text-stone-900">{data.redirect_uri}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Signed in as</dt>
                        <dd className="mt-1 text-stone-900">{data.user.email}</dd>
                    </div>
                </dl>

                <div className="mt-8">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Requested scopes</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {scopes.map((scope) => (
                            <span key={scope} className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                                {scope}
                            </span>
                        ))}
                    </div>
                </div>

                <form action="/oauth/consent/decision" method="post" className="mt-10 flex flex-col gap-3 sm:flex-row">
                    <input type="hidden" name="authorization_id" value={authorizationId} />
                    <button
                        type="submit"
                        name="action"
                        value="approve"
                        disabled={!canApprove}
                        className="inline-flex justify-center bg-black px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-agri-green disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                        Approve access
                    </button>
                    <button
                        type="submit"
                        name="action"
                        value="deny"
                        className="inline-flex justify-center border border-stone-300 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-stone-700 transition-colors hover:border-black hover:text-black"
                    >
                        Deny access
                    </button>
                </form>
            </div>
        </div>
    )
}
