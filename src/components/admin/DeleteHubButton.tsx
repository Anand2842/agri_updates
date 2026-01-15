'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteHubButtonProps {
    hubId: string;
    hubTitle: string;
}

export default function DeleteHubButton({ hubId, hubTitle }: DeleteHubButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/hubs/${hubId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete hub');
            }

            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete hub');
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-red-600">Delete?</span>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 font-bold uppercase text-[10px] tracking-widest disabled:opacity-50"
                >
                    {loading ? '...' : 'Yes'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    className="text-stone-400 hover:text-stone-600 font-bold uppercase text-[10px] tracking-widest"
                >
                    No
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="text-stone-400 hover:text-red-600 transition-colors"
            title={`Delete ${hubTitle}`}
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
