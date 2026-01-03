import { CategoryView } from '@/components/views/CategoryView';

export const revalidate = 0;

export default async function CategoryPage({ params }: { params: { slug: string, page?: string } }) {
    const page = params.page ? parseInt(params.page) : 1;
    return <CategoryView slug={params.slug} page={page} />;
}
