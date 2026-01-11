'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Wand2, LayoutTemplate, Save, ArrowRight } from 'lucide-react'

export default function GeneratorPage() {
    const router = useRouter()
    const supabase = createClient()

    const [rawText, setRawText] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedResult, setGeneratedResult] = useState<any>(null)

    const handleGenerate = async () => {
        if (!rawText.trim()) return;

        setIsGenerating(true)
        try {
            const res = await fetch('/api/posts/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText })
            })

            const data = await res.json()
            if (data.success) {
                setGeneratedResult(data.data)
            }
        } catch (e) {
            console.error(e)
            alert("Failed to generate")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveDraft = async () => {
        if (!generatedResult) return;

        try {
            // Insert into Supabase directly to get an ID? 
            // Or better, redirect to /admin/posts/new with state?
            // Since we can't easily pass state to a new page without context/query params that might be too long,
            // let's create a partial draft record in DB and then redirect to edit it.

            const { data, error } = await supabase
                .from('posts')
                .insert([{
                    title: generatedResult.title,
                    slug: generatedResult.slug,
                    excerpt: generatedResult.excerpt,
                    content: generatedResult.content,
                    category: generatedResult.category,
                    author_name: 'Anand',
                    published_at: new Date().toISOString()
                }])
                .select()
                .single()

            if (error) throw error;

            router.push(`/admin/posts/${data.id}`)

        } catch (e) {
            console.error(e)
            alert("Failed to create draft")
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-gradient-to-br from-agri-green to-emerald-600 p-3 rounded-lg text-white shadow-lg">
                    <Wand2 className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900">Blog Generator Engine</h1>
                    <p className="text-stone-500">Transform raw news into structured, SEO-ready posts instantly.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">
                            Input Raw Content / News
                        </label>
                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            className="w-full h-96 p-4 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-agri-green outline-none font-mono text-sm resize-none"
                            placeholder="Paste press release, news snippet, or raw notes here..."
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !rawText}
                                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50 transition-all"
                            >
                                {isGenerating ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4" />
                                        Generate Post
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm h-full min-h-[500px] flex flex-col">
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-3 flex justify-between items-center">
                            <span>Live Preview</span>
                            {generatedResult && <span className="text-green-600 flex items-center gap-1"><LayoutTemplate className="w-3 h-3" /> Ready for Review</span>}
                        </label>

                        {generatedResult ? (
                            <div className="flex-1 flex flex-col">
                                <div className="border border-stone-100 rounded-lg p-4 bg-stone-50 mb-4 flex-1 overflow-y-auto max-h-[600px] prose prose-sm max-w-none">
                                    <h2 className="mb-2">{generatedResult.title}</h2>
                                    <div dangerouslySetInnerHTML={{ __html: generatedResult.content }} />
                                </div>

                                <button
                                    onClick={handleSaveDraft}
                                    className="w-full flex items-center justify-center gap-2 bg-agri-green text-white px-6 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-emerald-700 shadow-md transition-all hover:translate-y-[-2px]"
                                >
                                    <Save className="w-4 h-4" />
                                    Save as Draft & Edit
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-100 rounded-lg">
                                <LayoutTemplate className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm font-bold opacity-40">Preview will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
