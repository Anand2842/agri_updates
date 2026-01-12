
'use client';

import { Comment } from '@/types/database';
import { useState, useEffect, useCallback } from 'react';
import CommentForm from './CommentForm';

// Recursive component to display comments and replies
interface CommentItemProps {
    comment: Comment;
    allComments: Comment[];
    onRefresh: () => void;
}

function CommentItem({ comment, allComments, onRefresh }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [likes, setLikes] = useState(comment.likes || 0);
    const [isLiking, setIsLiking] = useState(false);

    // Find children
    const replies = allComments.filter(c => c.parent_id === comment.id);

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        try {
            const res = await fetch(`/api/comments/${comment.id}/like`, { method: 'POST' });
            if (res.ok) {
                setLikes(prev => prev + 1);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="mb-6">
            <div className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm hover:border-stone-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center font-bold text-stone-500 text-xs">
                            {comment.user_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-stone-800 text-sm">{comment.user_name}</span>
                        <span className="text-xs text-stone-400">• {new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                <p className="text-stone-600 mb-3 text-sm leading-relaxed">{comment.content}</p>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        className="text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                        <span>♥</span> {likes} Likes
                    </button>
                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-blue-600 transition-colors"
                    >
                        Reply
                    </button>
                </div>
            </div>

            {/* Reply Form */}
            {isReplying && (
                <div className="ml-8 mt-2 border-l-2 border-stone-100 pl-4">
                    <CommentForm
                        postId={comment.post_id}
                        parentId={comment.id}
                        onCommentAdded={() => {
                            setIsReplying(false);
                            onRefresh();
                        }}
                        onCancel={() => setIsReplying(false)}
                    />
                </div>
            )}

            {/* Nested Replies */}
            {replies.length > 0 && (
                <div className="ml-8 mt-4 border-l-2 border-stone-100 pl-4 space-y-4">
                    {replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            allComments={allComments}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface CommentListProps {
    postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/comments?postId=${postId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    // Initial fetch
    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Only show top-level comments initially (others are recursively rendered)
    const rootComments = comments.filter(c => !c.parent_id);

    return (
        <div>
            <CommentForm postId={postId} onCommentAdded={fetchComments} />

            <div className="mt-8">
                <h3 className="font-serif text-xl font-bold mb-6">
                    Comments ({comments.length})
                </h3>

                {loading ? (
                    <p className="text-stone-400">Loading comments...</p>
                ) : comments.length === 0 ? (
                    <p className="text-stone-400 italic">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    <div>
                        {rootComments.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                allComments={comments}
                                onRefresh={fetchComments}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
