'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DeletePostButton from '@/components/admin/DeletePostButton';
import DisplayLocationSelector from '@/components/admin/DisplayLocationSelector';
import { Archive, Copy, Send, Trash2 } from 'lucide-react';

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
    [key: string]: unknown;
}

const STATUS_COLORS: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    archived: 'bg-red-100 text-red-700',
    draft: 'bg-stone-200 text-stone-600',
};

export default function PostsTable({ posts }: { posts: Post[] }) {
    const router = useRouter();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [acting, setActing] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState<Record<string, boolean>>({});
    const [duplicating, setDuplicating] = useState<Record<string, boolean>>({});
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
                showToast(data.error || 'Failed to duplicate post', 'error');
                return;
            }
            showToast('Post duplicated as draft', 'success');
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
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(posts.map(p => p.id)));
        }
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
        if (action === 'delete' && !window.confirm(`Delete ${selected.size} post(s)? This cannot be undone.`)) return;

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

    return (
        <>
            {/* Bulk action bar */}
            {hasSelection && (
                <div className="bg-black text-white px-4 py-3 mb-4 flex items-center gap-4 rounded animate-in fade-in duration-150">
                    <span className="text-xs font-bold uppercase tracking-widest">{selected.size} selected</span>
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={() => bulkAction('publish')}
                            disabled={acting}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-green-700 hover:bg-green-600 rounded transition-colors disabled:opacity-50"
                        >
                            <Send className="w-3 h-3" /> Publish
                        </button>
                        <button
                            onClick={() => bulkAction('archive')}
                            disabled={acting}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-stone-600 hover:bg-stone-500 rounded transition-colors disabled:opacity-50"
                        >
                            <Archive className="w-3 h-3" /> Archive
                        </button>
                        <button
                            onClick={() => bulkAction('delete')}
                            disabled={acting}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-red-700 hover:bg-red-600 rounded transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-3 h-3" /> Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {posts.map((post) => (
                    <div key={post.id} className={`bg-white border border-stone-200 rounded-xl p-4 transition-colors ${selected.has(post.id) ? 'bg-stone-50 border-stone-300' : ''}`}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <input
                                    type="checkbox"
                                    checked={selected.has(post.id)}
                                    onChange={() => toggleOne(post.id)}
                                    className="w-4 h-4 rounded border-stone-300 text-agri-green focus:ring-agri-green cursor-pointer mt-0.5 shrink-0"
                                />
                                <div className="min-w-0">
                                    <Link href={`/admin/posts/${post.id}`} className="font-bold text-stone-800 line-clamp-2 hover:text-agri-green text-sm">
                                        {post.title}
                                    </Link>
                                    <div className="text-xs text-stone-500 mt-1">by {post.author_name}</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <select
                                value={post.status || 'draft'}
                                onChange={(e) => handleStatusChange(post.id, e.target.value)}
                                disabled={statusUpdating[post.id]}
                                className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest border-0 cursor-pointer disabled:opacity-50 ${STATUS_COLORS[post.status || 'draft'] || STATUS_COLORS.draft}`}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                            <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-[10px] uppercase font-bold">
                                {post.category}
                            </span>
                            <span className="text-xs text-stone-400 font-mono ml-auto">{post.views || 0} views</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                            <span className="text-xs text-stone-400">
                                {new Date(post.updated_at || post.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <div className="flex items-center gap-3">
                                <DisplayLocationSelector
                                    postId={post.id}
                                    initialLocation={post.display_location || 'standard'}
                                />
                                <button
                                    onClick={() => handleDuplicate(post.id)}
                                    disabled={duplicating[post.id]}
                                    className="text-stone-400 hover:text-black disabled:opacity-50"
                                    title="Duplicate as draft"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <Link href={`/admin/posts/${post.id}`} className="text-stone-400 hover:text-black text-xs font-bold">
                                    Edit
                                </Link>
                                <DeletePostButton postId={post.id} postTitle={post.title} />
                            </div>
                        </div>
                    </div>
                ))}
                {posts.length === 0 && (
                    <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-stone-500">
                        No posts found.
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-widest text-xs border-b border-stone-200">
                            <tr>
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        className="w-4 h-4 rounded border-stone-300 text-agri-green focus:ring-agri-green cursor-pointer"
                                    />
                                </th>
                                <th className="p-4">Title</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Display</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Views</th>
                                <th className="p-4">Updated</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {posts.map((post) => (
                                <tr key={post.id} className={`hover:bg-stone-50 transition-colors ${selected.has(post.id) ? 'bg-stone-50' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(post.id)}
                                            onChange={() => toggleOne(post.id)}
                                            className="w-4 h-4 rounded border-stone-300 text-agri-green focus:ring-agri-green cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-stone-800">{post.title}</div>
                                        <div className="text-xs text-stone-500 mt-1">by {post.author_name}</div>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={post.status || 'draft'}
                                            onChange={(e) => handleStatusChange(post.id, e.target.value)}
                                            disabled={statusUpdating[post.id]}
                                            className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest border-0 cursor-pointer disabled:opacity-50 ${STATUS_COLORS[post.status || 'draft'] || STATUS_COLORS.draft}`}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </td>
                                    <td className="p-4 w-40">
                                        <DisplayLocationSelector
                                            postId={post.id}
                                            initialLocation={post.display_location || 'standard'}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-[10px] uppercase font-bold">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono font-bold text-stone-700">
                                        {post.views || 0}
                                    </td>
                                    <td className="p-4 text-stone-400 text-xs">
                                        {new Date(post.updated_at || post.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-4 text-right flex justify-end items-center gap-2">
                                        <button
                                            onClick={() => handleDuplicate(post.id)}
                                            disabled={duplicating[post.id]}
                                            className="text-stone-400 hover:text-black font-bold uppercase text-[10px] tracking-widest disabled:opacity-50"
                                            title="Duplicate as draft"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <Link href={`/admin/posts/${post.id}`} className="text-stone-400 hover:text-black font-bold uppercase text-[10px] tracking-widest">
                                            Edit
                                        </Link>
                                        <DeletePostButton postId={post.id} postTitle={post.title} />
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-stone-500">
                                        No posts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {toast && (
                <div className={`fixed bottom-4 right-4 px-4 py-3 rounded shadow-lg text-sm font-medium animate-in fade-in duration-150 z-50 ${
                    toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {toast.message}
                </div>
            )}
        </>
    );
}
