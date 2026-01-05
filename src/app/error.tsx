'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center border border-stone-200">
                <h2 className="font-serif text-2xl font-bold mb-4 text-red-600">Something went wrong!</h2>
                <p className="text-stone-500 mb-6">
                    We apologize for the inconvenience. Our team has been notified.
                </p>
                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="bg-agri-green text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-agri-dark transition-colors rounded"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
