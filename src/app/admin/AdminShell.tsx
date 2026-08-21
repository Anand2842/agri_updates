'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import CommandPalette from '@/components/admin/CommandPalette';
import type { User } from '@supabase/supabase-js';

export default function AdminShell({ children, user, role }: { children: React.ReactNode, user: User | null, role?: string }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const pathname = usePathname();

    // Writer routes auto-collapse the sidebar for maximum canvas space
    const isWriterRoute = pathname?.startsWith('/admin/posts/new') || 
        (pathname?.startsWith('/admin/posts/') && pathname !== '/admin/posts' && !pathname?.includes('generate'));

    useEffect(() => {
        const stored = localStorage.getItem('admin_sidebar_collapsed');
        if (stored) {
            setIsCollapsed(JSON.parse(stored));
        }
        setIsMounted(true);
    }, []);

    const toggleCollapse = useCallback(() => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('admin_sidebar_collapsed', JSON.stringify(newState));
    }, [isCollapsed]);

    // ⌘K / Ctrl+K — Open Command Palette
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const effectiveCollapsed = isMounted ? (isWriterRoute || isCollapsed) : false;

    return (
        <div className="flex flex-col md:flex-row min-h-screen" style={{ background: 'var(--admin-bg, #F5F5F2)' }} data-admin-shell>
            <AdminSidebar
                isCollapsed={effectiveCollapsed}
                toggleCollapse={toggleCollapse}
                user={user}
                role={role}
            />

            <main
                className={`flex-1 overflow-y-auto px-4 py-5 pb-24 md:px-8 md:py-6 md:pb-8 transition-all duration-300 ease-in-out ${
                    effectiveCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'
                }`}
            >
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Global ⌘K Command Palette */}
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
            />
        </div>
    );
}
