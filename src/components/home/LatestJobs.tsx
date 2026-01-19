import Link from 'next/link';
import { Post } from '@/types/database';

// Mock data for when DB is empty
const MOCK_JOBS: Partial<Post>[] = [
    {
        id: 'mock-j1',
        slug: 'data-scientist-agritech',
        title: 'Senior Data Scientist - Climate Analytics',
        company: 'AgriMind Labs',
        location: 'Bangalore',
        category: 'Jobs',
        published_at: new Date().toISOString(),
    },
    {
        id: 'mock-j2',
        slug: 'greenhouse-manager',
        title: 'Greenhouse Manager - Poultry',
        company: 'Green Growth Corp',
        location: 'Remote',
        category: 'Jobs',
        published_at: new Date().toISOString(),
    },
    {
        id: 'mock-j3',
        slug: 'soil-scientist-internship',
        title: 'Soil Scientist Intern',
        company: 'Earth Labs',
        location: 'Chennai',
        category: 'Jobs',
        published_at: new Date().toISOString(),
    },
];

type Props = {
    posts: Post[];
};

export default function LatestJobs({ posts }: Props) {
    // Use real data or fallback to mock
    const displayPosts = (posts && posts.length > 0) ? posts : MOCK_JOBS as Post[];

    return (
        <div>
            {/* Section Header */}
            <h3 className="section-header">Latest Jobs</h3>

            {/* List */}
            <div className="flex flex-col gap-6">
                {displayPosts.slice(0, 4).map((post) => (
                    <div key={post.id} className="newspaper-card-minimal group">
                        <Link href={`/blog/${post.slug}`} className="block">
                            <h4 className="text-lg font-bold leading-snug mb-2 group-hover:text-agri-green transition-colors">
                                {post.title}
                            </h4>
                            <p className="text-xs text-stone-500 uppercase tracking-wide">
                                {post.company || 'Company'} • {post.location || 'Location'}
                            </p>
                        </Link>
                    </div>
                ))}
            </div>

            {/* View All */}
            <div className="mt-4 pt-4 border-t border-stone-200">
                <Link
                    href="/jobs"
                    className="text-[10px] font-bold uppercase tracking-widest text-agri-green hover:text-black transition-colors"
                >
                    View All Jobs →
                </Link>
            </div>
        </div>
    );
}
