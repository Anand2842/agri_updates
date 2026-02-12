import Link from 'next/link'
import { Job, Post } from '@/types/database'
import { ArrowRight, Briefcase, FileText } from 'lucide-react'

interface RelatedContentProps {
    jobs: Job[]
    posts: Post[]
    startupName: string
}

export default function RelatedContent({ jobs, posts, startupName }: RelatedContentProps) {
    if (jobs.length === 0 && posts.length === 0) return null

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Related Jobs */}
            {jobs.length > 0 && (
                <div>
                    <div className="flex justify-between items-baseline mb-6">
                        <h3 className="font-serif text-2xl font-bold">Open Roles</h3>
                        <Link href={`/jobs?q=${encodeURIComponent(startupName)}`} className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-agri-green flex items-center gap-1 group">
                            View All <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {jobs.slice(0, 3).map(job => (
                            <Link key={job.id} href={`/jobs/${job.id}`} className="block bg-white border border-stone-200 p-5 hover:border-black transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-lg group-hover:text-agri-green transition-colors">{job.title}</h4>
                                    <span className="bg-stone-100 text-[10px] font-bold uppercase px-2 py-1 text-stone-500">{job.type || 'Full-time'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-stone-500 font-bold uppercase tracking-wide">
                                    <span className="flex items-center gap-1"><Briefcase size={12} /> {job.location || 'Remote'}</span>
                                    {job.salary_range && <span>{job.salary_range}</span>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Related News */}
            {posts.length > 0 && (
                <div>
                    <div className="flex justify-between items-baseline mb-6">
                        <h3 className="font-serif text-2xl font-bold">In the News</h3>
                        <Link href={`/?q=${encodeURIComponent(startupName)}`} className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-agri-green flex items-center gap-1 group">
                            Read More <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="space-y-6">
                        {posts.slice(0, 3).map(post => (
                            <Link key={post.id} href={`/${post.slug}`} className="group block">
                                <div className="flex gap-4">
                                    {post.image_url && (
                                        <div className="w-24 h-24 flex-shrink-0 bg-stone-200 overflow-hidden">
                                            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-agri-green mb-1 block">{post.category}</span>
                                        <h4 className="font-serif text-lg font-bold leading-tight mb-2 group-hover:underline decoration-2 decoration-agri-green underline-offset-4">{post.title}</h4>
                                        <div className="text-xs text-stone-400 font-bold uppercase">{new Date(post.published_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
