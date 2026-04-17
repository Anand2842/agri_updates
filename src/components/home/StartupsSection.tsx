'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { useState } from 'react';

// Mock data for when DB is empty
const MOCK_STARTUPS: Partial<Post>[] = [
    {
        id: 'mock-s1',
        slug: 'agritech-funding',
        title: 'BioBloom launches AI-Powered Identification App',
        excerpt: 'Instantly identify plant diseases using your smartphone camera.',
        category: 'Startups',
        tags: ['Launches'],
        image_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80',
        published_at: new Date().toISOString(),
    },
    {
        id: 'mock-s2',
        slug: 'farmtech-series-a',
        title: 'FarmByte annual revenue grows 40% in 2024',
        excerpt: 'The precision agriculture startup expands to Southeast Asian markets.',
        category: 'Startups',
        tags: ['Funding'],
        image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80',
        published_at: new Date().toISOString(),
    },
    {
        id: 'mock-s3',
        slug: 'dronetech-launch',
        title: 'Kris Electric enters E-Tractor market',
        excerpt: 'New electric tractors promise 50% cost reduction for farmers.',
        category: 'Startups',
        tags: ['Launches'],
        image_url: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&q=80',
        published_at: new Date().toISOString(),
    },
];

type Props = {
    posts: Post[];
};

export default function StartupsSection({ posts }: Props) {
    // Use real data or fallback to mock
    const displayPosts = (posts && posts.length > 0) ? posts : MOCK_STARTUPS as Post[];
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    return (
        <div className="flex flex-col h-full">
            {/* Section Header */}
            <div className="flex justify-between items-end mb-4 pb-2 border-b border-ink-black/20">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 m-0 pb-0 border-0">Startup News</h3>
            </div>

            {/* List */}
            <div className="flex flex-col gap-6 flex-grow">
                {displayPosts.slice(0, 4).map((post) => (
                    <div key={post.id} className="group relative transition-all">
                        <Link href={`/blog/${post.slug}`} className="flex gap-4 items-start">
                             {/* Thumbnail */}
                             <div className="relative w-16 h-16 flex-shrink-0 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                                <Image
                                    src={imageErrors[post.id] ? 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80' : (post.image_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80')}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
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
