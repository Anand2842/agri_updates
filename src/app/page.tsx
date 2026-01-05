import FeaturedGrid from '@/components/home/FeaturedGrid';
import Trending from '@/components/home/Trending';
import MainHero from '@/components/home/MainHero';
import Opportunities from '@/components/home/Opportunities';
import DontMiss from '@/components/home/DontMiss';
import { supabase } from '@/lib/supabase';
import { Post, Job } from '@/types/database';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agricultural Jobs, Internships & Innovation News in India',
  description: "Agri Updates is India's premier platform for agricultural careers, research breakthroughs, fellowships, and startup innovation. Find your next opportunity today.",
};

export const revalidate = 3600; // Dynamic for now

// MOCK DATA for Fallback
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'New AI Model Predicts Crop Yield with 98% Accuracy',
    slug: 'ai-crop-yield',
    category: 'Research',
    author_name: 'Sarah Jenkins',
    excerpt: 'Researchers at MIT have developed a new machine learning algorithm that significantly improves yield predictions.',
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80',
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    content: ''
  },
  {
    id: '2',
    title: 'Vertical Farming Startup \'GreenSky\' Raises $10M',
    slug: 'vertical-farming-greensky',
    category: 'Startups',
    author_name: 'Mark Doe',
    excerpt: 'The funding will accelerate their expansion into urban centers across Europe and Asia by 2025.',
    image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80',
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    content: ''
  },
  {
    id: '3',
    title: 'Top 10 High-Paying Internships in AgriTech for 2024',
    slug: 'top-internships-2024',
    category: 'Internships',
    author_name: 'Staff',
    excerpt: 'A curated list of the best opportunities for students looking to break into the sustainable tech sector.',
    image_url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80',
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    content: ''
  },
  {
    id: '4',
    title: 'The Rise of Autonomous Drones in Precision Agriculture',
    slug: 'autonomous-drones',
    category: 'Technology',
    author_name: 'Dr. Arjun Singh',
    excerpt: 'Amid growing concerns over labor shortages and climate change, startups are deploying swarms of AI-powered drones to plant, monitor, and harvest.',
    image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80',
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    content: ''
  },
  {
    id: '5',
    title: 'Botanical AI: Identifying Rare Species',
    slug: 'botanical-ai',
    category: 'Technology',
    author_name: 'Tech Team',
    excerpt: '',
    image_url: null,
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    content: ''
  },
  {
    id: '6',
    title: 'NASA Space Plant Challenge Results',
    slug: 'nasa-space-plant',
    category: 'Research',
    author_name: 'NASA',
    excerpt: '',
    image_url: null,
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    content: ''
  },
  {
    id: '7',
    title: 'Sustainable Farming: The Nitrogen Fix',
    slug: 'nitrogen-fix',
    category: 'Environment',
    author_name: 'EcoWatch',
    excerpt: '',
    image_url: null,
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    content: ''
  },
  {
    id: '8',
    title: 'Understanding Soil Microbiomes',
    slug: 'soil-microbiomes',
    category: 'Ecosystem',
    author_name: 'Prof. Grant',
    excerpt: 'A deep dive into the fungal networks beneath our feet.',
    image_url: null,
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    content: ''
  },
  {
    id: '9',
    title: 'The Future of Hydroponics in Deserts',
    slug: 'hydro-deserts',
    category: 'Global',
    author_name: 'World Bank',
    excerpt: 'Turning sand into salad: Tech solutions for arid regions.',
    image_url: null,
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    content: ''
  },
  {
    id: '10',
    title: 'Nvidia supports AgriTech Labs',
    slug: 'nvidia-agri',
    category: 'Partnership',
    author_name: 'News Desk',
    excerpt: '',
    image_url: null,
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    content: ''
  },
  {
    id: '11',
    title: 'Traya Health enters Herbal Supplement Market',
    slug: 'traya-health',
    category: 'Market',
    author_name: 'Business Wire',
    excerpt: 'Ayurveda meets AI in new product line.',
    image_url: null,
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    content: ''
  }
];

