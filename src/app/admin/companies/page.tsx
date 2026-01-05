import { Search, Plus, Filter, Download, ExternalLink, MapPin, Mail, Phone, Linkedin, Twitter, CheckCircle, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Company } from '@/types/database';

export const revalidate = 0;

const MOCK_COMPANIES: Company[] = [
    { id: '1', name: 'GreenTech Agro', industry: 'Agri-Tech AI', status: 'Active Partner', location: 'San Francisco, CA', contact_email: 'contact@greentech-agro.ai', website: null, health_score: 94, active_jobs: 3, total_hires: 12, logo_type: 'leaf', last_interaction: '2 hours ago', created_at: '' },
    { id: '2', name: 'BioGen Labs', industry: 'Research', status: 'Research Partner', location: 'Boston, MA', contact_email: null, website: null, health_score: 85, active_jobs: 1, total_hires: 5, logo_type: 'micro', last_interaction: '1 day ago', created_at: '' },
    { id: '3', name: 'EcoSoil Systems', industry: 'Sustainability', status: 'Lead', location: 'Austin, TX', contact_email: null, website: null, health_score: 60, active_jobs: 0, total_hires: 0, logo_type: 'soil', last_interaction: '5 days ago', created_at: '' },
    { id: '4', name: 'AgriDrone Sys', industry: 'Hardware', status: 'Churned', location: 'Shenzhen, CN', contact_email: null, website: null, health_score: 20, active_jobs: 0, total_hires: 8, logo_type: 'drone', last_interaction: '2 months ago', created_at: '' },
    { id: '5', name: 'AquaCulture AI', industry: 'Water Mgmt', status: 'Active Partner', location: 'Mumbai, IN', contact_email: null, website: null, health_score: 91, active_jobs: 5, total_hires: 20, logo_type: 'water', last_interaction: '1 week ago', created_at: '' },
];

async function getCompanies() {
    try {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('name', { ascending: true });

        if (error || !data || data.length === 0) {
            return MOCK_COMPANIES;
        }
        return data as Company[];
    } catch {
        return MOCK_COMPANIES;
    }
}

