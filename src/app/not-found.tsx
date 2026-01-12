"use client";

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-9xl font-serif font-bold text-agri-green/20 mb-4">404</h2>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">Page Not Found</h1>
            <p className="text-stone-500 max-w-md mb-8">
                We couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
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
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 px-6 py-3 border border-stone-200 text-stone-600 font-bold rounded-lg hover:border-black hover:text-black transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                </button>
            </div>
        </div>
    );
}
