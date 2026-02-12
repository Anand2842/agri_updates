import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft, Globe, MapPin, Users, Calendar, DollarSign, Share2, Linkedin, Twitter, Instagram, Facebook, AlertTriangle } from 'lucide-react'
import StartupTimeline from '@/components/startups/StartupTimeline'
import StartupHighlights from '@/components/startups/StartupHighlights'
import RelatedContent from '@/components/startups/RelatedContent'

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()
    const { data: startup } = await supabase.from('startups').select('*').eq('slug', slug).single()

    if (!startup) return { title: 'Startup Not Found' }

    return {
        title: `${startup.name} - Agile Updates`,
        description: startup.elevator_pitch || startup.description || `Learn about ${startup.name} on Agri Updates.`,
    }
}

export default async function StartupDetailPage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()

    // 1. Fetch Startup
    const { data: startup, error } = await supabase
        .from('startups')
        .select('*')
        .eq('slug', slug)
        .single()

    if (!startup || error) {
        notFound()
    }

    // 2. Fetch Related Jobs (exact match on company name usually)
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('company', startup.name)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3)

    // 3. Fetch Related Posts (match tags if possible, or rough string match - simplify for now to tags overlap)
    // Note: This is an advanced query. For now let's just try to find posts with matching tags.
    // Supabase array overlap: .overlaps('tags', startup.tags || [])
    let posts: any[] = []
    if (startup.tags && startup.tags.length > 0) {
        const { data: relatedPosts } = await supabase
            .from('posts')
            .select('*')
            .overlaps('tags', startup.tags)
            .eq('status', 'published')
            .limit(3)
        if (relatedPosts) posts = relatedPosts
    }

    return (
        <div className="min-h-screen bg-white">
            {/* HERO SECTION */}
            <div className="bg-stone-50 border-b border-stone-200">
                <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
                    <Link href="/startups" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-black mb-8 transition-colors">
                        <ArrowLeft size={14} /> Back to Directory
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 md:items-start">
                        {/* Logo */}
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white border border-stone-200 shadow-sm flex items-center justify-center p-4 rounded-sm flex-shrink-0">
                            {startup.logo_url ? (
                                <img src={startup.logo_url} alt={startup.name} className="max-w-full max-h-full object-contain" />
                            ) : (
                                <div className="text-4xl font-serif font-bold text-stone-300">{startup.name.charAt(0)}</div>
                            )}
                        </div>

                        <div className="flex-grow">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {startup.tags?.map((tag: string) => (
                                    <span key={tag} className="bg-stone-200 text-stone-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm">
                                        {tag}
                                    </span>
                                ))}
                                {startup.funding_stage && (
                                    <span className="bg-agri-green text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm">
                                        {startup.funding_stage}
                                    </span>
                                )}
                            </div>

                            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{startup.name}</h1>
                            <p className="text-xl text-stone-600 leading-relaxed font-serif max-w-2xl">{startup.elevator_pitch || startup.description}</p>

                            <div className="flex flex-wrap gap-6 mt-8 text-sm font-bold text-stone-500 uppercase tracking-wide">
                                {startup.location && <span className="flex items-center gap-2"><MapPin size={16} /> {startup.location}</span>}
                                {startup.founded_year && <span className="flex items-center gap-2"><Calendar size={16} /> Founded {startup.founded_year}</span>}
                                {startup.team_size && <span className="flex items-center gap-2"><Users size={16} /> {startup.team_size} Employees</span>}
                                {startup.funding_amount && <span className="flex items-center gap-2"><DollarSign size={16} /> {startup.funding_amount} Raised</span>}
                            </div>
                        </div>

                        <div className="flex-shrink-0 flex flex-col gap-4 min-w-[200px]">
                            {startup.website_url && (
                                <a href={startup.website_url} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest text-center hover:bg-agri-green transition-colors flex items-center justify-center gap-2 rounded-sm shadow-sm">
                                    <Globe size={16} /> Visit Website
                                </a>
                            )}
                            <div className="flex justify-center gap-4 py-2">
                                {startup.social_links?.twitter && <a href={startup.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-[#1DA1F2]"><Twitter size={20} /></a>}
                                {startup.social_links?.linkedin && <a href={startup.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-[#0A66C2]"><Linkedin size={20} /></a>}
                                {startup.social_links?.instagram && <a href={startup.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-[#E4405F]"><Instagram size={20} /></a>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="container mx-auto px-4 py-16 max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* LEFT COLUMN (Story & Timeline) */}
                    <div className="lg:col-span-2 space-y-16">

                        {/* Highlights Grid */}
                        {startup.success_highlights && startup.success_highlights.length > 0 && (
                            <section>
                                <h2 className="font-serif text-2xl font-bold mb-8 flex items-center gap-2">
                                    <span className="w-8 h-1 bg-agri-green"></span> Key Highlights
                                </h2>
                                <StartupHighlights highlights={startup.success_highlights} />
                            </section>
                        )}

                        {/* Long Description */}
                        {startup.long_description && (
                            <section className="prose prose-stone max-w-none prose-lg prose-headings:font-serif prose-headings:font-bold prose-a:text-agri-green">
                                <h3>Our Story</h3>
                                <div className="whitespace-pre-line">{startup.long_description}</div>
                            </section>
                        )}

                        {/* Timeline */}
                        {startup.milestones && startup.milestones.length > 0 && (
                            <section>
                                <h2 className="font-serif text-2xl font-bold mb-8 flex items-center gap-2">
                                    <span className="w-8 h-1 bg-agri-green"></span> Journey
                                </h2>
                                <StartupTimeline milestones={startup.milestones} />
                            </section>
                        )}

                    </div>

                    {/* RIGHT COLUMN (Sidebar Stats & Challenges) */}
                    <div className="space-y-12">

                        {/* Founders */}
                        {startup.founder_names && (
                            <div className="bg-stone-50 p-6 border border-stone-200">
                                <h3 className="font-serif text-lg font-bold mb-4">Founders</h3>
                                <p className="text-stone-600 leading-relaxed font-medium">{startup.founder_names}</p>
                            </div>
                        )}

                        {/* Investors */}
                        {startup.investors && startup.investors.length > 0 && (
                            <div className="bg-stone-50 p-6 border border-stone-200">
                                <h3 className="font-serif text-lg font-bold mb-4">Backed By</h3>
                                <div className="flex flex-wrap gap-2">
                                    {startup.investors.map((inv: string) => (
                                        <span key={inv} className="bg-white border border-stone-200 px-3 py-2 text-xs font-bold uppercase tracking-wide text-stone-600">
                                            {inv}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Challenges */}
                        {startup.challenges && startup.challenges.length > 0 && (
                            <div className="bg-white border border-stone-200 p-6 shadow-sm">
                                <h3 className="font-serif text-lg font-bold mb-6 flex items-center gap-2 text-red-600">
                                    <AlertTriangle size={18} /> Key Challenges
                                </h3>
                                <div className="space-y-6">
                                    {startup.challenges.map((item: any, idx: number) => (
                                        <div key={idx}>
                                            <h4 className="font-bold text-sm uppercase tracking-wide mb-1">{item.title}</h4>
                                            <p className="text-stone-500 text-sm leading-relaxed">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* RELATED CONTENT SECTION */}
                <div className="mt-20 pt-16 border-t border-stone-200">
                    <RelatedContent jobs={jobs || []} posts={posts || []} startupName={startup.name} />
                </div>
            </div>
        </div>
    )
}
