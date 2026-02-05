'use client';

import { useState, useEffect } from 'react';
import { Share2, X } from 'lucide-react';

interface StickyReadingBarProps {
    title: string;
}

export default function StickyReadingBar({ title }: StickyReadingBarProps) {
    const [visible, setVisible] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past 300px
            setVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
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
                // User cancelled or error
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

    if (!visible) return null;

    // Truncate title for mobile
    const truncatedTitle = title.length > 40 ? title.substring(0, 40) + '...' : title;

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200 py-3 px-4 flex items-center justify-between md:hidden transform transition-transform duration-300">
                <div className="flex-1 min-w-0 mr-4">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium block">
                        Now Reading
                    </span>
                    <span className="text-xs font-semibold text-stone-800 truncate block">
                        {truncatedTitle}
                    </span>
                </div>
                <button
                    onClick={handleShare}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors flex-shrink-0"
                    aria-label="Share article"
                >
                    <Share2 className="w-4 h-4 text-stone-600" />
                </button>
            </div>

            {/* Simple share menu fallback for browsers without Web Share API */}
            {showShareMenu && (
                <div className="fixed inset-0 z-[60] bg-black/30 flex items-end md:hidden" onClick={() => setShowShareMenu(false)}>
                    <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Share this article</h3>
                            <button onClick={() => setShowShareMenu(false)} className="p-2 hover:bg-stone-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            onClick={copyLink}
                            className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium text-sm transition-colors"
                        >
                            Copy Link
                        </button>
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium text-sm text-center transition-colors"
                        >
                            Share on X (Twitter)
                        </a>
                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium text-sm text-center transition-colors"
                        >
                            Share on LinkedIn
                        </a>
                        <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-3 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium text-sm text-center transition-colors"
                        >
                            Share on WhatsApp
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}
