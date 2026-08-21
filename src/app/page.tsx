import FeaturedGrid from '@/components/home/FeaturedGrid';
import Trending from '@/components/home/Trending';
import MainHero from '@/components/home/MainHero';
import DontMiss from '@/components/home/DontMiss';
import SubscribeBlock from '@/components/home/SubscribeBlock';
import GrantsSection from '@/components/home/GrantsSection';
import WarningsStrip from '@/components/home/WarningsStrip';
import StartupsSection from '@/components/home/StartupsSection';
import LatestJobs from '@/components/home/LatestJobs';
import CoverageMap from '@/components/home/CoverageMap';
import SectionsDesk from '@/components/home/SectionsDesk';
import LatestNewsFeed from '@/components/home/LatestNewsFeed';
import AdBanner from '@/components/ads/AdBanner';
import { supabase } from '@/lib/supabase';
import { Post, Job } from '@/types/database';
import { Metadata } from 'next';
import { getPublicCategories } from '@/lib/public-categories';
import { normalizePostRecord } from '@/lib/public-posts';

export const metadata: Metadata = {
  title: 'Agriculture Jobs, News & Grants India 2026 | Agri Updates',
  description: "Agri Updates is India's premier platform for agricultural careers, funding, scholarships, fellowships, explicit warnings, and agri-startup innovation. Find your next opportunity today.",
  alternates: {
    canonical: '/',
  },
};

export const revalidate = 60;

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
    slug: 'junior-botanist-role',
    title: 'Junior Botanist Role',
    company: 'Green Growth Labs',
    location: 'Remote',
    type: 'Full-time',
    salary_range: '$50k - $70k',
    application_link: '#',
    description: 'Entry level position for a botanist enthusiast.',
    tags: ['Entry Level', 'Remote'],
    is_active: true,
    status: 'published',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    slug: 'agri-tech-senior-developer',
    title: 'Agri-Tech Senior Developer',
    company: 'FarmFuture Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary_range: '$120k - $160k',
    application_link: '#',
    description: 'Senior developer needed to lead our frontend team.',
    tags: ['Senior', 'Tech', 'React'],
    is_active: true,
    status: 'published',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    slug: 'soil-health-specialist',
    title: 'Soil Health Specialist',
    company: 'Earth Matters',
    location: 'Austin, TX',
    type: 'Contract',
    salary_range: '$80/hr',
    application_link: '#',
    description: 'Contract role for soil analysis and reporting.',
    tags: ['Contract', 'Science'],
    is_active: true,
    status: 'published',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    slug: 'summer-internship-urban-farming',
    title: 'Summer Internship: Urban Farming',
    company: 'Square Roots',
    location: 'NYC',
    type: 'Internship',
    salary_range: '$20/hr',
    application_link: '#',
    description: 'Learn urban farming techniques this summer.',
    tags: ['Intern'],
    is_active: true,
    status: 'published',
    created_at: new Date().toISOString()
  }
];

function isJobListing(post: Post): boolean {
  const title = (post.title || '').toLowerCase();
  return /hiring|vacancy|job opening|position|territory manager|sales officer|field executive/i.test(title);
}

