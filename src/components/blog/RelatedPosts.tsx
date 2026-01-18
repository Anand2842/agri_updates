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
        <section className="container mx-auto px-4 py-12 border-t border-stone-200">
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-8 text-center">
                You May Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
        </section>
    );
}
