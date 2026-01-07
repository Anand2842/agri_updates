"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function DeletePostButton({ postId, postTitle }: { postId: string, postTitle: string }) {
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
                // Refresh the page to reflect the deletion
                router.refresh();
            }
        } catch (e) {
            console.error(e);
            alert('An unexpected error occurred.');
        } finally {
            setIsDeleting(false);
        }
    };

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
