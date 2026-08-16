'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { useState } from 'react';
import { getPublicPostHref } from '@/lib/public-posts';
import { Rocket, ArrowRight } from 'lucide-react';

type Props = {
    posts: Post[];
};

export default function StartupsSection({ posts }: Props) {
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    if (!posts || posts.length === 0) {
        return (
            <div className="paper-panel p-5 bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-900 flex items-center justify-center">
                        <Rocket className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        AgriTech Startups
                    </h3>
                </div>
                <div className="py-12 text-center">
                    <p className="text-xs text-slate-400">Startup intelligence is loading.</p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                    <Link href="/startups" className="text-xs font-semibold text-teal-900 hover:underline">
                        View all startups &rarr;
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="paper-panel p-5 bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
            <div>
                {/* Section Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-900 flex items-center justify-center">
                            <Rocket className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            AgriTech Ventures
                        </h3>
                    </div>
                    <span className="text-[10px] font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        Innovation
                    </span>
                </div>

                {/* List */}
                <div className="divide-y divide-slate-100">
                    {posts.slice(0, 4).map((post) => (
                        <div key={post.id} className="group py-3 first:pt-0 last:pb-0">
                            <Link href={getPublicPostHref(post)} className="flex gap-3 items-start">
                                <div className="relative w-14 h-14 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                    <Image
                                        src={imageErrors[post.id] ? 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80' : (post.image_url || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80')}
                                        alt={post.title}
                                        fill
                                        sizes="60px"
                                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                        onError={() => {
                                            setImageErrors(prev => ({ ...prev, [post.id]: true }));
                                        }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-teal-900 transition-colors line-clamp-2 mb-1">
                                        {post.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 line-clamp-1">
                                        {post.excerpt || 'Venture funding, drone robotics, and bio-tech innovation.'}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Link */}
            <div className="pt-4 mt-3 border-t border-slate-100">
                <Link
                    href="/startups"
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-teal-50/60 hover:bg-teal-50 text-xs font-bold text-teal-900 border border-teal-200/80 transition-all"
                >
                    <span>Explore Startup Index</span>
                    <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
