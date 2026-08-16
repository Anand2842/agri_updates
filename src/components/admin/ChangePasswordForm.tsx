'use client'

import { useState } from 'react'
import { Lock, Check, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'
import { updateCurrentUserPassword } from '@/app/admin/team/actions'

export default function ChangePasswordForm() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus(null)

        if (password.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' })
            return
        }

        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match.' })
            return
        }

        setLoading(true)
        const res = await updateCurrentUserPassword(password)
        if (res.success) {
            setStatus({ type: 'success', message: 'Your password has been changed successfully.' })
            setPassword('')
            setConfirmPassword('')
        } else {
            setStatus({ type: 'error', message: res.error || 'Failed to update password.' })
        }
        setLoading(false)
    }

    return (
        <div className="mt-8 pt-6 border-t border-stone-100">
            <h3 className="text-lg font-bold text-stone-900 mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-agri-green" />
                Change Password
            </h3>
            <p className="text-stone-500 text-sm mb-4">
                Update the password for your administrator / staff account.
            </p>

            {status && (
                <div
                    className={`p-3.5 rounded-xl border mb-4 text-sm flex items-center gap-2.5 ${
                        status.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                >
                    {status.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <span>{status.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
                        New Password
                    </label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Updating Password...
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4" />
                            Update Password
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
