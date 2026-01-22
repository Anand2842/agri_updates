'use client';

import Link from 'next/link';
import { Post } from '@/types/database';
import { motion } from 'framer-motion';

type Props = {
    posts: Post[];
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, x: -20 },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 50,
            damping: 20
        } as const
    }
};

export default function LatestJobs({ posts }: Props) {
    const displayPosts = posts || [];

    return (
        <div>
            {/* Section Header */}
            <h3 className="section-header">Latest Jobs</h3>

            {/* List */}
            <motion.div
                className="flex flex-col gap-6"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
            >
                {displayPosts.slice(0, 4).map((post) => (
                    <motion.div key={post.id} variants={item} className="newspaper-card-minimal group">
                        <Link href={`/blog/${post.slug}`} className="block">
                            <h4 className="text-lg font-bold leading-snug mb-2 group-hover:text-agri-green transition-colors">
                                {post.title}
                            </h4>
                            <p className="text-xs text-stone-500 uppercase tracking-wide">
                                {post.company || 'Company'} • {post.location || 'Location'}
                            </p>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* View All */}
            <div className="mt-4 pt-4 border-t border-stone-200">
                <Link
                    href="/jobs"
                    className="text-[10px] font-bold uppercase tracking-widest text-agri-green hover:text-black transition-colors"
                >
                    View All Jobs →
                </Link>
            </div>
        </div>
    );
}
