import { FileText, Briefcase, Clock, TrendingUp, ArrowUpRight, CheckCircle, Edit3, Eye, AlertTriangle } from 'lucide-react';
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
            { count: publishedPosts },
            { count: draftPosts },
            { count: activeJobs },
            { count: pendingReviews },
            { count: scheduledPosts },
            { data: recentPosts },
            { data: trendDataRaw },
            { data: categoryDataRaw },
            { data: topPostsData },
            { data: allPostsViews },
            { data: todayPostsData },
            { count: activeWarnings }
        ] = await Promise.all([
            // 1. Total Posts
            supabase.from('posts').select('*', { count: 'exact', head: true }),

            // 2. Published Posts
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),

            // 3. Draft Posts
            supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),

            // 4. Active Jobs
            supabase.from('posts').select('*', { count: 'exact', head: true })
                .eq('category', 'Jobs')
                .eq('is_active', true),

            // 5. Pending Reviews
            supabase.from('posts').select('*', { count: 'exact', head: true })
                .eq('status', 'pending_review'),

            // 6. Scheduled Posts
            supabase.from('posts').select('*', { count: 'exact', head: true })
                .eq('status', 'scheduled'),

            // 7. Recent Posts (Activity Feed)
            supabase.from('posts')
                .select('id, title, category, status, created_at, author_name, slug')
                .order('created_at', { ascending: false })
                .limit(10),

            // 8. Trend (Last 7 days posts)
            supabase.from('posts')
                .select('created_at')
                .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: true }),

            // 9. Category Distribution
            supabase.from('posts').select('category'),

            // 10. Top Performing Posts by Views
            supabase.from('posts')
                .select('id, title, category, views, author_name, slug')
                .eq('status', 'published')
                .order('views', { ascending: false, nullsFirst: false })
                .limit(5),

            // 11. Total Views aggregation
            supabase.from('posts').select('views'),

            // 12. Today's posts
            supabase.from('posts')
                .select('views')
                .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),

            // 13. Active Warnings
            supabase.from('posts').select('*', { count: 'exact', head: true })
                .eq('category', 'Warnings')
                .eq('is_active', true)
        ]);

        // Process Recent Activity Feed
        const activityFeed = (recentPosts || []).map(p => ({
            id: p.id,
            type: p.category,
            name: p.title,
            status: p.status,
            date: p.created_at,
            author: p.author_name || 'Agri Updates',
            slug: p.slug
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
            'Grants': '#eab308', // amber
            'Warnings': '#ef4444', // red
            'Events': '#ea580c', // orange
            'Policy': '#dc2626', // red
            'Uncategorized': '#94a3b8' // gray
        };

        const stageData = Object.entries(catCounts).map(([name, value]) => ({
            name,
            value,
            color: categoryColors[name] || '#94a3b8'
        })).sort((a, b) => b.value - a.value).slice(0, 5);

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
        const todayViews = (todayPostsData || []).reduce((acc, post) => acc + (post.views || 0), 0);
        
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
                published: publishedPosts || 0,
                drafts: draftPosts || 0,
                jobs: activeJobs || 0,
                warnings: activeWarnings || 0,
                pending: pendingReviews || 0,
                scheduled: scheduledPosts || 0,
                views: totalViews,
                todayViews: todayViews
            },
            activityFeed,
            stageData,
            trendData,
            topPosts
        };
    } catch (e) {
        console.error('Dashboard query failed:', e);
        return {
            counts: { posts: 0, published: 0, drafts: 0, jobs: 0, warnings: 0, pending: 0, scheduled: 0, views: 0, todayViews: 0 },
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
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold mb-1">Analytics Dashboard</h1>
                    <p className="text-stone-500 text-sm">Platform metrics, content performance, and activity insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/posts/new" 
                        className="bg-agri-green text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-agri-dark transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Edit3 className="w-4 h-4" />
                        Create Post
                    </Link>
                    <div className="flex items-center gap-3 pl-3 border-l border-stone-200">
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

            {/* Action Alert */}
            {(counts.pending > 0 || counts.scheduled > 0) && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-amber-900 mb-1 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Action Required
                            </h3>
                            <p className="text-sm text-amber-700">
                                {counts.pending > 0 && `${counts.pending} post${counts.pending > 1 ? 's' : ''} need review`}
                                {counts.pending > 0 && counts.scheduled > 0 && ' • '}
                                {counts.scheduled > 0 && `${counts.scheduled} scheduled`}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {counts.pending > 0 && (
                                <Link 
                                    href="/admin/posts?status=pending_review"
                                    className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors"
                                >
                                    Review Now
                                </Link>
                            )}
                            {counts.scheduled > 0 && (
                                <Link 
                                    href="/admin/posts?status=scheduled"
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                                >
                                    View Schedule
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="bg-white p-5 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-serif font-bold mb-1">{counts.posts}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Total Posts</div>
                </div>

                <div className="bg-white p-5 rounded-xl border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-serif font-bold mb-1">{counts.published}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Published</div>
                </div>

                <div className="bg-white p-5 rounded-xl border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                            <Edit3 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-serif font-bold mb-1">{counts.drafts}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Drafts</div>
                </div>

                <div className="bg-white p-5 rounded-xl border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Eye className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-serif font-bold mb-1">{counts.views.toLocaleString()}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Total Views</div>
                </div>

                <div className="bg-white p-5 rounded-xl border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-serif font-bold mb-1">{counts.todayViews.toLocaleString()}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Today</div>
                </div>

                <div className="bg-white p-5 rounded-xl border-l-4 border-agri-green shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-50 text-agri-green rounded-lg">
                            <Briefcase className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-serif font-bold mb-1">{counts.jobs}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Active Jobs</div>
                </div>

                <div className="bg-white p-5 rounded-xl border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-serif font-bold mb-1">{counts.warnings}</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider">Active Warnings</div>
                </div>
            </div>

            {/* Client-side Charts */}
            <DashboardCharts trendData={trendData} stageData={stageData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity Table */}
                <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                        <div>
                            <h3 className="font-serif text-lg font-bold">Recent Activity</h3>
                            <p className="text-xs text-stone-500 mt-0.5">Latest content updates</p>
                        </div>
                        <Link href="/admin/posts" className="text-agri-green text-xs font-bold flex items-center gap-1 hover:underline">
                            View All <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-stone-500 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-sm">
                                {activityFeed.length > 0 ? activityFeed.map((item) => (
                                    <tr key={item.id} className="hover:bg-stone-50 group transition-colors">
                                        <td className="px-4 py-3">
                                            <Link href={`/admin/posts/${item.id}`} className="font-bold text-stone-900 line-clamp-1 hover:text-agri-green">
                                                {item.name}
                                            </Link>
                                            <div className="flex gap-2 items-center mt-1">
                                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                    item.type === 'Jobs' ? 'bg-green-100 text-green-700' :
                                                    item.type === 'Research' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-stone-100 text-stone-600'
                                                }`}>
                                                    {item.type}
                                                </span>
                                                <span className="text-xs text-stone-400">by {item.author}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                item.status === 'published' ? 'bg-green-50 text-green-700' :
                                                item.status === 'scheduled' ? 'bg-purple-50 text-purple-700' :
                                                item.status === 'pending_review' ? 'bg-amber-50 text-amber-700' :
                                                'bg-stone-100 text-stone-500'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    item.status === 'published' ? 'bg-green-500' :
                                                    item.status === 'scheduled' ? 'bg-purple-500' :
                                                    item.status === 'pending_review' ? 'bg-amber-500' :
                                                    'bg-stone-400'
                                                }`} />
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs text-stone-400">
                                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-stone-500 text-sm">
                                            No recent activity
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Top Posts Table */}
                <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                        <div>
                            <h3 className="font-serif text-lg font-bold">Top Performing</h3>
                            <p className="text-xs text-stone-500 mt-0.5">Most viewed content</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                                <tr>
                                    <th className="px-4 py-3 w-12">#</th>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3 text-right">Views</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-sm">
                                {topPosts.length > 0 ? topPosts.map((post, i) => (
                                    <tr key={post.id} className="hover:bg-stone-50 group transition-colors">
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-serif text-xl font-bold ${
                                                i === 0 ? 'text-amber-500' :
                                                i === 1 ? 'text-stone-400' :
                                                i === 2 ? 'text-amber-700' :
                                                'text-stone-300'
                                            }`}>
                                                {i + 1}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link 
                                                href={`/blog/${post.slug}`} 
                                                className="font-bold text-stone-900 line-clamp-2 hover:text-agri-green transition-colors" 
                                                target="_blank"
                                            >
                                                {post.title}
                                            </Link>
                                            <div className="flex gap-2 items-center mt-1">
                                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                                                    {post.category}
                                                </span>
                                                <span className="text-xs text-stone-400">by {post.author_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="font-bold text-lg font-mono text-purple-600">
                                                {post.views.toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-stone-500 text-sm">
                                            No published posts yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
