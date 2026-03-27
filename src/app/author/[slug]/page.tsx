import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { safeDateFormat } from '@/lib/utils/date'

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function AuthorProfilePage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch author
    const { data: author } = await supabase
        .from('authors')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    if (!author) {
        notFound()
    }

    // Fetch their published posts
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', author.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            {/* Author Header */}
            <div className="bg-white border-b border-stone-200 py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-stone-100 shadow-sm flex-shrink-0">
                            <Image
                                src={author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=2D5016&color=fff&size=128`}
                                alt={author.name}
                                fill
                                sizes="128px"
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-2">
                                {author.name}
                            </h1>
                            <p className="text-sm font-bold uppercase tracking-widest text-agri-green mb-4">
                                {author.role || 'Contributor'}
                            </p>
                            <p className="text-stone-600 max-w-2xl leading-relaxed">
                                {author.bio || "No biography provided."}
                            </p>
                            
                            {author.social_links && (
                                <div className="flex gap-4 mt-6 justify-center md:justify-start">
                                    {author.social_links.twitter && (
                                        <a href={author.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-blue-500 font-bold text-sm transition-colors">Twitter</a>
                                    )}
                                    {author.social_links.linkedin && (
                                        <a href={author.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-blue-700 font-bold text-sm transition-colors">LinkedIn</a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Author's Posts */}
            <div className="container mx-auto px-4 max-w-4xl py-12">
                <h2 className="font-serif text-2xl font-bold text-stone-900 mb-8 pb-4 border-b border-stone-200">
                    Articles by {author.name} <span className="text-stone-400 text-lg font-normal">({posts?.length || 0})</span>
                </h2>

                <div className="space-y-8">
                    {posts?.map((post) => (
                        <article key={post.id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row gap-6">
                            {post.image_url && (
                                <div className="relative w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
                                    <Image
                                        src={post.image_url}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, 192px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            )}
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex gap-2 items-center mb-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-stone-500">{post.category}</span>
                                    <span className="text-stone-300">•</span>
                                    <span className="text-xs text-stone-400">{safeDateFormat(post.published_at)}</span>
                                </div>
                                <Link href={`/blog/${post.slug}`}>
                                    <h3 className="font-serif text-xl font-bold text-stone-900 mb-2 group-hover:text-agri-green transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                </Link>
                                <p className="text-stone-600 text-sm line-clamp-2">
                                    {post.excerpt || post.content?.substring(0, 150).replace(/<[^>]+>/g, '') + '...'}
                                </p>
                            </div>
                        </article>
                    ))}

                    {(!posts || posts.length === 0) && (
                        <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                            <p className="text-stone-500">No published articles yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
