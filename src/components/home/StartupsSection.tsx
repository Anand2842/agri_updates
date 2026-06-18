'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { useState } from 'react';
import { getPublicPostHref } from '@/lib/public-posts';

type Props = {
    posts: Post[];
};

export default function StartupsSection({ posts }: Props) {
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    if (!posts || posts.length === 0) {
        return (
            <div className="paper-panel flex h-full flex-col p-5">
                <div className="flex justify-between items-end mb-4 pb-2 border-b border-ink-black/20">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 m-0 pb-0 border-0">Startup News</h3>
                </div>
                <div className="py-12 text-center flex-grow flex flex-col justify-center">
                    <p className="font-serif text-xl text-stone-400 mb-2">Startup coverage is loading up.</p>
                    <p className="text-sm text-stone-400 mb-4">We&apos;re tracking the freshest agri-tech launches.</p>
                    <Link href="/startups" className="inline-block text-sm font-semibold text-[var(--color-forest)] hover:underline">
                        View all startup news &rarr;
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="paper-panel flex h-full flex-col p-5">
            {/* Section Header */}
            <div className="flex justify-between items-end mb-4 pb-2 border-b border-ink-black/20">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 m-0 pb-0 border-0">Startup News</h3>
            </div>

            {/* List */}
            <div className="flex flex-col gap-6 flex-grow">
                {posts.slice(0, 4).map((post) => (
                    <div key={post.id} className="group relative transition-all">
                        <Link href={getPublicPostHref(post)} className="flex gap-4 items-start">
                             {/* Thumbnail */}
                             <div className="relative w-16 h-16 flex-shrink-0 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                                <Image
                                    src={imageErrors[post.id] ? 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80' : (post.image_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80')}
                                    alt={post.title}
                                    fill
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                    onError={() => {
                                        setImageErrors(prev => ({ ...prev, [post.id]: true }));
                                    }}
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                {post.tags && post.tags.length > 0 && (
                                    <span className="inline-block px-1 py-0.5 mb-1 bg-stone-100 text-stone-600 text-[8px] font-bold uppercase tracking-widest rounded-sm group-hover:bg-agri-green group-hover:text-white transition-colors">
                                        {post.tags[0]}
                                    </span>
                                )}
                                <h4 className="font-serif text-sm font-bold leading-tight mb-1 group-hover:text-agri-green transition-colors line-clamp-2">
                                    {post.title}
                                </h4>
                                <p className="text-[11px] text-stone-500 font-serif line-clamp-1">
                                    {post.excerpt || 'Monitoring the pulse of India\'s agriculture startups.'}
                                </p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Footer Link */}
            <div className="mt-3 pt-3 border-t border-border-thin">
                <Link href="/startups" className="text-xs font-bold uppercase tracking-widest text-agri-green hover:text-agri-dark flex items-center gap-1 group">
                    View All Startup News <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
            </div>
        </div>
    );
}