export default async function CompaniesCRM() {
    const companies = await getCompanies();

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)]">
            {/* List Section */}
            <div className="flex-1 bg-white border border-stone-100 rounded-xl shadow-sm flex flex-col min-w-0">
                {/* Header */}
                <div className="p-6 border-b border-stone-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="font-serif text-2xl font-bold">Companies Directory</h1>
                            <p className="text-stone-500 text-xs">Manage partners, startups, and research institutions.</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-2 border border-stone-200 rounded-lg text-xs font-bold hover:bg-stone-50">
                                <Download className="w-4 h-4" /> Export
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 bg-agri-green text-white rounded-lg text-xs font-bold hover:bg-agri-dark">
                                <Plus className="w-4 h-4" /> Add Company
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input type="text" placeholder="Search companies or industry..." className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-agri-green" />
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-2 bg-green-50 text-agri-green text-xs font-bold rounded-lg border border-green-100 flex items-center gap-2">All Status</button>
                            <button className="px-3 py-2 bg-white text-stone-500 text-xs font-bold rounded-lg border border-stone-200 hover:text-black">Active Partner</button>
                            <button className="px-3 py-2 bg-white text-stone-500 text-xs font-bold rounded-lg border border-stone-200 hover:text-black">Lead</button>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-stone-500 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 border-b border-stone-100">Company</th>
                                <th className="px-6 py-3 border-b border-stone-100">Industry</th>
                                <th className="px-6 py-3 border-b border-stone-100">Status</th>
                                <th className="px-6 py-3 border-b border-stone-100 text-right">Last Interaction</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-sm">
                            {companies.map((company, i) => (
                                <tr key={company.id} className={`hover:bg-stone-50 cursor-pointer transition-colors ${i === 0 ? 'bg-green-50/30 border-l-4 border-l-agri-green' : 'border-l-4 border-l-transparent'}`}>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${company.logo_type === 'leaf' ? 'bg-green-600' :
                                                company.logo_type === 'micro' ? 'bg-purple-600' :
                                                    company.logo_type === 'soil' ? 'bg-orange-500' :
                                                        company.logo_type === 'drone' ? 'bg-stone-700' :
                                                            company.logo_type === 'water' ? 'bg-blue-500' : 'bg-stone-400'
                                            }`}>
                                            {company.name[0]}
                                        </div>
                                        <span className="font-bold text-stone-900">{company.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-stone-500">{company.industry}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${company.status === 'Active Partner' ? 'bg-green-100 text-green-800' :
                                                company.status === 'Lead' ? 'bg-yellow-100 text-yellow-800' :
                                                    company.status === 'Research Partner' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-stone-200 text-stone-600'
                                            }`}>
                                            {company.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-stone-400 text-xs">
                                        {/* If date parsing fails, fallback to static text or "Recently" */}
                                        {company.last_interaction ? new Date(company.last_interaction).toLocaleDateString() : 'Recently'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Panel Side */}
            <div className="w-96 bg-white border border-stone-100 rounded-xl shadow-sm hidden xl:flex flex-col overflow-hidden">
                <div className="p-8 border-b border-stone-100 text-center relative">
                    <button className="absolute top-4 right-4 text-stone-400 hover:text-black">✕</button>
                    <div className="w-20 h-20 bg-green-100 rounded-xl mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-green-700">
                        G
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <h2 className="font-serif text-2xl font-bold">GreenTech Agro</h2>
                        <CheckCircle className="w-5 h-5 text-blue-500 fill-white" />
                    </div>
                    <a href="#" className="text-agri-green text-xs font-bold hover:underline mb-6 block">www.greentech-agro.ai</a>

                    <p className="text-sm text-stone-500 leading-relaxed mb-6">
                        Leading provider of AI-driven agricultural solutions focusing on sustainable crop yield optimization and automated pest control systems.
                    </p>

                    <div className="flex flex-col gap-3 text-sm text-stone-600">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-stone-400" />
                            San Francisco, CA, USA
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-stone-400" />
                            contact@greentech-agro.ai
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-stone-400" />
                            +1 (415) 555-0123
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <button className="p-2 border border-stone-200 rounded hover:bg-stone-50"><Linkedin className="w-4 h-4" /></button>
                        <button className="p-2 border border-stone-200 rounded hover:bg-stone-50"><Twitter className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="p-6 bg-stone-50 grid grid-cols-3 gap-2 border-b border-stone-200">
                    <div className="bg-white p-3 rounded border border-stone-200 text-center">
                        <div className="text-xl font-bold text-stone-900">3</div>
                        <div className="text-[9px] font-bold uppercase text-stone-400">Active Jobs</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-stone-200 text-center">
                        <div className="text-xl font-bold text-stone-900">12</div>
                        <div className="text-[9px] font-bold uppercase text-stone-400">Total Hires</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-stone-200 text-center">
                        <div className="text-xl font-bold text-green-600">94%</div>
                        <div className="text-[9px] font-bold uppercase text-stone-400">Health</div>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Recent Activity</h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-500">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-stone-900">Email sent to Sarah Jones</div>
                                <div className="text-xs text-stone-500 mb-1">Regarding "Senior AI Researcher" candidates</div>
                                <div className="text-[10px] text-stone-400">2 hours ago</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-green-500">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-stone-900">New Job Posted</div>
                                <div className="bg-stone-50 border border-stone-100 rounded p-2 mt-1">
                                    <div className="font-bold text-xs">Senior AI Researcher</div>
                                    <div className="text-[10px] text-stone-500">Remote • Full-time • $120k-$150k</div>
                                </div>
                                <div className="text-[10px] text-stone-400 mt-1">1 day ago</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
