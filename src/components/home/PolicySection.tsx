import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/database';
import { safeDateFormat } from '@/lib/utils/date';
import { Scale, ArrowRight } from 'lucide-react';

interface PolicySectionProps {
    posts: Post[];
}

export default function PolicySection({ posts }: PolicySectionProps) {
    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-purple-50">
                <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-700" />
                    <h2 className="font-bold text-lg text-purple-900 tracking-tight">Policy & Schemes</h2>
                </div>
                <Link href="/category/policy" className="text-xs font-bold uppercase tracking-widest text-purple-700 hover:text-purple-900 flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="divide-y divide-stone-100 flex-grow">
                {posts.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 text-sm">
                        Please add posts with "Policy" category.
                    </div>
                ) : (
                    posts.slice(0, 4).map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="block p-5 hover:bg-purple-50/30 transition-colors group">
                            <div className="flex gap-4 items-start">
                                {post.image_url ? (
                                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-stone-200">
                                        <Image
                                            src={post.image_url}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-purple-100 flex items-center justify-center text-purple-300">
                                        <Scale className="w-8 h-8 opacity-50" />
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-bold text-stone-800 leading-snug mb-1 group-hover:text-purple-700 line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-stone-400">
                                        <span>{safeDateFormat(post.published_at)}</span>
                                        {post.policy_rules && (
                                            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                Eligibility Check
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
