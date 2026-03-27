import { FileText, Briefcase, Clock, TrendingUp, ArrowUpRight, CheckCircle, Edit3, Eye } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import DashboardCharts from './DashboardCharts';
import Link from 'next/link';

export const revalidate = 0;

async function getDashboardStats() {
    try {
        const supabase = await createClient();

        // Parallel data fetching for core metrics
        const [
            { count: totalPosts },
            { count: activeJobs },
            { count: pendingReviews },
            { data: recentPosts },
            { data: trendDataRaw },
            { data: categoryDataRaw },
            { data: topPostsData },
            { data: allPostsViews }
        ] = await Promise.all([
            // 1. Total Posts
            supabase.from('posts').select('*', { count: 'exact', head: true }),

            // 2. Active Jobs
            supabase.from('posts').select('*', { count: 'exact', head: true })
                .eq('category', 'Jobs')
                .eq('is_active', true),

            // 3. Pending Reviews
            supabase.from('posts').select('*', { count: 'exact', head: true })
                .eq('status', 'pending_review'),

            // 4. Recent Posts (Activity Feed)
            supabase.from('posts')
                .select('id, title, category, status, created_at, author_name')
                .order('created_at', { ascending: false })
                .limit(7),

            // 5. Trend (Last 7 days posts)
            supabase.from('posts')
                .select('created_at')
                .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: true }),

            // 6. Category Distribution
            supabase.from('posts').select('category'),

            // 7. Top Performing Posts by Views
            supabase.from('posts')
                .select('id, title, category, views, author_name, slug')
                .eq('status', 'published')
                .order('views', { ascending: false, nullsFirst: false })
                .limit(5),

            // 8. Total Views aggregation
            supabase.from('posts').select('views')
        ]);

        // Process Recent Activity Feed
        const activityFeed = (recentPosts || []).map(p => ({
            id: p.id,
            type: p.category,
            name: p.title,
            status: p.status,
            date: p.created_at,
            author: p.author_name || 'Agri Updates'
        }));

        // Process Category Pie Chart
        const catCounts: Record<string, number> = {};
        (categoryDataRaw || []).forEach((p: { category: string }) => {
            const c = p.category || 'Uncategorized';
            catCounts[c] = (catCounts[c] || 0) + 1;
        });

        // Fixed colors for categories
        const categoryColors: Record<string, string> = {
            'Jobs': '#16a34a', // green
            'Research': '#2563eb', // blue
            'Startups': '#9333ea', // purple
            'Events': '#ea580c', // orange
            'Policy': '#dc2626', // red
            'Uncategorized': '#94a3b8' // gray
        };

        const stageData = Object.entries(catCounts).map(([name, value]) => ({
            name,
            value,
            color: categoryColors[name] || '#94a3b8'
        })).sort((a, b) => b.value - a.value).slice(0, 5); // Start with top 5

        // Process Trend Data (Last 7 Days)
        const trendMap: Record<string, number> = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            trendMap[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
        }

        (trendDataRaw || []).forEach((p: { created_at: string }) => {
            const d = new Date(p.created_at);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            if (trendMap[dayName] !== undefined) {
                trendMap[dayName]++;
            }
        });

        const trendData = Object.entries(trendMap).map(([name, value]) => ({ name, value }));

        const totalViews = (allPostsViews || []).reduce((acc, post) => acc + (post.views || 0), 0);
        
        const topPosts = (topPostsData || []).map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            views: p.views || 0,
            author_name: p.author_name || 'Agri Updates',
            slug: p.slug
        }));

        return {
            counts: {
                posts: totalPosts || 0,
                jobs: activeJobs || 0,
                pending: pendingReviews || 0,
                views: totalViews
            },
            activityFeed,
            stageData,
            trendData,
            topPosts
        };
    } catch (e) {
        console.error('Dashboard query failed:', e);
        return {
            counts: { posts: 0, jobs: 0, pending: 0, views: 0 },
            activityFeed: [],
            stageData: [],
            trendData: [],
            topPosts: []
        };
    }
}

import { requireStaff } from '@/lib/auth';

