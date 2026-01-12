'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-center px-4 font-serif">
                    <h2 className="text-4xl font-bold text-stone-900 mb-4">Something went wrong!</h2>
                    <p className="text-stone-500 max-w-md mb-8">
                        We apologize for the inconvenience. A critical error occurred.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => reset()}
                            className="bg-black text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors"
                        >
                            Try again
                        </button>
                        <Link
                            href="/"
                            className="bg-white text-stone-600 border border-stone-200 px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-stone-100 transition-colors"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
