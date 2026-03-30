"use client";

import Link from 'next/link';
import { Home, ShieldOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <ShieldOff className="w-16 h-16 text-agri-green/30 mb-6" />
            <h2 className="text-7xl font-serif font-bold text-agri-green/20 mb-4">403</h2>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">Access Denied</h1>
            <p className="text-stone-500 max-w-md mb-8">
                You don&apos;t have permission to view this page. Please contact an administrator if you think this is a mistake.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 bg-agri-green text-white font-bold rounded-lg hover:bg-agri-dark transition-colors"
                >
                    <Home className="w-4 h-4" />
                    Go Home
                </Link>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-6 py-3 border border-stone-200 text-stone-600 font-bold rounded-lg hover:border-black hover:text-black transition-colors"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}
