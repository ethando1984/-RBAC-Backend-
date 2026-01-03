import { CategoryView } from '@/components/views/CategoryView';

export const revalidate = 0;

export default async function CategoryPaginationPage({ params }: { params: { slug: string, page: string } }) {
    const page = parseInt(params.page);
    return <CategoryView slug={params.slug} page={page} />;
}
