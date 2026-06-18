import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import UpdatesPageView from '@/components/updates/UpdatesPageView';
import { ALL_UPDATES_DESCRIPTOR, getPublicCategoryByName, getPublicNavigationCategories } from '@/lib/public-categories';
import { UPDATES_PAGE_SIZE, getPublishedPostsPage } from '@/lib/public-posts';

export const revalidate = 60;

interface UpdatesPageProps {
    searchParams: Promise<{ category?: string; page?: string; q?: string }>;
}

export async function generateMetadata({ searchParams }: UpdatesPageProps): Promise<Metadata> {
    const params = await searchParams;
    const legacyCategory = params.category ? await getPublicCategoryByName(params.category) : null;

    if (legacyCategory) {
        return {
            title: legacyCategory.label,
            description: legacyCategory.description,
            alternates: {
                canonical: legacyCategory.href,
            },
            openGraph: {
                title: `${legacyCategory.label} | Agri Updates`,
                description: legacyCategory.description,
            },
        };
    }

    return {
        title: 'All Updates',
        description: ALL_UPDATES_DESCRIPTOR.description,
        alternates: {
            canonical: '/updates',
        },
        openGraph: {
            title: 'All Updates | Agri Updates',
            description: ALL_UPDATES_DESCRIPTOR.description,
        },
    };
}

export default async function UpdatesPage({ searchParams }: UpdatesPageProps) {
    const params = await searchParams;
    const qFilter = params.q || '';
    const page = parseInt(params.page || '1');
    const legacyCategory = params.category ? await getPublicCategoryByName(params.category) : null;

    if (legacyCategory) {
        const query = new URLSearchParams();
        if (qFilter) query.set('q', qFilter);
        if (page > 1) query.set('page', String(page));

        redirect(query.toString() ? `${legacyCategory.href}?${query.toString()}` : legacyCategory.href);
    }

    const [{ posts, total }, categories] = await Promise.all([
        getPublishedPostsPage({ q: qFilter, page, limit: UPDATES_PAGE_SIZE }),
        getPublicNavigationCategories(),
    ]);

    return (
        <UpdatesPageView
            basePath="/updates"
            categories={categories}
            currentDescriptor={ALL_UPDATES_DESCRIPTOR}
            page={page}
            posts={posts}
            qFilter={qFilter}
            totalPages={Math.ceil(total / UPDATES_PAGE_SIZE)}
            totalPosts={total}
        />
    );
}
