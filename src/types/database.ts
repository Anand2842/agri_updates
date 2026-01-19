

export type Job = {
    id: string
    title: string
    company: string
    location: string | null
    type: string | null
    salary_range: string | null
    application_link: string | null
    description: string | null // Added description
    tags: string[] | null
    status: 'draft' | 'published' | 'archived' | 'scheduled' | 'pending_review'
    is_active: boolean
    created_at: string
}

export type Startup = {
    id: string
    name: string
    description: string | null
    funding_stage: string | null
    location: string | null
    logo_url: string | null
    website_url: string | null // Added
    tags?: string[] | null
    created_at: string
}

export type Applicant = {
    id: string
    name: string
    email: string | null
    role: string
    stage: 'New Applied' | 'Screening' | 'Technical Interview' | 'Offer Sent' | 'Hired' | 'Rejected'
    type: string | null
    match_score: number
    image_url: string | null
    created_at: string
}

export type Company = {
    id: string
    name: string
    industry: string | null
    status: 'Active Partner' | 'Research Partner' | 'Lead' | 'Churned' | 'Pending'
    location: string | null
    contact_email: string | null
    website: string | null
    health_score: number
    active_jobs: number
    total_hires: number
    logo_type: string | null // 'leaf' | 'micro' | 'soil' | 'drone' | 'water' | 'default'
    last_interaction: string | null
    created_at: string
}

export type ResearchProject = {
    id: string
    title: string
    description: string | null
    status: 'Active' | 'Pending Review' | 'Planning' | 'Completed'
    progress: number
    budget_utilized: number
    start_date: string | null
    team_count: number
    lead_name: string | null
    created_at: string
}


export type Comment = {
    id: string
    post_id: string
    parent_id: string | null
    user_name: string
    content: string
    likes: number
    created_at: string
}

export type Author = {
    id: string
    name: string
    bio: string | null
    role: string | null
    avatar_url: string | null
    social_links: Record<string, string> | null
    is_active: boolean
    created_at: string
}

export type Post = {
    id: string
    author_id?: string | null // NEW: Link to Author table
    title: string
    slug: string
    excerpt: string | null
    content: string | null
    category: string
    author_name: string // Keeper for backward compat or custom overrides
    image_url: string | null
    is_featured: boolean
    featured_until?: string | null  // ISO date string for featured expiration
    display_location?: 'hero' | 'featured' | 'trending' | 'dont_miss' | 'standard'
    author_bio?: string | null
    author_image?: string | null
    author_social_twitter?: string | null
    author_social_linkedin?: string | null
    status: 'draft' | 'published' | 'archived' | 'scheduled' | 'pending_review'
    views?: number
    published_at: string
    scheduled_for?: string | null // NEW: Timestamp for scheduled publishing
    updated_at?: string
    created_at: string

    // Job-specific fields (optional, only for category='Jobs')
    company?: string | null
    location?: string | null
    job_type?: string | null
    salary_range?: string | null
    application_link?: string | null
    is_active?: boolean
    tags?: string[] | null

    // Relation
    authors?: Author | null
}

export type Ad = {
    id: string
    title: string
    image_url: string
    link_url: string
    placement: 'banner' | 'sidebar' | 'popup'
    is_active: boolean
    start_date?: string | null
    end_date?: string | null
    views: number
    clicks: number
    created_at: string
}
