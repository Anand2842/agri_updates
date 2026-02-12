import { Calendar, CheckCircle } from 'lucide-react'

interface Milestone {
    date: string
    title: string
    description: string
}

interface StartupTimelineProps {
    milestones: Milestone[] | null
}

export default function StartupTimeline({ milestones }: StartupTimelineProps) {
    if (!milestones || milestones.length === 0) return null

    // Sort by date descending (newest first)
    const sortedMilestones = [...milestones].sort((a, b) =>
        a.date.localeCompare(b.date) // Simple string compare for years like "2023", "Q1 2024" might need logic but string is ok for now
    ).reverse()

    return (
        <div className="relative border-l-2 border-stone-200 ml-3 md:ml-6 space-y-12 py-4">
            {sortedMilestones.map((item, idx) => (
                <div key={idx} className="relative pl-8 md:pl-12 group">
                    {/* Dot */}
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-stone-300 border-2 border-white group-hover:bg-agri-green group-hover:scale-125 transition-all"></div>

                    {/* Content */}
                    <div>
                        <span className="inline-block px-2 py-1 bg-stone-100 text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2 rounded">
                            {item.date}
                        </span>
                        <h4 className="font-serif text-lg font-bold mb-2 group-hover:text-agri-green transition-colors">{item.title}</h4>
                        <p className="text-stone-600 text-sm leading-relaxed max-w-xl">{item.description}</p>
                    </div>
                </div>
            ))}

            {/* End Cap */}
            <div className="absolute -bottom-2 -left-[5px] w-2 h-2 rounded-full bg-stone-300"></div>
        </div>
    )
}
