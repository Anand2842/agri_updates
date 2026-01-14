import { Search, Bell, Users, Building, Briefcase, TrendingUp, MoreVertical, Rocket, FileText, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { supabaseAdmin } from '@/lib/supabase';
import DashboardCharts from './DashboardCharts';

export const revalidate = 0;

async function getDashboardStats() {
    try {
        // Parallel data fetching for speed
        const [
            { count: applicantCount },
            { count: companyCount },
            { count: projectCount },
            { data: recentApplicants },
            { data: recentCompanies },
            { data: recentProjects },
            { data: allApplicants } // fetching specific fields for charts
        ] = await Promise.all([
            supabaseAdmin.from('applicants').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('research_projects').select('*', { count: 'exact', head: true }),

            // Recent entries
            supabaseAdmin.from('applicants').select('id, name, stage, created_at').order('created_at', { ascending: false }).limit(5),
            supabaseAdmin.from('companies').select('id, name, status, created_at').order('created_at', { ascending: false }).limit(5),
            supabaseAdmin.from('research_projects').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5),

            // For charts (this should be optimized in prod with RPC or date filtering, fetching last 30 days)
            supabaseAdmin.from('applicants').select('created_at, stage').order('created_at', { ascending: true })
        ]);

        // Process Recent Activity Feed (Merge & Sort)
        const activityFeed = [
            ...(recentApplicants || []).map(a => ({ type: 'Applicant', name: a.name, status: a.stage, date: a.created_at, icon: Users })),
            ...(recentCompanies || []).map(c => ({ type: 'Company', name: c.name, status: c.status, date: c.created_at, icon: Briefcase })),
            ...(recentProjects || []).map(p => ({ type: 'Research', name: p.title, status: p.status, date: p.created_at, icon: Rocket })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5); // Take top 5

        // Process Applicant Stages for Pie Chart
        const stageCounts: Record<string, number> = {};
        allApplicants?.forEach(a => {
            const s = a.stage || 'Unknown';
            stageCounts[s] = (stageCounts[s] || 0) + 1;
        });
        const stageData = Object.entries(stageCounts).map(([name, value], i) => ({
            name,
            value,
            color: ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#86efac'][i % 5]
        })).sort((a, b) => b.value - a.value);

        // Process Applicant Trends (Last 7 Days)
        const trendMap: Record<string, number> = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            trendMap[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
        }

        allApplicants?.forEach(a => {
            const itemDate = new Date(a.created_at);
            // simple check if within last 7 days roughly
            if (today.getTime() - itemDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
                const dayName = itemDate.toLocaleDateString('en-US', { weekday: 'short' });
                if (trendMap[dayName] !== undefined) {
                    trendMap[dayName]++;
                }
            }
        });

        const trendData = Object.entries(trendMap).map(([name, value]) => ({ name, value }));

        return {
            counts: {
                applicants: applicantCount || 0,
                companies: companyCount || 0,
                projects: projectCount || 0
            },
            activityFeed,
            stageData,
            trendData
        };
    } catch (e) {
        console.error("Dashboard Load Error:", e);
        return {
            counts: { applicants: 0, companies: 0, projects: 0 },
            activityFeed: [],
            stageData: [],
            trendData: []
        };
    }
}

export default async function AdminDashboard() {
    const { counts, activityFeed, stageData, trendData } = await getDashboardStats();

    return (
        <div className="space-y-8">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold mb-1">Dashboard</h1>
                    <p className="text-stone-500 text-sm">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border border-stone-200 rounded-full text-sm bg-white focus:outline-none focus:border-agri-green w-64" />
                    </div>
                    <button className="p-2 bg-white border border-stone-200 rounded-full text-stone-600 hover:text-black hover:border-black transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold">Anand Admin</div>
                            <div className="text-xs text-stone-500">Super Admin</div>
                        </div>
                        <div className="w-10 h-10 bg-agri-green/20 text-agri-green rounded-full flex items-center justify-center border-2 border-white shadow-sm font-bold text-sm">
                            AA
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-agri-green rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3 mr-1" /> Live
                        </span>
                    </div>
                    <div className="text-3xl font-serif font-bold mb-1">{counts.applicants}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Total Applicants</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Building className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3 mr-1" /> Active
                        </span>
                    </div>
                    <div className="text-3xl font-serif font-bold mb-1">{counts.companies}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Active Companies</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded-full">
                            Stable
                        </span>
                    </div>
                    <div className="text-3xl font-serif font-bold mb-1">{counts.projects}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Active Projects</div>
                </div>
            </div>

            {/* Client-side Charts */}
            <DashboardCharts trendData={trendData} stageData={stageData} />

            {/* Recent Table */}
            <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-serif text-lg font-bold">Recent Activity Feed</h3>
                    <button className="text-agri-green text-xs font-bold flex items-center gap-1 hover:underline">
                        View All <ArrowUpRight className="w-3 h-3" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                            <tr>
                                <th className="px-6 py-3">Entity</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-sm">
                            {activityFeed.length > 0 ? activityFeed.map((item, i) => (
                                <tr key={i} className="hover:bg-stone-50 group">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="p-2 bg-stone-100 rounded text-stone-500">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-stone-900 line-clamp-1">{item.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-stone-500">{item.type}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                            {item.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs text-stone-400">
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-stone-500 text-sm">
                                        No recent activity found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
