import Link from 'next/link';
import { Newspaper, Briefcase, Award, Rocket, ArrowUpRight } from 'lucide-react';

type QuickAccessBarProps = {
    jobCount?: number;
    grantCount?: number;
    startupCount?: number;
};

export default function QuickAccessBar({
    jobCount = 12,
    grantCount = 8,
    startupCount = 15,
}: QuickAccessBarProps) {
    const tracks = [
        {
            title: 'Agriculture News',
            subtitle: 'Policy, trials & commodity intelligence',
            href: '/updates',
            badge: 'Live Feed',
            badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
            icon: Newspaper,
            accentBg: 'from-slate-50 to-white hover:border-slate-300',
            iconBg: 'bg-slate-900 text-white',
            arrowColor: 'text-slate-900',
        },
        {
            title: 'Careers & Hiring',
            subtitle: `${jobCount}+ open vacancies & research posts`,
            href: '/jobs',
            badge: 'Verified Jobs',
            badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            icon: Briefcase,
            accentBg: 'from-emerald-50/40 to-white hover:border-emerald-300',
            iconBg: 'bg-emerald-700 text-white',
            arrowColor: 'text-emerald-700',
        },
        {
            title: 'Grants & Schemes',
            subtitle: `${grantCount}+ funding calls, RKVY & schemes`,
            href: '/updates/grants',
            badge: 'Capital Desk',
            badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
            icon: Award,
            accentBg: 'from-amber-50/40 to-white hover:border-amber-300',
            iconBg: 'bg-amber-600 text-white',
            arrowColor: 'text-amber-700',
        },
        {
            title: 'AgriTech Startups',
            subtitle: `${startupCount}+ funding rounds & field tech`,
            href: '/startups',
            badge: 'Innovation Hub',
            badgeColor: 'bg-teal-50 text-teal-900 border-teal-200',
            icon: Rocket,
            accentBg: 'from-teal-50/40 to-white hover:border-teal-300',
            iconBg: 'bg-teal-700 text-white',
            arrowColor: 'text-teal-700',
        },
    ];

    return (
        <section className="editorial-shell py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {tracks.map((track) => {
                    const Icon = track.icon;
                    return (
                        <Link
                            key={track.title}
                            href={track.href}
                            className={`group relative flex flex-col justify-between p-4 rounded-2xl border border-slate-200/90 bg-gradient-to-b ${track.accentBg} shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${track.iconBg}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${track.badgeColor}`}>
                                        {track.badge}
                                    </span>
                                </div>
                                <div className={`w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-2xs ${track.arrowColor}`}>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                                    {track.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                    {track.subtitle}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