export default async function AdminDashboard() {
    const supabase = await createClient();
    const [statsResult, role, { data: { user } }] = await Promise.all([
        getDashboardStats(),
        requireStaff(supabase),
        supabase.auth.getUser()
    ]);
    const { counts, activityFeed, stageData, trendData, topPosts } = statsResult;

    const email = user?.email || '';
    const name = user?.user_metadata?.full_name || email.split('@')[0] || 'Admin';
    const initials = name.slice(0, 1).toUpperCase();
    const displayRole = role.charAt(0).toUpperCase() + role.slice(1);

    return (
        <div className="space-y-8">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold mb-1">Dashboard</h1>
                    <p className="text-stone-500 text-sm">Overview of platform metrics and content activity.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/admin/posts/new" className="hidden md:flex bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider items-center gap-2 hover:bg-black transition-colors">
                        <Edit3 className="w-4 h-4" />
                        Create Post
                    </Link>
                    <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold truncate max-w-[150px]">{name}</div>
                            <div className="text-xs text-stone-500">{displayRole}</div>
                        </div>
                        <div className="w-10 h-10 bg-agri-green/20 text-agri-green rounded-full flex items-center justify-center border-2 border-white shadow-sm font-bold text-sm uppercase">
                            {initials}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3 mr-1" /> Total
                        </span>
                    </div>
                    <div className="text-3xl font-serif font-bold mb-1">{counts.posts}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Total Posts</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-agri-green rounded-lg">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3 mr-1" /> Active
                        </span>
                    </div>
                    <div className="text-3xl font-serif font-bold mb-1">{counts.jobs}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Active Jobs</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <Clock className="w-6 h-6" />
                        </div>
                        {counts.pending > 0 && (
                            <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full animate-pulse">
                                Action Needed
                            </span>
                        )}
                    </div>
                    <div className="text-3xl font-serif font-bold mb-1">{counts.pending}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Pending Review</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <Eye className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-3xl font-serif font-bold mb-1">{counts.views.toLocaleString()}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Total Platform Views</div>
                </div>
            </div>

            {/* Client-side Charts */}
            <DashboardCharts trendData={trendData} stageData={stageData} />

            {/* Recent Table */}
            <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-serif text-lg font-bold">Recent Content Activity</h3>
                    <Link href="/admin/posts" className="text-agri-green text-xs font-bold flex items-center gap-1 hover:underline">
                        View All Posts <ArrowUpRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-sm">
                            {activityFeed.length > 0 ? activityFeed.map((item) => (
                                <tr key={item.id} className="hover:bg-stone-50 group transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-stone-900 line-clamp-1">{item.name}</div>
                                        <div className="text-xs text-stone-400 mt-1">by {item.author}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                                            ${item.type === 'Jobs' ? 'bg-green-100 text-green-700' :
                                                item.type === 'Research' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-stone-100 text-stone-600'}
                                        `}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                            ${item.status === 'published' ? 'bg-green-50 text-green-700' :
                                                item.status === 'scheduled' ? 'bg-purple-50 text-purple-700' :
                                                    'bg-stone-100 text-stone-500'}
                                        `}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'published' ? 'bg-green-500' :
                                                    item.status === 'scheduled' ? 'bg-purple-500' :
                                                        'bg-stone-400'
                                                }`} />
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs text-stone-400 font-mono">
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
            
            {/* Top Posts Table */}
            <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden mt-8">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-serif text-lg font-bold">Top Performing Content</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                            <tr>
                                <th className="px-6 py-3">Rank</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3 text-right">Total Views</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-sm">
                            {topPosts.length > 0 ? topPosts.map((post, i) => (
                                <tr key={post.id} className="hover:bg-stone-50 group transition-colors">
                                    <td className="px-6 py-4 font-bold text-stone-300 w-12 text-center text-lg font-serif">
                                        #{i + 1}
                                    </td>
                                    <td className="px-6 py-4 max-w-sm">
                                        <Link href={`/blog/${post.slug}`} className="font-bold text-stone-900 line-clamp-1 hover:text-agri-green" target="_blank">
                                            {post.title}
                                        </Link>
                                        <div className="text-xs text-stone-400 mt-1">by {post.author_name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-bold text-lg font-mono text-purple-600">
                                            {post.views.toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-stone-500 text-sm">
                                        No top posts found.
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
