import { Plus, Filter, LayoutGrid, List, MoreHorizontal, Calendar, FileText, PieChart, FlaskConical, Upload } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ResearchProject } from '@/types/database';

export const revalidate = 0;

const MOCK_PROJECTS: ResearchProject[] = [
    { id: '1', title: 'AI-Driven Crop Yield Prediction Model', description: 'Developing a machine learning model to predict crop yields based on soil health and satellite imagery.', status: 'Active', progress: 65, budget_utilized: 78, team_count: 4, start_date: 'Oct 24', lead_name: null, created_at: '' },
    { id: '2', title: 'Soil Microbiome Analysis', description: 'Comprehensive sequencing of soil bacteria in arid regions to identify drought-resistant strains.', status: 'Pending Review', progress: 90, budget_utilized: 95, team_count: 12, start_date: 'Nov 02', lead_name: null, created_at: '' },
    { id: '3', title: 'Vertical Farming Optimization', description: 'Designing energy-efficient lighting schedules for leafy greens in controlled environments.', status: 'Planning', progress: 15, budget_utilized: 10, team_count: 2, start_date: 'Dec 15', lead_name: null, created_at: '' },
];

async function getProjects() {
    try {
        const { data, error } = await supabase
            .from('research_projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            return MOCK_PROJECTS;
        }
        return data as ResearchProject[];
    } catch {
        return MOCK_PROJECTS;
    }
}

export default async function ResearchCRM() {
    const projects = await getProjects();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold mb-1">Research Projects</h1>
                    <p className="text-stone-500 text-sm">Manage ongoing research initiatives, track funding utilization, and organize team resources effectively.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-stone-200 rounded-lg text-sm font-bold text-stone-600 bg-white hover:bg-stone-50 flex items-center gap-2">
                        <UploadIcon className="w-4 h-4" /> Import
                    </button>
                    <button className="px-4 py-2 bg-agri-green text-white rounded-lg text-sm font-bold shadow-lg hover:bg-agri-dark flex items-center gap-2 transition-colors">
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Total Projects</div>
                        <div className="text-3xl font-serif font-bold text-stone-900 mb-1">24</div>
                        <div className="text-agri-green text-xs font-bold">↗ +2 this month</div>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                        <FolderIcon className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Active Research</div>
                        <div className="text-3xl font-serif font-bold text-stone-900 mb-1">12</div>
                        <div className="text-stone-400 text-xs font-bold">Currently ongoing</div>
                    </div>
                    <div className="w-12 h-12 bg-green-50 text-agri-green rounded-lg flex items-center justify-center">
                        <FlaskConical className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Budget Utilized</div>
                        <div className="text-3xl font-serif font-bold text-stone-900 mb-1">78%</div>
                        <div className="text-red-500 text-xs font-bold">↘ -5% vs last year</div>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center">
                        <PieChart className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button className="px-4 py-2 bg-green-50 text-agri-green text-xs font-bold rounded-lg whitespace-nowrap">All Projects</button>
                    <button className="px-4 py-2 bg-white text-stone-500 hover:text-black hover:bg-stone-50 text-xs font-bold rounded-lg border border-transparent hover:border-stone-200 transition-all">Active</button>
                    <button className="px-4 py-2 bg-white text-stone-500 hover:text-black hover:bg-stone-50 text-xs font-bold rounded-lg border border-transparent hover:border-stone-200 transition-all">Pending Review</button>
                    <button className="px-4 py-2 bg-white text-stone-500 hover:text-black hover:bg-stone-50 text-xs font-bold rounded-lg border border-transparent hover:border-stone-200 transition-all">Completed</button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input type="text" placeholder="Filter by lead..." className="w-full pl-10 pr-4 py-2 bg-stone-50 rounded-lg text-sm border border-stone-200 focus:outline-none focus:border-agri-green" />
                    </div>
                    <div className="flex border border-stone-200 rounded-lg p-1 bg-white">
                        <button className="p-1 bg-stone-100 rounded text-black"><LayoutGrid className="w-4 h-4" /></button>
                        <button className="p-1 text-stone-400 hover:text-black"><List className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${project.status === 'Active' ? 'bg-green-100 text-green-700' :
                                project.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-700' :
                                    project.status === 'Planning' ? 'bg-blue-100 text-blue-700' :
                                        'bg-stone-100 text-stone-600'
                                }`}>
                                {project.status}
                            </span>
                            <button className="text-stone-300 hover:text-black"><MoreHorizontal className="w-5 h-5" /></button>
                        </div>

                        <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-agri-green transition-colors cursor-pointer">
                            {project.title}
                        </h3>
                        <p className="text-sm text-stone-500 mb-6 line-clamp-2">
                            {project.description}
                        </p>

                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-bold text-stone-500 mb-2">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                                <div className={`h-full w-[${project.progress}%] ${project.status === 'Active' ? 'bg-agri-green' : 'bg-blue-500' // Simple fallback
                                    }`} style={{ width: `${project.progress}%` }}></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-stone-200 relative overflow-hidden">
                                    <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80" alt="User" fill className="object-cover" />
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-stone-200 relative overflow-hidden">
                                    <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80" alt="User" fill className="object-cover" />
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500">
                                    +{project.team_count}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-stone-400 font-bold">
                                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {project.team_count}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Create New Card (Dashed) */}
                <button className="border-2 border-dashed border-stone-200 rounded-xl p-6 flex flex-col items-center justify-center text-stone-400 hover:border-agri-green hover:text-agri-green hover:bg-green-50/50 transition-all min-h-[300px]">
                    <Plus className="w-10 h-10 mb-4 opacity-50" />
                    <span className="font-bold">Create New Project</span>
                    <span className="text-xs opacity-70 mt-1">Start a new research initiative</span>
                </button>
            </div>
        </div>
    );
}

function UploadIcon(props: { className?: string }) {
    return <Upload className={props.className} />
}
function FolderIcon(props: { className?: string }) {
    return <FileText className={props.className} />
}
