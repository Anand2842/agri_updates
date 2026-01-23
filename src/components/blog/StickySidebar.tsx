'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StickySidebarProps {
    children: React.ReactNode;
    triggerId?: string; // ID of the element that triggers the sidebar appearance
    offset?: number;
}

export default function StickySidebar({ children, triggerId, offset = 100 }: StickySidebarProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!triggerId) {
            // If no trigger, just show it (or use a simple scroll threshold)
            setIsVisible(true);
            return;
        }

        const handleScroll = () => {
            const triggerElement = document.getElementById(triggerId);
            if (triggerElement) {
                const rect = triggerElement.getBoundingClientRect();
                // Visible when the bottom of the trigger element passes the top of the viewport (plus offset)
                if (rect.bottom < offset) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initially

        return () => window.removeEventListener('scroll', handleScroll);
    }, [triggerId, offset]);

    return (
        <div className="sticky top-24 hidden lg:block h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pb-8">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
