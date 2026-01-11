
'use client';

import { useState } from 'react';

interface CommentFormProps {
    postId: string;
    parentId?: string | null;
    onCommentAdded: () => void;
    onCancel?: () => void;
}

export default function CommentForm({ postId, parentId = null, onCommentAdded, onCancel }: CommentFormProps) {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !content.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    post_id: postId,
                    parent_id: parentId,
                    user_name: name,
                    content: content
                })
            });

            if (res.ok) {
                setName('');
                setContent('');
                onCommentAdded();
                if (onCancel) onCancel();
            } else {
                alert('Failed to post comment');
            }
        } catch (error) {
            console.error(error);
            alert('Error posting comment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 mb-8">
            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full md:w-1/2 p-3 bg-stone-50 border border-stone-200 rounded outline-none focus:border-agri-green"
                    required
                />
            </div>
            <div className="mb-3">
                <textarea
                    rows={parentId ? 2 : 4}
                    placeholder={parentId ? "Write a reply..." : "Share your thoughts..."}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded outline-none focus:border-agri-green"
                    required
                />
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white px-6 py-2 rounded font-bold uppercase text-xs tracking-widest hover:bg-stone-800 disabled:opacity-50"
                >
                    {loading ? 'Posting...' : parentId ? 'Reply' : 'Post Comment'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-stone-500 px-4 py-2 font-bold uppercase text-xs tracking-widest hover:text-black"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
