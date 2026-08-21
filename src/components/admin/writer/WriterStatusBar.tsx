'use client';

import React, { useMemo } from 'react';
import { Maximize2, Minimize2, BookOpen } from 'lucide-react';

interface WriterStatusBarProps {
    content: string;
    isFocusMode: boolean;
    onToggleFocusMode: () => void;
}

export default function WriterStatusBar({
    content,
    isFocusMode,
    onToggleFocusMode,
}: WriterStatusBarProps) {
    const stats = useMemo(() => {
        const plainText = (content || '').replace(/<[^>]*>/g, ' ').trim();
        const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
        const chars = plainText.length;
        const readTimeMinutes = Math.max(1, Math.ceil(words / 200)); // Standard 200 WPM
        return { words, chars, readTimeMinutes };
    }, [content]);

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-20 h-9 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-4 sm:px-6 flex items-center justify-between text-[11px] text-stone-500 select-none">
            {/* Live Document Stats */}
            <div className="flex items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-700">{stats.words.toLocaleString()}</span>
                    <span>{stats.words === 1 ? 'word' : 'words'}</span>
                </div>

                <div className="hidden xs:flex items-center gap-1.5">
                    <span className="font-semibold text-stone-700">{stats.chars.toLocaleString()}</span>
                    <span>chars</span>
                </div>

                <div className="flex items-center gap-1.5 text-stone-400">
                    <span>·</span>
                    <BookOpen className="w-3 h-3 text-stone-400" />
                    <span>~{stats.readTimeMinutes} min read</span>
                </div>
            </div>

            {/* Right: Focus Mode Switcher */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onToggleFocusMode}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors ${
                        isFocusMode
                            ? 'bg-stone-900 text-white'
                            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                    title={isFocusMode ? 'Exit Focus Mode' : 'Enter Distraction-Free Focus Mode'}
                >
                    {isFocusMode ? (
                        <>
                            <Minimize2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Exit Focus</span>
                        </>
                    ) : (
                        <>
                            <Maximize2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Focus Mode</span>
                        </>
                    )}
                </button>
            </div>
        </footer>
    );
}
