import Link from 'next/link';
import { Post } from '@/types/database';

// Mock data for when DB is empty
const MOCK_RESEARCH: Partial<Post>[] = [
    {
        id: 'mock-r1',
        slug: 'ai-crop-yield-model',
        title: 'CRISP-R in Agriculture: Ethical Boundaries',
        excerpt: 'A comprehensive review of the latest gene editing technologies and their implications for farming.',
        category: 'Research',
        published_at: new Date().toISOString(),
    },
    {
        id: 'mock-r2',
        slug: 'soil-microbiome-study',
        title: 'Freshwater Nutrient Fluxes',
        excerpt: 'Field experiments reveal critical links between irrigation practices and ecosystem health.',
        category: 'Research',
        published_at: new Date().toISOString(),
    },
    {
        id: 'mock-r3',
        slug: 'climate-resistant-crops',
        title: 'Impact Factor: 18.5',
        excerpt: 'Government grants $100 crore for R&D in Agricultural Research-Hub Initiative.',
        category: 'Research',
        published_at: new Date().toISOString(),
    },
];

type Props = {
    posts: Post[];
};

export default function ResearchPapers({ posts }: Props) {
    // Use real data or fallback to mock
    const displayPosts = (posts && posts.length > 0) ? posts : MOCK_RESEARCH as Post[];

    return (
        <div>
            {/* Section Header */}
            <h3 className="section-header">Research Papers</h3>

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
