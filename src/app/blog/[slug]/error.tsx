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
        console.error('Blog Post Error:', error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-left overflow-auto max-w-2xl mx-auto">
                <p className="font-bold mb-2">Error Message:</p>
                <pre className="text-sm text-red-800 whitespace-pre-wrap">{error.message}</pre>
                {error.stack && (
                    <>
                        <p className="font-bold mt-4 mb-2">Stack Trace:</p>
                        <div className="text-xs text-red-700 font-mono whitespace-pre-wrap">
                            {error.stack}
                        </div>
                    </>
                )}
                {error.digest && (
                    <p className="text-xs text-stone-500 mt-2">Digest: {error.digest}</p>
                )}
            </div>
            <button
                onClick={() => reset()}
                className="px-6 py-2 bg-agri-green text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
