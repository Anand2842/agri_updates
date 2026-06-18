import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import { Category } from '@/types/database'

export type CategoryAccent = 'graphite' | 'forest' | 'sage' | 'amber' | 'vermilion'
export type CategorySurfaceType = 'editorial' | 'utility' | 'alerts'

export type PublicCategoryDescriptor = {
    name: string
    slug: string
    href: string
    label: string
    description: string
    accent: CategoryAccent
    order: number
    surfaceType: CategorySurfaceType
}

type CategoryPreset = Pick<PublicCategoryDescriptor, 'label' | 'description' | 'accent' | 'order' | 'surfaceType'> & {
    aliases?: string[]
}

const CATEGORY_PRESETS: Record<string, CategoryPreset> = {
    news: {
        label: 'News',
        description: 'Global agriculture reporting, policy movement, market signals, and field intelligence.',
        accent: 'graphite',
        order: 1,
        surfaceType: 'editorial',
        aliases: ['general news', 'latest news'],
    },
    research: {
        label: 'Research',
        description: 'Science, trials, university findings, and evidence-led coverage shaping the sector.',
        accent: 'sage',
        order: 2,
        surfaceType: 'editorial',
        aliases: ['research papers', 'studies'],
    },
    grants: {
        label: 'Grants & Funding',
        description: 'Funding calls, fellowships, schemes, and capital pathways for institutions and operators.',
        accent: 'amber',
        order: 3,
        surfaceType: 'editorial',
        aliases: ['funding', 'grant', 'grants & funding'],
    },
    jobs: {
        label: 'Jobs',
        description: 'Career openings, internships, and verified hiring across agriculture and agritech.',
        accent: 'forest',
        order: 4,
        surfaceType: 'utility',
        aliases: ['job', 'careers', 'career'],
    },
    startups: {
        label: 'Startups',
        description: 'Startup launches, company moves, funding rounds, and ecosystem tracking.',
        accent: 'forest',
        order: 5,
        surfaceType: 'utility',
        aliases: ['startup', 'startup news'],
    },
    warnings: {
        label: 'Warnings',
        description: 'Urgent advisories, safety alerts, pest warnings, and time-sensitive notices.',
        accent: 'vermilion',
        order: 6,
        surfaceType: 'alerts',
        aliases: ['warning', 'alerts', 'alert'],
    },
}

const FALLBACK_CATEGORY_NAMES = ['News', 'Research', 'Grants', 'Jobs', 'Startups', 'Warnings']

export const ALL_UPDATES_DESCRIPTOR: PublicCategoryDescriptor = {
    name: 'All Updates',
    slug: 'all',
    href: '/updates',
    label: 'All Updates',
    description: 'A live index of reporting, research, grants, startup news, jobs, and urgent advisories.',
    accent: 'graphite',
    order: 0,
    surfaceType: 'editorial',
}

export function toCategorySlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

function normalizeCategoryValue(value: string) {
    return value.toLowerCase().trim()
}

export function resolveCategoryPresetKey(value?: string | null) {
    if (!value) return null

    const normalized = normalizeCategoryValue(value)
    const generated = toCategorySlug(value)

    for (const [key, preset] of Object.entries(CATEGORY_PRESETS)) {
        if (key === normalized || key === generated) {
            return key
        }

        if (preset.aliases?.some((alias) => normalizeCategoryValue(alias) === normalized || toCategorySlug(alias) === generated)) {
            return key
        }
    }

    return null
}

function buildPublicCategoryHref(name: string, slug: string) {
    const presetKey = resolveCategoryPresetKey(name) || resolveCategoryPresetKey(slug)

    if (presetKey === 'jobs') return '/jobs'
    if (presetKey === 'startups') return '/startups'

    return `/updates/${slug}`
}

function buildPublicCategoryDescriptor(category: Pick<Category, 'name' | 'slug' | 'description'>): PublicCategoryDescriptor {
    const presetKey = resolveCategoryPresetKey(category.name) || resolveCategoryPresetKey(category.slug)
    const preset = presetKey ? CATEGORY_PRESETS[presetKey] : null
    const slug = category.slug || toCategorySlug(category.name)

    return {
        name: category.name,
        slug,
        href: buildPublicCategoryHref(category.name, slug),
        label: preset?.label || category.name,
        description: category.description || preset?.description || `${category.name} updates from across agriculture and allied sectors.`,
        accent: preset?.accent || 'graphite',
        order: preset?.order ?? 50,
        surfaceType: preset?.surfaceType || 'editorial',
    }
}

function fallbackDescriptor(name: string): PublicCategoryDescriptor {
    return buildPublicCategoryDescriptor({
        name,
        slug: toCategorySlug(name),
        description: null,
    })
}

export const getPublicCategories = cache(async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('name, slug, description, is_active')
        .eq('is_active', true)
        .order('name')

    if (error) {
        console.error('Failed to load public categories:', error)
        return FALLBACK_CATEGORY_NAMES.map(fallbackDescriptor)
    }

    const rows = (data || []).filter((category) => category.name)
    if (rows.length === 0) {
        return FALLBACK_CATEGORY_NAMES.map(fallbackDescriptor)
    }

    return rows
        .map((category) => buildPublicCategoryDescriptor(category))
        .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
})

export const getPublicNavigationCategories = cache(async () => {
    const categories = await getPublicCategories()
    return [ALL_UPDATES_DESCRIPTOR, ...categories]
})

export const getPublicCategoryBySlug = cache(async (slug: string) => {
    const categories = await getPublicCategories()
    const normalizedSlug = toCategorySlug(slug)

    return categories.find((category) => category.slug === normalizedSlug) || null
})

export const getPublicCategoryByName = cache(async (name: string) => {
    const categories = await getPublicCategories()
    const normalizedName = normalizeCategoryValue(name)

    return categories.find((category) => normalizeCategoryValue(category.name) === normalizedName) || null
})

export function getCategoryAccentClasses(accent: CategoryAccent) {
    const theme = {
        graphite: {
            chip: 'border-stone-300 bg-white text-stone-800',
            text: 'text-stone-800',
            muted: 'text-stone-500',
            rule: 'bg-stone-400',
            panel: 'border-stone-200 bg-white',
            button: 'bg-stone-900 text-white hover:bg-stone-700',
        },
        forest: {
            chip: 'border-emerald-300 bg-emerald-50 text-emerald-900',
            text: 'text-emerald-900',
            muted: 'text-emerald-700',
            rule: 'bg-emerald-700',
            panel: 'border-emerald-200 bg-emerald-50/60',
            button: 'bg-emerald-900 text-white hover:bg-emerald-800',
        },
        sage: {
            chip: 'border-lime-300 bg-lime-50 text-lime-900',
            text: 'text-lime-900',
            muted: 'text-lime-700',
            rule: 'bg-lime-700',
            panel: 'border-lime-200 bg-lime-50/70',
            button: 'bg-lime-900 text-white hover:bg-lime-800',
        },
        amber: {
            chip: 'border-amber-300 bg-amber-50 text-amber-900',
            text: 'text-amber-900',
            muted: 'text-amber-700',
            rule: 'bg-amber-600',
            panel: 'border-amber-200 bg-amber-50/70',
            button: 'bg-amber-700 text-white hover:bg-amber-600',
        },
        vermilion: {
            chip: 'border-rose-300 bg-rose-50 text-rose-900',
            text: 'text-rose-900',
            muted: 'text-rose-700',
            rule: 'bg-rose-700',
            panel: 'border-rose-200 bg-rose-50/80',
            button: 'bg-rose-700 text-white hover:bg-rose-600',
        },
    } as const

    return theme[accent]
}
