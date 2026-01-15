// Hub type definition
export type Hub = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    h1: string;
    intro: string | null;
    filter_tag: string;
    filter_category: string;
    related_hubs: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

// Legacy type for compatibility
export type HubConfig = {
    slug: string;
    title: string;
    description: string;
    h1: string;
    intro: string;
    filter: {
        tag: string;
        category?: string;
    };
    relatedHubs?: string[];
};

// Static fallback hubs (will be migrated to DB)
export const JOB_HUBS: Record<string, HubConfig> = {
    'agriculture-jobs-maharashtra': {
        slug: 'agriculture-jobs-maharashtra',
        title: 'Agriculture Jobs in Maharashtra 2024 - Latest Agri Vacancies',
        description: 'Find the latest agriculture jobs in Maharashtra including sales, field officer, agronomist, fertilizer, and agrochemical roles. Updated daily.',
        h1: 'Agriculture Jobs in Maharashtra – Latest Agri Vacancies',
        intro: 'Find the latest agriculture jobs in Maharashtra including sales, field officer, agronomist, fertilizer, and agrochemical roles.',
        filter: {
            tag: 'Maharashtra'
        },
        relatedHubs: ['agriculture-sales-jobs', 'bsc-agriculture-jobs']
    },
    'agriculture-sales-jobs': {
        slug: 'agriculture-sales-jobs',
        title: 'Agriculture Sales Jobs in India - Sales Officer & Territory Manager Roles',
        description: 'Apply for the best Agriculture Sales Jobs. Openings for Sales Officers, Territory Managers, and Area Managers in top agrochemical companies.',
        h1: 'Agriculture Sales Jobs in India – Sales Officer & Territory Manager Roles',
        intro: 'Explore high-paying agriculture sales opportunities. We list vacancies for Sales Officers, Territory Managers, and Regional Managers across leading fertilizer and pesticide companies.',
        filter: {
            tag: 'Sales'
        },
        relatedHubs: ['agriculture-jobs-maharashtra']
    },
    'bsc-agriculture-jobs': {
        slug: 'bsc-agriculture-jobs',
        title: 'BSc Agriculture Jobs - Govt & Private Vacancies',
        description: 'Latest job opportunities for BSc Agriculture graduates in seed, fertilizer, and pesticide sectors.',
        h1: 'Latest BSc Agriculture Jobs',
        intro: 'Fresh and experienced job openings specifically for BSc Agriculture graduates.',
        filter: {
            tag: 'BSc Agri'
        },
        relatedHubs: ['agriculture-sales-jobs']
    }
};

// Convert DB Hub to HubConfig format for compatibility
export function dbHubToConfig(hub: Hub): HubConfig {
    return {
        slug: hub.slug,
        title: hub.title,
        description: hub.description || '',
        h1: hub.h1,
        intro: hub.intro || '',
        filter: {
            tag: hub.filter_tag,
            category: hub.filter_category
        },
        relatedHubs: hub.related_hubs || []
    };
}

// Get hub by slug from static config (for client-side compatibility)
export function getHub(slug: string): HubConfig | undefined {
    return JOB_HUBS[slug];
}

// Get all hubs from static config
export function getAllHubs(): HubConfig[] {
    return Object.values(JOB_HUBS);
}
