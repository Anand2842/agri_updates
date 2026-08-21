"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function DeletePostButton({ 
    postId, 
    postTitle,
    onDeleted,
    variant = 'icon'
}: { 
    postId: string; 
    postTitle: string;
    onDeleted?: () => void;
    variant?: 'icon' | 'inline';
}) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const supabase = createClient();

    const handleDelete = async () => {
        const confirmed = window.confirm(`Are you sure you want to delete "${postTitle}"?\nThis action cannot be undone.`);

        if (!confirmed) return;

        setIsDeleting(true);

        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);

            if (error) {
                alert(`Error deleting post: ${error.message}`);
                console.error(error);
            } else {
                if (onDeleted) {
                    onDeleted();
                }
                router.refresh();
            }
        } catch (e) {
            console.error(e);
            alert('An unexpected error occurred.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (variant === 'inline') {
        return (
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-3 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                {isDeleting ? (
                    <span className="w-3 h-3 border-2 border-red-500 border-t-transparent animate-spin rounded-full inline-block"></span>
                ) : (
                    <Trash2 className="w-3 h-3" />
                )}
                <span>Delete</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-700 disabled:opacity-50 transition-colors p-2"
            title="Delete Post"
        >
            {isDeleting ? (
                <span className="w-4 h-4 border-2 border-red-400 border-t-transparent animate-spin rounded-full inline-block"></span>
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
        </button>
    );
}
