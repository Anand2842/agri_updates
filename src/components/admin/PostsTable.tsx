'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DeletePostButton from '@/components/admin/DeletePostButton';
import { Archive, Copy, Send, Trash2, ChevronLeft, ChevronRight, Edit3, Eye, MoreHorizontal } from 'lucide-react';

interface Post {
    id: string;
    title: string;
    author_name: string;
    status: string;
    display_location: string;
    category: string;
    views: number;
    updated_at: string;
    created_at: string;
    slug?: string;
    [key: string]: unknown;
}

interface PostsTableProps {
    posts: Post[];
    currentPage?: number;
    totalPages?: number;
    totalCount?: number;
    filterParamsString?: string;
}

const STATUS_BADGE: Record<string, string> = {
    published: 'admin-badge admin-badge-published',
    archived: 'admin-badge admin-badge-archived',
    draft: 'admin-badge admin-badge-draft',
    scheduled: 'admin-badge admin-badge-scheduled',
    pending_review: 'admin-badge admin-badge-review',
};

const STATUS_LABEL: Record<string, string> = {
    published: 'Published',
    archived: 'Archived',
    draft: 'Draft',
    scheduled: 'Scheduled',
    pending_review: 'Review',
};

function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function PostsTable({
    posts,
    currentPage = 1,
    totalPages = 1,
    totalCount = 0,
    filterParamsString = ''
}: PostsTableProps) {
    const router = useRouter();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [acting, setActing] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState<Record<string, boolean>>({});
    const [duplicating, setDuplicating] = useState<Record<string, boolean>>({});
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [expandedActions, setExpandedActions] = useState<string | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleStatusChange = async (postId: string, newStatus: string) => {
        setStatusUpdating(prev => ({ ...prev, [postId]: true }));
        try {
            const res = await fetch(`/api/admin/posts/${postId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                const data = await res.json();
                showToast(data.error || 'Failed to update status', 'error');
                return;
            }
            showToast(`Status changed to ${newStatus}`, 'success');
            router.refresh();
        } catch {
            showToast('An unexpected error occurred', 'error');
        } finally {
            setStatusUpdating(prev => ({ ...prev, [postId]: false }));
        }
    };

    const handleDuplicate = async (postId: string) => {
        setDuplicating(prev => ({ ...prev, [postId]: true }));
        try {
            const res = await fetch(`/api/admin/posts/${postId}/duplicate`, {
                method: 'POST',
            });
            if (!res.ok) {
                const data = await res.json();
                showToast(data.error || 'Failed to duplicate', 'error');
                return;
            }
            showToast('Story duplicated as draft', 'success');
            router.refresh();
        } catch {
            showToast('An unexpected error occurred', 'error');
        } finally {
            setDuplicating(prev => ({ ...prev, [postId]: false }));
        }
    };

    const allSelected = posts.length > 0 && selected.size === posts.length;
    const hasSelection = selected.size > 0;

    const toggleAll = () => {
        if (allSelected) setSelected(new Set());
        else setSelected(new Set(posts.map(p => p.id)));
    };

    const toggleOne = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const bulkAction = async (action: 'publish' | 'archive' | 'delete') => {
        if (action === 'delete' && !window.confirm(`Delete ${selected.size} story(s)? This cannot be undone.`)) return;
        setActing(true);
        try {
            const res = await fetch('/api/admin/posts/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ids: Array.from(selected) }),
            });
            if (!res.ok) {
                const data = await res.json();
                alert(`Error: ${data.error || 'Unknown error'}`);
                return;
            }
            setSelected(new Set());
            router.refresh();
        } catch {
            alert('An unexpected error occurred.');
        } finally {
            setActing(false);
        }
    };

    const getPageUrl = (page: number) => {
        const p = new URLSearchParams(filterParamsString);
        if (page > 1) p.set('page', page.toString());
        else p.delete('page');
        const qs = p.toString();
        return `/admin/posts${qs ? `?${qs}` : ''}`;
    };

    if (posts.length === 0) {
        return (
            <div className="admin-card text-center py-16">
                <p className="text-sm text-stone-400 mb-3">No stories found</p>
                <Link href="/admin/posts/new" className="text-sm font-semibold text-stone-900 hover:text-stone-600 transition-colors">
                    + Create a new story
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-lg transition-all ${
                    toast.type === 'success' ? 'bg-stone-900 text-white' : 'bg-red-600 text-white'
                }`}>
                    {toast.message}
                </div>
            )}

            {/* Bulk action bar */}
            {hasSelection && (
                <div className="bg-stone-900 text-white px-4 py-2.5 rounded-lg flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold">{selected.size} selected</span>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => bulkAction('publish')}
                            disabled={acting}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-green-700 hover:bg-green-600 rounded-md transition-colors disabled:opacity-50"
                        >
                            <Send className="w-3 h-3" /> Publish
                        </button>
                        <button
                            onClick={() => bulkAction('archive')}
                            disabled={acting}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-stone-700 hover:bg-stone-600 rounded-md transition-colors disabled:opacity-50"
                        >
                            <Archive className="w-3 h-3" /> Archive
                        </button>
                        <button
                            onClick={() => bulkAction('delete')}
                            disabled={acting}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-red-700 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-3 h-3" /> Delete
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Dense Inbox List ─── */}
            <div className="admin-card-flush overflow-hidden">
                {/* Desktop/tablet: dense list */}
                <div className="hidden md:block">
                    {/* Header row */}
                    <div className="flex items-center gap-3 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400"
                        style={{ borderBottom: '1px solid var(--admin-border-strong)' }}>
                        <div className="w-5 shrink-0">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleAll}
                                className="w-3.5 h-3.5 rounded border-stone-300 text-stone-900 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1">Title</div>
                        <div className="w-20 text-center">Status</div>
                        <div className="w-16 text-right">Views</div>
                        <div className="w-20 text-right">Updated</div>
                        <div className="w-24 text-right">Actions</div>
                    </div>

                    {/* Rows */}
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className={`flex items-center gap-3 px-4 py-2.5 group transition-colors cursor-pointer ${
                                selected.has(post.id) ? 'bg-stone-50' : 'hover:bg-stone-50/50'
                            }`}
                            style={{ borderBottom: '1px solid var(--admin-border)' }}
                        >
                            {/* Checkbox */}
                            <div className="w-5 shrink-0">
                                <input
                                    type="checkbox"
                                    checked={selected.has(post.id)}
                                    onChange={() => toggleOne(post.id)}
                                    className="w-3.5 h-3.5 rounded border-stone-300 text-stone-900 cursor-pointer"
                                />
                            </div>

                            {/* Title + metadata */}
                            <Link href={`/admin/posts/${post.id}`} className="flex-1 min-w-0 block">
                                <h4 className="font-semibold text-sm text-stone-800 truncate group-hover:text-stone-950 transition-colors leading-tight">
                                    {post.title || 'Untitled'}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-stone-400">
                                    <span>{post.category}</span>
                                    <span>·</span>
                                    <span>{post.author_name}</span>
                                </div>
                            </Link>

                            {/* Status */}
                            <div className="w-20 text-center shrink-0">
                                <span className={STATUS_BADGE[post.status] || 'admin-badge admin-badge-draft'}>
                                    {STATUS_LABEL[post.status] || post.status}
                                </span>
                            </div>

                            {/* Views */}
                            <div className="w-16 text-right shrink-0">
                                <span className="text-sm font-medium text-stone-500 tabular-nums">
                                    {(post.views || 0).toLocaleString()}
                                </span>
                            </div>

                            {/* Updated */}
                            <div className="w-20 text-right shrink-0">
                                <span className="text-xs text-stone-400">
                                    {timeAgo(post.updated_at || post.created_at)}
                                </span>
                            </div>

                            {/* Actions (hover-visible) */}
                            <div className="w-24 flex items-center justify-end gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/admin/posts/${post.id}`}
                                    className="p-1.5 rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                                    title="Edit"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                </Link>
                                {post.slug && (
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        target="_blank"
                                        className="p-1.5 rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                                        title="Preview"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </Link>
                                )}
                                <button
                                    onClick={() => handleDuplicate(post.id)}
                                    disabled={duplicating[post.id]}
                                    className="p-1.5 rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors disabled:opacity-50"
                                    title="Duplicate"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </button>

                                {/* Status quick-switch */}
                                <div className="relative">
                                    <button
                                        onClick={() => setExpandedActions(expandedActions === post.id ? null : post.id)}
                                        className="p-1.5 rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                                        title="More"
                                    >
                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                    </button>
                                    {expandedActions === post.id && (
                                        <div className="absolute right-0 top-full mt-1 z-20 bg-white border rounded-lg shadow-lg py-1 w-36"
                                            style={{ borderColor: 'var(--admin-border-strong)' }}>
                                            {post.status !== 'published' && (
                                                <button
                                                    onClick={() => { handleStatusChange(post.id, 'published'); setExpandedActions(null); }}
                                                    disabled={statusUpdating[post.id]}
                                                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2"
                                                >
                                                    <Send className="w-3 h-3 text-green-600" /> Publish
                                                </button>
                                            )}
                                            {post.status !== 'draft' && (
                                                <button
                                                    onClick={() => { handleStatusChange(post.id, 'draft'); setExpandedActions(null); }}
                                                    disabled={statusUpdating[post.id]}
                                                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2"
                                                >
                                                    <Edit3 className="w-3 h-3 text-stone-500" /> Draft
                                                </button>
                                            )}
                                            {post.status !== 'archived' && (
                                                <button
                                                    onClick={() => { handleStatusChange(post.id, 'archived'); setExpandedActions(null); }}
                                                    disabled={statusUpdating[post.id]}
                                                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2"
                                                >
                                                    <Archive className="w-3 h-3 text-stone-400" /> Archive
                                                </button>
                                            )}
                                            <div className="my-1" style={{ borderTop: '1px solid var(--admin-border)' }} />
                                            <DeletePostButton
                                                postId={post.id}
                                                postTitle={post.title}
                                                onDeleted={() => { setExpandedActions(null); router.refresh(); }}
                                                variant="inline"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── Mobile: compact cards ─── */}
                <div className="md:hidden divide-y" style={{ borderColor: 'var(--admin-border)' }}>
                    {posts.map((post) => (
                        <div key={post.id} className="p-3.5 flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={selected.has(post.id)}
                                onChange={() => toggleOne(post.id)}
                                className="w-3.5 h-3.5 rounded border-stone-300 text-stone-900 mt-0.5 cursor-pointer shrink-0"
                            />
                            <Link href={`/admin/posts/${post.id}`} className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-stone-800 line-clamp-2 leading-snug">
                                    {post.title || 'Untitled'}
                                </h4>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span className={STATUS_BADGE[post.status] || 'admin-badge admin-badge-draft'}>
                                        {STATUS_LABEL[post.status] || post.status}
                                    </span>
                                    <span className="text-xs text-stone-400">{post.category}</span>
                                    <span className="text-xs text-stone-400">·</span>
                                    <span className="text-xs text-stone-400">{timeAgo(post.updated_at || post.created_at)}</span>
                                    {post.views > 0 && (
                                        <span className="text-xs font-medium text-stone-500 ml-auto">{post.views.toLocaleString()} views</span>
                                    )}
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Pagination ─── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-stone-400">
                        Page {currentPage} of {totalPages} · {totalCount} stories
                    </span>
                    <div className="flex items-center gap-1">
                        {currentPage > 1 ? (
                            <Link
                                href={getPageUrl(currentPage - 1)}
                                className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        ) : (
                            <span className="p-1.5 text-stone-300"><ChevronLeft className="w-4 h-4" /></span>
                        )}

                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 7) {
                                pageNum = i + 1;
                            } else if (currentPage <= 4) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 3) {
                                pageNum = totalPages - 6 + i;
                            } else {
                                pageNum = currentPage - 3 + i;
                            }
                            return (
                                <Link
                                    key={pageNum}
                                    href={getPageUrl(pageNum)}
                                    className={`min-w-[28px] h-7 flex items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                                        pageNum === currentPage
                                            ? 'bg-stone-900 text-white'
                                            : 'text-stone-500 hover:bg-stone-100'
                                    }`}
                                >
                                    {pageNum}
                                </Link>
                            );
                        })}

                        {currentPage < totalPages ? (
                            <Link
                                href={getPageUrl(currentPage + 1)}
                                className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <span className="p-1.5 text-stone-300"><ChevronRight className="w-4 h-4" /></span>
                        )}
                    </div>
                </div>
            )}

            {/* Click-outside to close expanded actions */}
            {expandedActions && (
                <div className="fixed inset-0 z-10" onClick={() => setExpandedActions(null)} />
            )}
        </div>
    );
}
