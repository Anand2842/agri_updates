import { PolicyConfig } from '@/types/database';

export interface WriterFormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author_name: string;
    author_id: string;
    category: string;
    image_url: string;
    is_featured: boolean;
    featured_until: string;
    display_location: 'hero' | 'featured' | 'trending' | 'dont_miss' | 'standard';
    tags: string;
    scheduled_for: string;
    company: string;
    location: string;
    job_type: string;
    salary_range: string;
    application_link: string;
    status: string;
    is_active: boolean;
    policy_rules: PolicyConfig | null;
    attachment_url: string;
    attachment_type: string;
}
