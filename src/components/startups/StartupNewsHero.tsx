import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/database';
import { safeDateFormat } from '@/lib/utils/date';
import { Sparkles, ArrowRight } from 'lucide-react';

interface StartupNewsHeroProps {
    post: Post;
}

export default function StartupNewsHero({ post }: StartupNewsHeroProps) {
    if (!post) return null;

    return (
        <div className="relative w-full overflow-hidden border-b border-stone-200 bg-[var(--color-paper-elevated)] group">
            <div className="relative h-[520px] md:h-[680px]">
                {post.image_url ? (
                    <>
                        <Image
                            src={post.image_url}
                            alt=""
                            fill
                            className="object-cover opacity-20 blur-3xl scale-110"
                            priority
                        />
                        <Image
                            src={post.image_url}
                            alt={post.title}
                            fill
                            className="object-contain p-6 md:p-12 transition-transform duration-700 group-hover:scale-[1.02]"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"></div>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2D5016] to-black"></div>
                )}

                <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="container mx-auto px-4 pb-12 md:pb-16 max-w-5xl">
                        <div className="max-w-3xl transform transition-transform duration-700 translate-y-4 group-hover:translate-y-0">
                            <div className="flex items-center gap-3 mb-4">
                                {post.tags && post.tags.length > 0 ? (
                                    <span className="bg-[#C9A961] text-black px-3 py-1 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                        <Sparkles size={12} />
                                        {post.tags[0]}
                                    </span>
                                ) : (
                                    <span className="bg-[#C9A961] text-black px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-lg">
                                        Featured
                                    </span>
                                )}
                                <span className="text-stone-300 text-xs font-bold uppercase tracking-widest">
                                    {safeDateFormat(post.published_at)}
                                </span>
                            </div>

                            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 drop-shadow-lg">
                                <Link href={`/blog/${post.slug}`} className="hover:text-[#E8DCC4] transition-colors">
                                    {post.title}
                                </Link>
                            </h2>

                            {post.excerpt && (
                                <p className="text-stone-200 text-base md:text-xl leading-relaxed mb-8 line-clamp-2 md:line-clamp-3 font-serif max-w-2xl drop-shadow-md">
                                    {post.excerpt}
                                </p>
                            )}

                            <div className="flex items-center gap-4">
                                <Link 
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center gap-2 bg-[#2D5016] hover:bg-white text-white hover:text-black px-6 py-3 font-bold uppercase tracking-widest text-xs transition-colors shadow-lg group-hover:pr-4"
                                >
                                    Read Full Story <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
                                </Link>
                                <span className="hidden md:block text-stone-400 text-xs font-bold uppercase tracking-widest">
                                    By {post.author_name || 'Agri Updates'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
