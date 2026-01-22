'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem('admin_sidebar_collapsed');
        if (stored) {
            setIsCollapsed(JSON.parse(stored));
        }
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('admin_sidebar_collapsed', JSON.stringify(newState));
    };

    // Before mount, we avoid rendering to prevent hydration mismatch with localStorage
    // Or we render a default 'expanded' state (which matches server) but with visibility hidden until client takes over?
    // Actually, simply rendering expands first is safer for SSR, then useEffect collapses it if needed.
    // The margin transition handles the jump smoothly if we want, or we accept a small layout shift.

    return (
        <div className="flex min-h-screen bg-stone-100">
            <AdminSidebar
                isCollapsed={isMounted ? isCollapsed : false}
                toggleCollapse={toggleCollapse}
            />

            <main
                className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ease-in-out ${isMounted && isCollapsed ? 'md:ml-20' : 'md:ml-64'
                    }`}
            >
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
