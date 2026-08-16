'use client'

import { useState, useEffect, useTransition } from 'react'
import {
    Users,
    UserPlus,
    Shield,
    ShieldCheck,
    Feather,
    User,
    Search,
    RefreshCw,
    Check,
    X,
    Trash2,
    Mail,
    Lock,
    KeyRound,
    Copy,
    AlertCircle,
    CheckCircle2
} from 'lucide-react'
import {
    fetchTeamMembers,
    updateUserRole,
    inviteTeamMember,
    deleteTeamMember,
    resetTeamMemberPassword
} from './actions'
import type { UserProfile, UserRole } from '@/types/database'

export default function AdminTeamPage() {
    const [members, setMembers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [isPending, startTransition] = useTransition()

    // Status notifications
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Invite Modal State
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteName, setInviteName] = useState('')
    const [inviteRole, setInviteRole] = useState<UserRole>('moderator')
    const [invitePassword, setInvitePassword] = useState('')
    const [usePassword, setUsePassword] = useState(false)
    const [inviteSubmitting, setInviteSubmitting] = useState(false)

    // Reset Password Modal State
    const [resetTargetUser, setResetTargetUser] = useState<UserProfile | null>(null)
    const [newPasswordValue, setNewPasswordValue] = useState('')
    const [resetMode, setResetMode] = useState<'direct' | 'link'>('direct')
    const [generatedLink, setGeneratedLink] = useState<string | null>(null)
    const [copiedLink, setCopiedLink] = useState(false)
    const [resetSubmitting, setResetSubmitting] = useState(false)

    // Updating state per user
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

    const loadMembers = async () => {
        setLoading(true)
        const res = await fetchTeamMembers()
        if (res.success && res.data) {
            setMembers(res.data)
        } else {
            setStatusMessage({ type: 'error', text: res.error || 'Failed to load team members' })
        }
        setLoading(false)
    }

    useEffect(() => {
        loadMembers()
    }, [])

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        setUpdatingUserId(userId)
        startTransition(async () => {
            const res = await updateUserRole(userId, newRole)
            if (res.success) {
                setMembers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m))
                setStatusMessage({ type: 'success', text: `Role updated successfully to ${newRole}.` })
            } else {
                setStatusMessage({ type: 'error', text: res.error || 'Failed to update role.' })
            }
            setUpdatingUserId(null)
        })
    }

    const handleDeleteMember = async (userId: string, email?: string | null) => {
        if (!confirm(`Are you sure you want to remove ${email || 'this user'}? This will delete their account permanently.`)) {
            return
        }

        setDeletingUserId(userId)
        startTransition(async () => {
            const res = await deleteTeamMember(userId)
            if (res.success) {
                setMembers(prev => prev.filter(m => m.id !== userId))
                setStatusMessage({ type: 'success', text: 'Team member removed successfully.' })
            } else {
                setStatusMessage({ type: 'error', text: res.error || 'Failed to delete member.' })
            }
            setDeletingUserId(null)
        })
    }

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inviteEmail) return

        setInviteSubmitting(true)
        setStatusMessage(null)

        const res = await inviteTeamMember({
            email: inviteEmail,
            fullName: inviteName,
            role: inviteRole,
            password: usePassword && invitePassword ? invitePassword : undefined
        })

        if (res.success) {
            setStatusMessage({
                type: 'success',
                text: usePassword
                    ? `User created successfully with role: ${inviteRole}.`
                    : `Invitation sent to ${inviteEmail} with role: ${inviteRole}.`
            })
            setIsInviteOpen(false)
            setInviteEmail('')
            setInviteName('')
            setInvitePassword('')
            setUsePassword(false)
            setInviteRole('moderator')
            await loadMembers()
        } else {
            setStatusMessage({ type: 'error', text: res.error || 'Failed to invite user.' })
        }
        setInviteSubmitting(false)
    }

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!resetTargetUser) return

        setResetSubmitting(true)
        setGeneratedLink(null)
        setStatusMessage(null)

        if (resetMode === 'direct') {
            if (!newPasswordValue || newPasswordValue.length < 6) {
                setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
                setResetSubmitting(false)
                return
            }

            const res = await resetTeamMemberPassword({
                userId: resetTargetUser.id,
                newPassword: newPasswordValue
            })

            if (res.success) {
                setStatusMessage({ type: 'success', text: `Password for ${resetTargetUser.email} updated successfully.` })
                setResetTargetUser(null)
                setNewPasswordValue('')
            } else {
                setStatusMessage({ type: 'error', text: res.error || 'Failed to update password.' })
            }
        } else {
            // Generate link
            const res = await resetTeamMemberPassword({
                userId: resetTargetUser.id,
                email: resetTargetUser.email || undefined,
                sendEmail: true
            })

            if (res.success && res.recoveryLink) {
                setGeneratedLink(res.recoveryLink)
            } else {
                setStatusMessage({ type: 'error', text: res.error || 'Failed to generate reset link.' })
            }
        }
        setResetSubmitting(false)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
    }

    // Filter members
    const filteredMembers = members.filter(m => {
        const matchesSearch =
            (m.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.email || '').toLowerCase().includes(searchQuery.toLowerCase())

        if (!matchesSearch) return false
        if (roleFilter === 'all') return true
        return m.role === roleFilter
    })

    const roleCounts = {
        all: members.length,
        admin: members.filter(m => m.role === 'admin').length,
        moderator: members.filter(m => m.role === 'moderator').length,
        author: members.filter(m => m.role === 'author').length,
        user: members.filter(m => m.role === 'user').length
    }

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        Admin
                    </span>
                )
            case 'moderator':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        Moderator
                    </span>
                )
            case 'author':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Feather className="w-3.5 h-3.5 text-emerald-600" />
                        Author
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        User
                    </span>
                )
        }
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-stone-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-agri-green" />
                        Team & Role Management
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">
                        Invite staff, assign permissions, reset credentials, and manage platform roles.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadMembers}
                        disabled={loading}
                        className="px-3.5 py-2 border border-stone-200 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
                        title="Refresh list"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setIsInviteOpen(true)}
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                    >
                        <UserPlus className="w-4 h-4" />
                        Invite / Add Member
                    </button>
                </div>
            </div>

            {/* Notification alert */}
            {statusMessage && (
                <div
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        statusMessage.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {statusMessage.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium">{statusMessage.text}</span>
                    </div>
                    <button
                        onClick={() => setStatusMessage(null)}
                        className="text-stone-400 hover:text-stone-700 p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Total Users</div>
                    <div className="text-2xl font-bold text-stone-900">{roleCounts.all}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Admins
                    </div>
                    <div className="text-2xl font-bold text-purple-900">{roleCounts.admin}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> Moderators
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{roleCounts.moderator}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1 flex items-center gap-1.5">
                        <Feather className="w-3.5 h-3.5" /> Authors
                    </div>
                    <div className="text-2xl font-bold text-emerald-900">{roleCounts.author}</div>
                </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Role Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    {[
                        { key: 'all', label: 'All', count: roleCounts.all },
                        { key: 'admin', label: 'Admins', count: roleCounts.admin },
                        { key: 'moderator', label: 'Moderators', count: roleCounts.moderator },
                        { key: 'author', label: 'Authors', count: roleCounts.author },
                        { key: 'user', label: 'Users', count: roleCounts.user }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setRoleFilter(tab.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                roleFilter === tab.key
                                    ? 'bg-stone-900 text-white shadow-sm'
                                    : 'text-stone-600 hover:bg-stone-100'
                            }`}
                        >
                            {tab.label}
                            <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                                    roleFilter === tab.key ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-500'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none transition-all"
                    />
                </div>
            </div>

            {/* Members Table */}
            <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full mb-3" />
                        <p className="text-stone-400 text-sm">Loading team members...</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="p-12 text-center text-stone-400">
                        <Users className="w-12 h-12 mx-auto mb-3 text-stone-300 stroke-1" />
                        <p className="font-medium text-stone-600">No members found</p>
                        <p className="text-xs text-stone-400 mt-1">Try adjusting your search query or filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-stone-200/70 bg-stone-50/50 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                                    <th className="py-3.5 px-6">User / Name</th>
                                    <th className="py-3.5 px-6">Current Role</th>
                                    <th className="py-3.5 px-6">Role Assignment</th>
                                    <th className="py-3.5 px-6">Last Active</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-sm">
                                {filteredMembers.map(member => {
                                    const initials = (
                                        member.full_name
                                            ? member.full_name.slice(0, 2)
                                            : member.email
                                            ? member.email.slice(0, 2)
                                            : 'U'
                                    ).toUpperCase()

                                    const isUpdating = updatingUserId === member.id || isPending
                                    const isDeleting = deletingUserId === member.id

                                    return (
                                        <tr key={member.id} className="hover:bg-stone-50/50 transition-colors">
                                            {/* User Info */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-700 flex-shrink-0">
                                                        {initials}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-stone-900 truncate">
                                                            {member.full_name || 'No Name Set'}
                                                        </div>
                                                        <div className="text-xs text-stone-500 font-mono truncate">
                                                            {member.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role Badge */}
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                {getRoleBadge(member.role)}
                                            </td>

                                            {/* Role Dropdown */}
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <select
                                                    value={member.role}
                                                    disabled={isUpdating}
                                                    onChange={e => handleRoleChange(member.id, e.target.value as UserRole)}
                                                    className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:bg-white focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none cursor-pointer disabled:opacity-50"
                                                >
                                                    <option value="admin">Admin (Full Control)</option>
                                                    <option value="moderator">Moderator (Review & Drafts)</option>
                                                    <option value="author">Author (Create Own Drafts)</option>
                                                    <option value="user">Regular User (Reader)</option>
                                                </select>
                                            </td>

                                            {/* Last Active */}
                                            <td className="py-4 px-6 whitespace-nowrap text-xs text-stone-500">
                                                {member.last_sign_in_at
                                                    ? new Date(member.last_sign_in_at).toLocaleDateString(undefined, {
                                                          month: 'short',
                                                          day: 'numeric',
                                                          year: 'numeric'
                                                      })
                                                    : 'Never signed in'}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setResetTargetUser(member)
                                                            setNewPasswordValue('')
                                                            setGeneratedLink(null)
                                                            setResetMode('direct')
                                                        }}
                                                        className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                                                        title="Reset password"
                                                    >
                                                        <KeyRound className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMember(member.id, member.email)}
                                                        disabled={isDeleting}
                                                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove user"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            {isInviteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-scaleUp">
                        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-stone-900">Invite or Add Team Member</h3>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    Assign a role to grant dashboard access immediately.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsInviteOpen(false)}
                                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleInviteSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="colleague@example.com"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                                    Full Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Sarah Jenkins"
                                    value={inviteName}
                                    onChange={e => setInviteName(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                                    Role Assignment <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        {
                                            role: 'moderator' as UserRole,
                                            label: 'Moderator',
                                            desc: 'Review & Drafts',
                                            icon: Shield
                                        },
                                        {
                                            role: 'author' as UserRole,
                                            label: 'Author',
                                            desc: 'Create Drafts',
                                            icon: Feather
                                        },
                                        {
                                            role: 'admin' as UserRole,
                                            label: 'Admin',
                                            desc: 'Full Access',
                                            icon: ShieldCheck
                                        }
                                    ].map(item => {
                                        const Icon = item.icon
                                        const selected = inviteRole === item.role
                                        return (
                                            <button
                                                type="button"
                                                key={item.role}
                                                onClick={() => setInviteRole(item.role)}
                                                className={`p-3 rounded-xl border text-left transition-all ${
                                                    selected
                                                        ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                                                        : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-800'
                                                }`}
                                            >
                                                <Icon className={`w-4 h-4 mb-1 ${selected ? 'text-white' : 'text-stone-600'}`} />
                                                <div className="font-bold text-xs">{item.label}</div>
                                                <div className={`text-[10px] ${selected ? 'text-stone-300' : 'text-stone-400'}`}>
                                                    {item.desc}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-stone-100">
                                <label className="flex items-center gap-2 cursor-pointer mb-2">
                                    <input
                                        type="checkbox"
                                        checked={usePassword}
                                        onChange={e => setUsePassword(e.target.checked)}
                                        className="rounded border-stone-300 text-agri-green focus:ring-agri-green"
                                    />
                                    <span className="text-xs font-semibold text-stone-700">
                                        Set a direct password (instead of email invite)
                                    </span>
                                </label>

                                {usePassword && (
                                    <div className="relative mt-2">
                                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            placeholder="Temporary Password (min 6 chars)"
                                            minLength={6}
                                            value={invitePassword}
                                            onChange={e => setInvitePassword(e.target.value)}
                                            required={usePassword}
                                            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteOpen(false)}
                                    className="px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviteSubmitting}
                                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-md disabled:opacity-50"
                                >
                                    {inviteSubmitting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Adding Member...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            {usePassword ? 'Create Account' : 'Send Invite'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetTargetUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-scaleUp">
                        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                                    <KeyRound className="w-5 h-5 text-agri-green" />
                                    Reset Password
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5 font-mono">
                                    {resetTargetUser.email}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setResetTargetUser(null)
                                    setGeneratedLink(null)
                                }}
                                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {generatedLink ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
                                    <div className="font-semibold mb-1 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        Password Recovery Link Generated!
                                    </div>
                                    <p className="text-xs text-emerald-700">
                                        Share this link with the user to allow them to set a new password:
                                    </p>
                                </div>

                                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs break-all text-stone-700 select-all">
                                    {generatedLink}
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(generatedLink)}
                                        className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm"
                                    >
                                        {copiedLink ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied to Clipboard!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy Reset Link
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setResetMode('direct')}
                                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                                            resetMode === 'direct'
                                                ? 'border-stone-900 bg-stone-900 text-white'
                                                : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                                        }`}
                                    >
                                        <Lock className="w-4 h-4 mb-1" />
                                        Set New Password
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setResetMode('link')}
                                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                                            resetMode === 'link'
                                                ? 'border-stone-900 bg-stone-900 text-white'
                                                : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                                        }`}
                                    >
                                        <Mail className="w-4 h-4 mb-1" />
                                        Generate Recovery Link
                                    </button>
                                </div>

                                {resetMode === 'direct' ? (
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            placeholder="Enter new password (min 6 chars)"
                                            value={newPasswordValue}
                                            onChange={e => setNewPasswordValue(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                                        />
                                    </div>
                                ) : (
                                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-600 text-xs leading-relaxed">
                                        Clicking the button below will generate a secure one-time recovery URL for <strong>{resetTargetUser.email}</strong> that you can send them directly.
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                                    <button
                                        type="button"
                                        onClick={() => setResetTargetUser(null)}
                                        className="px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={resetSubmitting}
                                        className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-md disabled:opacity-50"
                                    >
                                        {resetSubmitting ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                {resetMode === 'direct' ? 'Update Password' : 'Generate Link'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
