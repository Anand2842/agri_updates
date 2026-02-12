import { Trophy, TrendingUp, Users, Target, CheckCircle2 } from 'lucide-react'

interface Highlight {
    title: string
    description: string
    icon?: string
}

interface StartupHighlightsProps {
    highlights: Highlight[] | null
}

export default function StartupHighlights({ highlights }: StartupHighlightsProps) {
    if (!highlights || highlights.length === 0) return null

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlights.map((item, idx) => (
                <div key={idx} className="bg-stone-50 p-6 border border-stone-100 hover:border-agri-green/30 transition-colors group rounded-sm">
                    <div className="mb-4 text-agri-green opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all origin-left">
                        <Trophy size={24} />
                    </div>
                    <h4 className="font-serif text-lg font-bold mb-2">{item.title}</h4>
                    <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
                </div>
            ))}
        </div>
    )
}
