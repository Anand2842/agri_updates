import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';

export default function MainHero({ post }: { post: Post }) {
    if (!post) return null;

    return (
        <div className="flex flex-col w-full h-full p-6 border border-stone-200 bg-stone-50">
            <Link href={`/blog/${post.slug}`} className="relative aspect-[16/9] w-full overflow-hidden block mb-6 group">
                <Image
                    src={post.image_url || '/placeholder.jpg'}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 1200px) 100vw, 800px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {post.is_featured && (
                    <div className="absolute top-0 right-0 bg-agri-green text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 m-4 z-10">
                        Featured
                    </div>
                )}
            </Link>

            <div className="text-center px-4">
                <div className="flex justify-center items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-4">
                    <span className="text-agri-green border-b border-agri-green pb-0.5">{post.category}</span>
                    <span>•</span>
                    <span>{new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>

                <h2 className="font-serif text-3xl md:text-5xl font-black leading-tight mb-6 hover:text-agri-dark transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                        {post.title}
                    </Link>
                </h2>

                <p className="text-stone-600 font-serif text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                    {post.excerpt}
                </p>

                {/* Hero Search Bar */}
                <div className="max-w-xl mx-auto mb-10">
                    <form action="/search" method="GET" className="relative flex items-center">
                        <input
                            type="text"
                            name="q"
                            placeholder="Search jobs, internships, or funding..."
                            className="w-full pl-6 pr-14 py-4 border-2 border-stone-200 rounded-full text-stone-600 focus:outline-none focus:border-agri-green focus:ring-0 text-sm shadow-sm transition-all"
                        />
                        <button type="submit" className="absolute right-2 p-3 bg-agri-green rounded-full text-white hover:bg-agri-dark transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                    </form>
                </div>

                <div className="w-16 h-1 bg-black mx-auto"></div>
            </div>
        </div>
    );
}
