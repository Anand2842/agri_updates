import FeaturedGrid from '@/components/home/FeaturedGrid';
import Trending from '@/components/home/Trending';
import MainHero from '@/components/home/MainHero';
import Opportunities from '@/components/home/Opportunities';
import DontMiss from '@/components/home/DontMiss';
import SubscribeBlock from '@/components/home/SubscribeBlock';
import ResearchPapers from '@/components/home/ResearchPapers';
import StartupsSection from '@/components/home/StartupsSection';
import LatestJobs from '@/components/home/LatestJobs';
import QuickFAQ from '@/components/home/QuickFAQ';
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
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
    status: 'published',
    created_at: new Date().toISOString()
  }
];


async function getData() {
  try {
    const { data: posts, error: postError } = await supabase
      .from('posts')
      .select('*')
      // .neq('category', 'Jobs') // ALLOW Jobs in main feed now
      .eq('status', 'published') // Only show published posts
      .order('published_at', { ascending: false });

    // Fetch jobs from posts table
    const { data: jobsData, error: jobError } = await supabase
      .from('posts')
      .select('*')
      .eq('category', 'Jobs')
      .eq('status', 'published') // Only show published jobs
      .order('created_at', { ascending: false })
      .limit(10);

    if (postError) console.error('Supabase posts fetch error:', JSON.stringify(postError, null, 2));
    if (jobError) console.error('Supabase jobs fetch error:', JSON.stringify(jobError, null, 2));

    // Map posts to Job interface 
    // We assume the extra job fields are stored in the table columns 
    // based on previous context, but will use 'any' casting for safety 
    // if types aren't perfectly aligned yet.
    const jobs: Job[] = (jobsData || []).map((post: Post) => ({
      id: post.id,
      title: post.title,
      company: post.company || 'Unknown Company',
      location: post.location || 'Remote',
      type: post.job_type || 'Full-time',
      salary_range: post.salary_range || null,
      application_link: post.application_link || null,
      description: post.content || post.excerpt || '',
      tags: post.tags || [],
      status: post.status,
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

  // --- REFINED SLOT LOGIC WITH ADMIN WIREUPS ---

  // 1. Bucket posts by their explicit display_location
  const explicitHero = posts.filter(p => p.display_location === 'hero');
  const explicitFeatured = posts.filter(p => p.display_location === 'featured');
  const explicitTrending = posts.filter(p => p.display_location === 'trending');
  const explicitDontMiss = posts.filter(p => p.display_location === 'dont_miss');

  const shownIds = new Set<string>();

  // Helper to check if a post is already shown
  const isAvailable = (p: Post) => !shownIds.has(p.id);
  const markShown = (p: Post) => shownIds.add(p.id);

  // 2. Select Main Hero (Priority: Explicit 'hero' -> First Featured -> First Recent)
  let mainHeroPost: Post | null = null;

  if (explicitHero.length > 0 && isAvailable(explicitHero[0])) {
    mainHeroPost = explicitHero[0];
  } else {
    // Fallback: Use first featured post that isn't already used (though none used yet)
    // or just the first post in the list.
    const fallback = posts.find(p => p.is_featured) || posts[0];
    if (fallback) mainHeroPost = fallback;
  }

  if (mainHeroPost) markShown(mainHeroPost);

  // Helper to check if featured is still active (not expired)
  const isFeaturedActive = (p: Post) => {
    if (!p.is_featured) return false;
    if (!p.featured_until) return true; // No expiration = forever featured
    return new Date(p.featured_until) > new Date(); // Check if not yet expired
  };

  // 3. Select Featured Grid (Target: 3 posts)
  // Priority: Explicit 'featured' -> Other is_featured=true posts (that haven't expired)
  let featuredPosts: Post[] = [];

  // Add explicit featured ones first
  explicitFeatured.forEach(p => {
    if (isAvailable(p) && featuredPosts.length < 3) {
      featuredPosts.push(p);
      markShown(p);
    }
  });

  // Fill remainder with generic featured posts (checking expiration)
  if (featuredPosts.length < 3) {
    const candidates = posts.filter(p => isFeaturedActive(p) && isAvailable(p));
    for (const p of candidates) {
      if (featuredPosts.length >= 3) break;
      featuredPosts.push(p);
      markShown(p);
    }
  }

  // 4. Select Trending (Target: 5 posts)
  // Priority: Explicit 'trending' -> Next available recent posts
  let trendingPosts: Post[] = [];

  explicitTrending.forEach(p => {
    if (isAvailable(p) && trendingPosts.length < 5) {
      trendingPosts.push(p);
      markShown(p);
    }
  });

  if (trendingPosts.length < 5) {
    // Fill with remaining posts (sorted by date desc from fetch)
    const candidates = posts.filter(p => isAvailable(p));
    for (const p of candidates) {
      if (trendingPosts.length >= 5) break;
      trendingPosts.push(p);
      markShown(p);
    }
  }

  // 5. Select Don't Miss (Target: 4 posts)
  // Priority: Explicit 'dont_miss' -> Next available recent posts
  let dontMissPosts: Post[] = [];

  explicitDontMiss.forEach(p => {
    if (isAvailable(p) && dontMissPosts.length < 4) {
      dontMissPosts.push(p);
      markShown(p);
    }
  });

  if (dontMissPosts.length < 4) {
    const candidates = posts.filter(p => isAvailable(p));
    for (const p of candidates) {
      if (dontMissPosts.length >= 4) break;
      dontMissPosts.push(p);
      markShown(p);
    }
  }

  // Filter posts by category for bottom sections
  const researchPosts = posts.filter(p => p.category === 'Research');
  const startupPosts = posts.filter(p => p.category === 'Startups');
  const jobPosts = posts.filter(p => p.category === 'Jobs');

  return (
    <div className="bg-paper-bg min-h-screen">
      {/* Screen-reader accessible H1 for SEO */}
      <h1 className="sr-only">Agricultural Jobs, Internships & Innovation News in India</h1>

      {/* Featured Grid */}
      <FeaturedGrid posts={featuredPosts} />

      {/* Subscribe Block */}
      <SubscribeBlock />

      {/* Main Content Grid */}
      <section className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 py-12">
        {/* Left Column: Trending */}
        <aside className="lg:col-span-3 order-2 lg:order-1">
          <Trending posts={trendingPosts} />
        </aside>

        {/* Center Column: Main Hero */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          {mainHeroPost && <MainHero post={mainHeroPost} />}
        </div>

        {/* Right Column: Opportunities */}
        <aside className="lg:col-span-3 order-3 lg:order-3">
          <Opportunities jobs={jobs} />
        </aside>
      </section>

      {/* Don't Miss Section */}
      <DontMiss posts={dontMissPosts} />

      {/* Bottom Categories Section */}
      <section className="container mx-auto px-4 py-12 border-t border-stone-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ResearchPapers posts={researchPosts} />
          <StartupsSection posts={startupPosts} />
          <LatestJobs posts={jobPosts} />
        </div>
      </section>
    </div>
  );
}
