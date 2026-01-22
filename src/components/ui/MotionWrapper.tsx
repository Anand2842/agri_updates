'use client';

import { motion } from 'framer-motion';

export default function MotionWrapper({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: 'easeOut', duration: 0.6, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
