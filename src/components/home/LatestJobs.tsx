'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { getPublicPostHref } from '@/lib/public-posts';

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
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    if (!displayPosts || displayPosts.length === 0) {
        return (
            <div className="paper-panel p-5">
                <h3 className="section-header mb-4">Latest Jobs</h3>
                <div className="py-12 text-center">
                    <p className="font-serif text-xl text-stone-400 mb-2">No openings posted yet.</p>
                    <p className="text-sm text-stone-400 mb-4">New roles in agri show up every week.</p>
                    <Link href="/jobs" className="inline-block text-sm font-semibold text-[var(--color-forest)] hover:underline">
                        View all jobs &rarr;
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="paper-panel p-5">
            {/* Section Header */}
            <h3 className="section-header mb-4">Latest Jobs</h3>

            {/* List */}
            <motion.div
                className="flex flex-col gap-6"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
            >
                {displayPosts.slice(0, 4).map((post) => (
                    <motion.div key={post.id} variants={item} className="group relative transition-all">
                        <Link href={getPublicPostHref(post)} className="flex gap-4 items-start">
                            {/* Image Thumbnail with Fallback */}
                            <div className="relative w-16 h-16 flex-shrink-0 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                                <Image
                                    src={imageErrors[post.id] ? 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80' : (post.image_url || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80')}
                                    alt={post.title}
                                    fill
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                    onError={() => {
                                        setImageErrors(prev => ({ ...prev, [post.id]: true }));
                                    }}
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-serif text-sm font-bold leading-tight mb-2 group-hover:text-agri-green transition-colors line-clamp-2">
                                    {post.title}
                                </h4>
                                <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold font-serif truncate">
                                    {post.company || 'Agri Firm'} • {post.location || 'India'}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* View All */}
            <div className="mt-3 pt-3 border-t border-stone-200">
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