async function getData() {
  try {
    const { data: posts, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    const { data: jobsData, error: jobError } = await supabase
      .from('posts')
      .select('*')
      .eq('category', 'Jobs')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);

    if (postError) console.error('Supabase posts fetch error:', JSON.stringify(postError, null, 2));
    if (jobError) console.error('Supabase jobs fetch error:', JSON.stringify(jobError, null, 2));

    const jobs: Job[] = (jobsData || []).map((post: Post) => ({
      id: post.id,
      slug: post.slug,
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
      posts: (posts && posts.length > 0) 
        ? posts.map((post) => normalizePostRecord(post))
        : MOCK_POSTS,
      jobs: (jobs && jobs.length > 0) ? jobs : MOCK_JOBS
    };

  } catch (e) {
    console.error('Supabase connection failed:', e);
    return { posts: MOCK_POSTS, jobs: MOCK_JOBS };
  }
}

export default async function Home() {
  const [{ posts, jobs }, publicCategories] = await Promise.all([
    getData(),
    getPublicCategories(),
  ]);

  const feedPosts = posts.filter((post) => 
    post.category !== 'Jobs' && 
    post.category !== 'Warnings' && 
    !isJobListing(post)
  );

  // 1. Bucket posts by explicit display_location
  const explicitHero = feedPosts.filter(p => p.display_location === 'hero');
  const explicitFeatured = feedPosts.filter(p => p.display_location === 'featured');
  const explicitTrending = feedPosts.filter(p => p.display_location === 'trending');
  const explicitDontMiss = feedPosts.filter(p => p.display_location === 'dont_miss');

  const shownIds = new Set<string>();
  const isAvailable = (p: Post) => !shownIds.has(p.id);
  const markShown = (p: Post) => shownIds.add(p.id);

  // 2. Select Main Hero
  let mainHeroPost: Post | null = null;
  if (explicitHero.length > 0 && isAvailable(explicitHero[0])) {
    mainHeroPost = explicitHero[0];
  } else {
    const fallback = feedPosts.find(p => p.is_featured) || feedPosts[0];
    if (fallback) mainHeroPost = fallback;
  }
  if (mainHeroPost) markShown(mainHeroPost);

  const isFeaturedActive = (p: Post) => {
    if (!p.is_featured) return false;
    if (!p.featured_until) return true;
    return new Date(p.featured_until) > new Date();
  };

  // 3. Select Featured Grid (3 posts)
  const featuredPosts: Post[] = [];
  explicitFeatured.forEach(p => {
    if (isAvailable(p) && featuredPosts.length < 3) {
      featuredPosts.push(p);
      markShown(p);
    }
  });
  if (featuredPosts.length < 3) {
    const candidates = feedPosts.filter(p => isFeaturedActive(p) && isAvailable(p));
    for (const p of candidates) {
      if (featuredPosts.length >= 3) break;
      featuredPosts.push(p);
      markShown(p);
    }
  }

  // 4. Select Trending (5 posts)
  const trendingPosts: Post[] = [];
  explicitTrending.forEach(p => {
    if (isAvailable(p) && trendingPosts.length < 5) {
      trendingPosts.push(p);
      markShown(p);
    }
  });
  if (trendingPosts.length < 5) {
    const candidates = feedPosts.filter(p => isAvailable(p));
    for (const p of candidates) {
      if (trendingPosts.length >= 5) break;
      trendingPosts.push(p);
      markShown(p);
    }
  }

  // 5. Select Don't Miss (4 posts)
  const dontMissPosts: Post[] = [];
  explicitDontMiss.forEach(p => {
    if (isAvailable(p) && dontMissPosts.length < 4) {
      dontMissPosts.push(p);
      markShown(p);
    }
  });
  if (dontMissPosts.length < 4) {
    const candidates = feedPosts.filter(p => isAvailable(p));
    for (const p of candidates) {
      if (dontMissPosts.length >= 4) break;
      dontMissPosts.push(p);
      markShown(p);
    }
  }

  // Filter posts by category for bottom sections
  const grantsPosts = posts.filter(p => p.category === 'Grants');
  const startupPosts = posts.filter(p => p.category === 'Startups');
  const jobPosts = posts.filter(p => p.category === 'Jobs');
  const warningsPosts = posts.filter(p => p.category === 'Warnings');
  const categoryPostsMap = new Map(publicCategories.map((category) => [
    category.name,
    posts.filter((post) => post.category === category.name),
  ]));

  const sectionsDesk = publicCategories
    .filter((category) => category.surfaceType === 'editorial' && category.name !== 'Warnings')
    .slice(0, 4)
    .map((descriptor) => ({
      descriptor,
      posts: categoryPostsMap.get(descriptor.name) || [],
    }));

  const coverageMapItems = publicCategories.map((descriptor) => {
    if (descriptor.name === 'Jobs') {
      return {
        descriptor,
        href: descriptor.href,
        headline: jobs[0]?.title || 'Open the live jobs desk',
        stat: `${jobs.length} live`,
      };
    }

    const latestPost = (categoryPostsMap.get(descriptor.name) || [])[0];

    return {
      descriptor,
      href: descriptor.href,
      headline: latestPost?.title,
      stat: latestPost ? `${categoryPostsMap.get(descriptor.name)?.length || 0} live` : undefined,
    };
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Screen-reader accessible H1 for SEO */}
      <h1 className="sr-only">Agricultural Jobs, Internships, Grants & Innovation News in India</h1>

      {/* 1. Warnings / Advisories Strip */}
      {warningsPosts.length > 0 && <WarningsStrip posts={warningsPosts} />}

      {/* 2. Main Intelligence Showcase Grid (Beat 1: Single column on mobile, 12-cols on desktop) */}
      <section className="editorial-shell pt-6 sm:pt-8 pb-8 sm:pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start border-b border-slate-100">
        <div className="lg:col-span-8 order-1">
          {mainHeroPost && <MainHero post={mainHeroPost} />}
        </div>

        <div className="lg:col-span-4 order-2 lg:border-l border-slate-100 lg:pl-8 pt-4 lg:pt-0">
          <Trending posts={trendingPosts} />
        </div>
      </section>

      {/* 3. Latest Agriculture News Ticker (Beat 2) */}
      <section className="editorial-shell my-8 sm:my-12">
        <LatestNewsFeed posts={feedPosts} />
      </section>

      {/* Ad Placement */}
      <div className="editorial-shell my-4 sm:my-6">
        <AdBanner placement="banner" />
      </div>

      {/* 4. Featured Curated Stories (Beat 3) */}
      <FeaturedGrid posts={featuredPosts} />

      {/* 5. Deep Dives / Don't Miss (Beat 4) */}
      <DontMiss posts={dontMissPosts} />

      {/* 6. Desks & Coverage Explorer */}
      <CoverageMap items={coverageMapItems} />

      {/* 7. Detailed Section Desks */}
      <SectionsDesk sections={sectionsDesk} />

      {/* 8. Bottom Specialized Resources Hub (Grants, Startups, Jobs) */}
      <section className="editorial-shell py-8 sm:py-12 border-t border-slate-200/80">
        <div className="mb-6 pb-3 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-end justify-between gap-1">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700">Specialized Resources</p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Capital, Startups & Careers Hub</h2>
          </div>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <GrantsSection posts={grantsPosts} />
          <StartupsSection posts={startupPosts} />
          <LatestJobs posts={jobPosts} />
        </div>
      </section>

      {/* 9. Daily Briefing Signup */}
      <SubscribeBlock />
    </div>
  );
}
