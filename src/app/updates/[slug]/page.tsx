import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import UpdatesPageView from '@/components/updates/UpdatesPageView';
import { getPublicCategoryBySlug, getPublicNavigationCategories } from '@/lib/public-categories';
import { UPDATES_PAGE_SIZE, getPublishedPostsPage } from '@/lib/public-posts';

export const revalidate = 60;

interface CategoryUpdatesPageProps {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ page?: string; q?: string }>
}

export async function generateMetadata({ params }: CategoryUpdatesPageProps): Promise<Metadata> {
    const { slug } = await params;
    const category = await getPublicCategoryBySlug(slug);

    if (!category) {
        return {
            title: 'Updates',
        };
    }

    return {
        title: category.label,
        description: category.description,
        alternates: {
            canonical: `/updates/${slug}`,
        },
        openGraph: {
            title: `${category.label} | Agri Updates`,
            description: category.description,
        },
    };
}

export default async function CategoryUpdatesPage({ params, searchParams }: CategoryUpdatesPageProps) {
    const [{ slug }, query] = await Promise.all([params, searchParams]);
    const category = await getPublicCategoryBySlug(slug);

    if (!category) {
        notFound();
    }

    if (category.href !== `/updates/${category.slug}`) {
        const redirectQuery = new URLSearchParams();
        if (query.q) redirectQuery.set('q', query.q);
        if (query.page && query.page !== '1') redirectQuery.set('page', query.page);
        redirect(redirectQuery.toString() ? `${category.href}?${redirectQuery.toString()}` : category.href);
    }

    const page = parseInt(query.page || '1');
    const qFilter = query.q || '';

    const [{ posts, total }, categories] = await Promise.all([
        getPublishedPostsPage({
            category: category.name,
            q: qFilter,
            page,
            limit: UPDATES_PAGE_SIZE,
        }),
        getPublicNavigationCategories(),
    ]);

    return (
        <UpdatesPageView
            basePath={category.href}
            categories={categories}
            currentDescriptor={category}
            page={page}
            posts={posts}
            qFilter={qFilter}
            totalPages={Math.ceil(total / UPDATES_PAGE_SIZE)}
            totalPosts={total}
        />
    );
}
