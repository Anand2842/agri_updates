'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface SidebarProps {
    currentPostId: string;
    category: string;
}

interface RelatedPost {
    id: string;
    slug: string;
    title: string;
    image_url: string | null;
    published_at: string;
}

export default function BlogSidebar({ currentPostId, category }: SidebarProps) {
    const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);

    useEffect(() => {
        async function fetchRelated() {
            const supabase = createClient();
            const { data } = await supabase
                .from('posts')
                .select('id, slug, title, image_url, published_at')
                .eq('status', 'published')
                .eq('category', category)
                .neq('id', currentPostId)
                .order('published_at', { ascending: false })
                .limit(4);

            if (data) setRelatedPosts(data);
        }
        fetchRelated();
    }, [currentPostId, category]);

    return (
        <aside className="hidden lg:block lg:col-span-3 lg:col-start-10">
            <div className="sticky top-24 space-y-8">
                {/* Related Posts */}
                <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                        Related Articles
                    </h3>
                    <div className="space-y-4">
                        {relatedPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group flex gap-3 items-start"
                            >
                                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
                                    <Image
                                        src={post.image_url || '/placeholder.jpg'}
                                        alt={post.title}
                                        fill
                                        sizes="64px"
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <h4 className="text-sm font-medium leading-snug text-stone-700 group-hover:text-agri-green transition-colors line-clamp-3">
                                    {post.title}
                                </h4>
                            </Link>
                        ))}
                        {relatedPosts.length === 0 && (
                            <p className="text-sm text-stone-400 italic">No related posts found</p>
                        )}
                    </div>
                </div>

                {/* Newsletter CTA */}
                <div className="bg-agri-green/5 border border-agri-green/20 rounded-xl p-6">
                    <h3 className="font-serif text-lg font-bold mb-2 text-stone-900">
                        Stay Updated
                    </h3>
                    <p className="text-sm text-stone-600 mb-4">
                        Get the latest agricultural opportunities delivered to your inbox.
                    </p>
                    <Link
                        href="/newsletter"
                        className="block w-full text-center bg-agri-green text-white text-sm font-bold py-2.5 rounded-lg hover:bg-agri-dark transition-colors"
                    >
                        Subscribe Free
                    </Link>
                </div>

                {/* Quick Links */}
                <div className="border-t border-stone-200 pt-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
                        Explore
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {['Jobs', 'Internships', 'Fellowships', 'Grants', 'Startups'].map((tag) => (
                            <Link
                                key={tag}
                                href={tag === 'Jobs' ? '/jobs' : tag === 'Startups' ? '/startups' : `/updates?category=${tag}`}
                                className="text-xs font-medium px-3 py-1.5 bg-stone-100 text-stone-600 rounded-full hover:bg-agri-green hover:text-white transition-colors"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
