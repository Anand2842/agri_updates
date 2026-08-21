'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Wand2, LayoutTemplate, Save, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

export default function GeneratorPage() {
    const router = useRouter()
    const supabase = createClient()

    const [rawText, setRawText] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input')
    const [generatedResult, setGeneratedResult] = useState<{
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        category: string;
        job_details?: {
            company?: string;
            location?: string;
            job_type?: string;
            salary_range?: string;
            application_link?: string;
        };
    } | null>(null)

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
                setActiveTab('preview')
            }
        } catch (e) {
            console.error(e)
            alert("Failed to generate content")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveDraft = async () => {
        if (!generatedResult) return;

        try {
            const { data, error } = await supabase
                .from('posts')
                .insert([{
                    title: generatedResult.title,
                    slug: generatedResult.slug,
                    excerpt: generatedResult.excerpt,
                    content: generatedResult.content,
                    category: generatedResult.category,
                    author_name: 'Anand',
                    published_at: new Date().toISOString(),
                    status: 'draft',
                    // Job Details (if available)
                    company: generatedResult.job_details?.company || '',
                    location: generatedResult.job_details?.location || '',
                    job_type: generatedResult.job_details?.job_type || '',
                    salary_range: generatedResult.job_details?.salary_range || '',
                    application_link: generatedResult.job_details?.application_link || '',
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
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-stone-900 p-2.5 rounded-2xl text-white shadow-xs">
                    <Wand2 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">Blog Generator Engine</h1>
                    <p className="text-xs sm:text-sm text-stone-500">Transform raw news & WhatsApp forwards into structured posts instantly.</p>
                </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex bg-stone-200/70 p-1 rounded-xl">
                <button
                    type="button"
                    onClick={() => setActiveTab('input')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        activeTab === 'input' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                    }`}
                >
                    ✍️ Input News ({rawText.length > 0 ? `${rawText.length} chars` : 'Empty'})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === 'preview' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                    }`}
                >
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                    {generatedResult && <span className="w-2 h-2 rounded-full bg-green-500" />}
                </button>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Card */}
                <div className={`space-y-4 ${activeTab === 'input' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col h-full min-h-[460px]">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                                Input Raw Content / Notes / Message
                            </label>
                            {rawText && (
                                <button
                                    type="button"
                                    onClick={() => setRawText('')}
                                    className="text-[11px] font-bold text-stone-400 hover:text-red-600"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            className="w-full flex-1 p-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 outline-none font-mono text-xs sm:text-sm resize-none leading-relaxed"
                            placeholder="Paste WhatsApp forward, job circular, conference alert, or press release here..."
                            rows={14}
                        />

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-[11px] text-stone-400">
                                {rawText ? `${rawText.split('\n').filter(Boolean).length} lines` : 'No input yet'}
                            </span>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !rawText.trim()}
                                className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black disabled:opacity-50 transition-all shadow-xs active:scale-95 shrink-0"
                            >
                                {isGenerating ? (
                                    <>
                                        <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                                        <span>Structuring...</span>
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4 text-purple-400" />
                                        <span>Generate Post</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Card */}
                <div className={`space-y-4 ${activeTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
                    <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 shadow-xs h-full min-h-[460px] flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                Formatted Output Preview
                            </span>
                            {generatedResult && (
                                <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Ready
                                </span>
                            )}
                        </div>

                        {generatedResult ? (
                            <div className="flex-1 flex flex-col">
                                <div className="border border-stone-200/80 rounded-xl p-4 bg-stone-50/50 mb-4 flex-1 overflow-y-auto max-h-[500px] prose prose-stone max-w-none text-sm">
                                    <h3 className="font-serif font-bold text-lg text-stone-900 mb-2 leading-tight">
                                        {generatedResult.title}
                                    </h3>
                                    <div
                                        className="text-stone-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: generatedResult.content }}
                                    />
                                </div>

                                <button
                                    onClick={handleSaveDraft}
                                    className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Save as Draft & Open in Editor</span>
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 rounded-xl p-8 text-center">
                                <LayoutTemplate className="w-10 h-10 mb-2 text-stone-300" />
                                <p className="text-xs font-bold text-stone-500">Preview will appear here</p>
                                <p className="text-[11px] text-stone-400 mt-0.5">Paste raw text on the left and click Generate Post</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
