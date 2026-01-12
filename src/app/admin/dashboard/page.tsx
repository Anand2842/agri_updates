import { Search, Bell, Users, Building, Briefcase, TrendingUp, MoreVertical, Rocket, FileText, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import DashboardCharts from './DashboardCharts';

export const revalidate = 0;

const TREND_DATA = [
    { name: 'Mon', applicants: 40, jobs: 24 },
    { name: 'Tue', applicants: 30, jobs: 13 },
    { name: 'Wed', applicants: 20, jobs: 58 },
    { name: 'Thu', applicants: 27, jobs: 39 },
    { name: 'Fri', applicants: 18, jobs: 48 },
    { name: 'Sat', applicants: 23, jobs: 38 },
    { name: 'Sun', applicants: 34, jobs: 43 },
];

const MIX_DATA = [
    { name: 'R&D', value: 45, color: '#4ade80' },
    { name: 'Ops', value: 25, color: '#86efac' },
    { name: 'Marketing', value: 20, color: '#a7f3d0' },
    { name: 'Sales', value: 10, color: '#22c55e' },
];

async function getDashboardStats() {
    try {
        const [
            { count: applicantCount },
            { count: companyCount },
            { count: projectCount }
        ] = await Promise.all([
            supabase.from('applicants').select('*', { count: 'exact', head: true }),
            supabase.from('companies').select('*', { count: 'exact', head: true }),
            supabase.from('research_projects').select('*', { count: 'exact', head: true }),
        ]);

        return {
            applicants: applicantCount || 0,
            companies: companyCount || 0,
            projects: projectCount || 0
        };
    } catch {
        return { applicants: 1240, companies: 85, projects: 24 }; // Fallback
    }
}

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

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
                        <div className="w-10 h-10 bg-stone-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80" alt="Admin" fill className="object-cover" />
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
                            <TrendingUp className="w-3 h-3 mr-1" /> +12%
                        </span>
                    </div>
                    <div className="text-3xl font-serif font-bold mb-1">{stats.applicants}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Total Applicants</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Building className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3 mr-1" /> +5%
                        </span>
                    </div>
                    <div className="text-3xl font-serif font-bold mb-1">{stats.companies}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Active Companies</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded-full">
                            No change
                        </span>
                    </div>
                    <div className="text-3xl font-serif font-bold mb-1">{stats.projects}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Active Projects</div>
                </div>
            </div>

            {/* Client-side Charts */}
            <DashboardCharts trendData={TREND_DATA} mixData={MIX_DATA} />

            {/* Recent Table */}
            <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-serif text-lg font-bold">Recent CRM Entries</h3>
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
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-sm">
                            {[
                                { name: 'GreenTech Agro', type: 'Company', status: 'Active', icon: Rocket },
                                { name: 'Dr. Aditi Rao', type: 'Applicant', status: 'Screening', icon: Users },
                                { name: 'Soil Analysis Ph2', type: 'Research', status: 'Pending', icon: FileText },
                            ].map((item, i) => (
                                <tr key={i} className="hover:bg-stone-50 group">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="p-2 bg-stone-100 rounded text-stone-500">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-stone-900">{item.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-stone-500">{item.type}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-stone-300 hover:text-black">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
