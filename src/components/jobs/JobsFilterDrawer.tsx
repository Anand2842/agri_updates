'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

export default function JobsFilterDrawer({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Desktop Sidebar (visible on md+) */}
            <div className="hidden md:block w-64 lg:w-72 flex-shrink-0">
                {children}
            </div>

            {/* Mobile FAB */}
            <div className="md:hidden fixed bottom-24 right-4 z-40">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-agri-green text-white font-bold uppercase tracking-widest text-xs rounded-full shadow-[0_4px_12px_rgba(45,80,22,0.4)] transition-transform active:scale-95"
                >
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>

            {/* Mobile Bottom Sheet Overlay */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity" 
                    onClick={() => setIsOpen(false)}
                >
                    {/* Sheet */}
                    <div 
                        className="w-full bg-[var(--color-paper-bg)] rounded-t-[2rem] border-t border-white/20 p-6 pb-20 max-h-[85vh] overflow-y-auto card-glass animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-2xl font-bold text-stone-900">Filters</h2>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="p-2 bg-stone-200 hover:bg-stone-300 transition-colors rounded-full text-stone-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {children}
                    </div>
                </div>
            )}
        </>
    );
}
