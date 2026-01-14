import Link from 'next/link';
import { Post } from '@/types/database';

// Mock data for when DB is empty
const MOCK_STARTUPS: Partial<Post>[] = [
    {
        id: 'mock-s1',
        slug: 'agritech-funding',
        title: 'BioBloom launches AI-Powered Identification App',
        excerpt: 'Instantly identify plant diseases using your smartphone camera.',
        category: 'Startups',
        published_at: new Date().toISOString(),
    },
    {
        id: 'mock-s2',
        slug: 'farmtech-series-a',
        title: 'FarmByte annual revenue grows 40% in 2024',
        excerpt: 'The precision agriculture startup expands to Southeast Asian markets.',
        category: 'Startups',
        published_at: new Date().toISOString(),
    },
    {
        id: 'mock-s3',
        slug: 'dronetech-launch',
        title: 'Kris Electric enters E-Tractor market',
        excerpt: 'New electric tractors promise 50% cost reduction for farmers.',
        category: 'Startups',
        published_at: new Date().toISOString(),
    },
];

type Props = {
    posts: Post[];
};

export default function StartupsSection({ posts }: Props) {
    // Use real data or fallback to mock
    const displayPosts = (posts && posts.length > 0) ? posts : MOCK_STARTUPS as Post[];

    return (
        <div>
            {/* Section Header */}
            <h3 className="section-header">Startups</h3>

            {/* List */}
            <div className="flex flex-col">
                {displayPosts.slice(0, 4).map((post) => (
                    <div key={post.id} className="newspaper-card-minimal group">
                        <Link href={`/blog/${post.slug}`} className="block">
                            <h4 className="font-serif text-base font-bold leading-snug mb-1 group-hover:text-agri-green transition-colors">
                                {post.title}
                            </h4>
                            <p className="text-xs text-stone-500 font-serif line-clamp-2">
                                {post.excerpt}
                            </p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
