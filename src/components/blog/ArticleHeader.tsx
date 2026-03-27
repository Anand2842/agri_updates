'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Share2, X, ChevronLeft, Copy } from 'lucide-react';

interface ArticleHeaderProps {
    title: string;
}

export default function ArticleHeader({ title }: ArticleHeaderProps) {
    const [scrolled, setScrolled] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showShareMenu, setShowShareMenu] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Title visibility threshold
            setScrolled(window.scrollY > 400);

            // Compute reading progress
            const article = document.querySelector('article');
            if (article) {
                const totalHeight = article.clientHeight - window.innerHeight;
                const windowScrollTop = window.scrollY || document.documentElement.scrollTop;
                if (windowScrollTop === 0) {
                    setProgress(0);
                } else if (windowScrollTop > totalHeight) {
                    setProgress(100);
                } else {
                    setProgress((windowScrollTop / totalHeight) * 100);
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled or failed', err);
            }
        } else {
            setShowShareMenu(!showShareMenu);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setShowShareMenu(false);
        } catch (err) {
            console.log('Copy failed', err);
        }
    };

    return (
        <>
            {/* Sticky Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 border-b ${scrolled ? 'border-stone-200 shadow-sm' : 'border-transparent'}`}>
                <div className="container mx-auto px-4 h-12 md:h-14 flex items-center justify-between">
                    {/* Left: Back */}
                    <div className="flex items-center w-1/4">
                        <Link 
                            href="/blog" 
                            className="p-2 -ml-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                            aria-label="Back to Blog"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline text-stone-500">Back</span>
                        </Link>
                    </div>

                    {/* Center: Title (fades in on scroll) */}
                    <div className={`flex-1 min-w-0 text-center transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <h2 className="text-sm font-bold text-stone-900 truncate px-4">
                            {title}
                        </h2>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-end gap-1 sm:gap-2 w-1/4">
                        <button
                            onClick={handleShare}
                            className="p-2 rounded-full hover:bg-stone-100 transition-colors text-stone-600"
                            aria-label="Share Article"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar anchored to bottom of header */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-transparent">
                    <div 
                        className="h-full bg-agri-green transition-all duration-150 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Share Menu Fallback */}
            {showShareMenu && (
                <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowShareMenu(false)}>
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-stone-900">Share this article</h3>
                            <button onClick={() => setShowShareMenu(false)} className="p-2 hover:bg-stone-100 rounded-full text-stone-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={copyLink}
                                className="w-full py-3 px-4 flex items-center gap-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl font-medium text-stone-700 transition-colors"
                            >
                                <Copy className="w-5 h-5 text-stone-500" />
                                Copy Link
                            </button>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center py-3 px-4 bg-black hover:bg-stone-800 text-white rounded-xl font-medium transition-colors"
                            >
                                Share on X
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center py-3 px-4 bg-[#0a66c2] hover:bg-[#084e96] text-white rounded-xl font-medium transition-colors"
                            >
                                Share on LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
