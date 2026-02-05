import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types/database';

interface RelatedPostsProps {
    currentPostId: string;
    category: string;
}

export default async function RelatedPosts({ currentPostId, category }: RelatedPostsProps) {
    // Fetch related posts from same category, excluding current post
    const { data: relatedPosts } = await supabase
        .from('posts')
        .select('id, title, slug, image_url, excerpt, category, published_at')
        .eq('category', category)
        .neq('id', currentPostId)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);

    if (!relatedPosts || relatedPosts.length === 0) {
        return null;
    }

    return (

        <section className="py-12 md:py-16 md:border-t md:border-stone-200 bg-white">
            <div className="container mx-auto px-4 max-w-[680px] lg:max-w-5xl">

                {/* Section Title */}
                <h2 className="font-sans text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-6 md:mb-10 md:text-center md:text-sm md:text-stone-900 md:font-serif md:text-2xl md:tracking-normal md:capitalize">
                    <span className="md:hidden">Read Next</span>
                    <span className="hidden md:inline">You May Also Like</span>
                </h2>

                {/* Mobile: Polished Document List */}
                <div className="flex flex-col gap-6 md:hidden">
                    {relatedPosts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-4 items-start border-b border-stone-100 pb-6 last:border-0 last:pb-0">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-agri-green/80">
                                        {post.category}
                                    </span>
                                    <span className="text-[9px] text-stone-300">•</span>
                                    <span className="text-[9px] text-stone-400 font-medium">5 min read</span>
                                </div>
                                <h3 className="font-serif text-[17px] font-semibold leading-[1.35] text-stone-800 group-hover:text-agri-green transition-colors line-clamp-3">
                                    {post.title}
                                </h3>
                            </div>
                            {post.image_url && (
                                <div className="relative w-24 h-24 flex-shrink-0 bg-stone-100 rounded-lg overflow-hidden ring-1 ring-black/5">
                                    <Image
                                        src={post.image_url}
                                        alt={post.title}
                                        fill
                                        sizes="96px"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Desktop: Classic Grid */}
                <div className="hidden md:grid md:grid-cols-3 gap-8">
                    {relatedPosts.map((post) => (
                        <article key={post.id} className="group">
                            <Link href={`/blog/${post.slug}`} className="block">
                                {post.image_url && (
                                    <div className="relative aspect-[16/10] mb-4 overflow-hidden rounded-lg bg-stone-100">
                                        <Image
                                            src={post.image_url}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-agri-green mb-2">
                                    {post.category}
                                </span>
                                <h3 className="font-serif text-lg font-bold leading-snug group-hover:text-agri-green transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