const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Junior Botanist Role',
    company: 'Green Growth Labs',
    location: 'Remote',
    type: 'Full-time',
    salary_range: '$50k - $70k', // Added
    application_link: '#',
    description: 'Entry level position for a botanist enthusiast.', // Added
    tags: ['Entry Level', 'Remote'],
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Agri-Tech Senior Developer',
    company: 'FarmFuture Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary_range: '$120k - $160k', // Added
    application_link: '#',
    description: 'Senior developer needed to lead our frontend team.', // Added
    tags: ['Senior', 'Tech', 'React'],
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Soil Health Specialist',
    company: 'Earth Matters',
    location: 'Austin, TX',
    type: 'Contract',
    salary_range: '$80/hr', // Added
    application_link: '#',
    description: 'Contract role for soil analysis and reporting.', // Added
    tags: ['Contract', 'Science'],
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Summer Internship: Urban Farming',
    company: 'Square Roots',
    location: 'NYC',
    type: 'Internship',
    salary_range: '$20/hr', // Added
    application_link: '#',
    description: 'Learn urban farming techniques this summer.', // Added
    tags: ['Intern'],
    is_active: true,
    created_at: new Date().toISOString()
  }
];


async function getData() {
  try {
    const { data: posts, error: postError } = await supabase
      .from('posts')
      .select('*')
      .neq('category', 'Jobs') // Exclude jobs from regular posts fetch
      .order('published_at', { ascending: false });

    // Fetch jobs from posts table
    const { data: jobsData, error: jobError } = await supabase
      .from('posts')
      .select('*')
      .eq('category', 'Jobs')
      .eq('is_active', true) // Assuming is_active column exists on posts or is null
      .order('created_at', { ascending: false })
      .limit(10);

    if (postError) console.error('Supabase posts fetch error:', JSON.stringify(postError, null, 2));
    if (jobError) console.error('Supabase jobs fetch error:', JSON.stringify(jobError, null, 2));

    // Map posts to Job interface 
    // We assume the extra job fields are stored in the table columns 
    // based on previous context, but will use 'any' casting for safety 
    // if types aren't perfectly aligned yet.
    const jobs: Job[] = (jobsData || []).map((post: any) => ({
      id: post.id,
      title: post.title,
      company: post.company || 'Unknown Company', // Fallback
      location: post.location || 'Remote',
      type: post.job_type || 'Full-time', // mapped from job_type in posts
      salary_range: post.salary_range,
      application_link: post.application_link,
      description: post.content || post.description || '',
      tags: post.tags || [],
      is_active: post.is_active ?? true,
      created_at: post.created_at
    }));


    return {
      posts: (posts && posts.length > 0) ? posts : MOCK_POSTS,
      jobs: (jobs && jobs.length > 0) ? jobs : MOCK_JOBS
    };

  } catch (e) {
    console.error('Supabase connection failed:', e);
    return { posts: MOCK_POSTS, jobs: MOCK_JOBS };
  }
}

export default async function Home() {
  const { posts, jobs } = await getData();

  // 1. Filter Feature-eligible posts
  // Real DB data might differ from Mock structure, ensure is_featured exists
  const featuredCandidates = posts.filter(p => p.is_featured === true);

  // 2. Featured Grid (Top 3 Featured)
  const featuredPosts = featuredCandidates.slice(0, 3);

  // 3. Main Hero (The 4th Featured Post, or the most recent one if not enough featured)
  const mainHeroPost = featuredCandidates.length > 3 ? featuredCandidates[3] : (posts[0] || null);

  // 4. Trending (Next 5 posts, excluding the ones already shown)
  // We filter out IDs that are already in featured/hero to avoid duplication
  const shownIds = new Set([
    ...featuredPosts.map(p => p.id),
    mainHeroPost?.id
  ].filter(Boolean));

  const trendingPosts = posts
    .filter(p => !shownIds.has(p.id))
    .slice(0, 5);

  // Add trending to shown
  trendingPosts.forEach(p => shownIds.add(p.id));

  // 5. Dont Miss (Next 4 posts)
  const dontMissPosts = posts
    .filter(p => !shownIds.has(p.id))
    .slice(0, 4);

  return (
    <div className="bg-white min-h-screen pb-20">
      <FeaturedGrid posts={featuredPosts} />

      <section className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-stone-200 pt-12">

        {/* Left Column: Trending (3 cols) */}
        <aside className="lg:col-span-3 order-2 lg:order-1">
          <Trending posts={trendingPosts} />
        </aside>

        {/* Center Column: Main Hero (6 cols) */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <MainHero post={mainHeroPost} />
        </div>

        {/* Right Column: Opportunities (3 cols) */}
        <aside className="lg:col-span-3 order-3 lg:order-3">
          <Opportunities jobs={jobs} />
        </aside>

      </section>

      <DontMiss posts={dontMissPosts} />

    </div>
  );
}
