import { TagView } from '@/components/views/TagView';

export const revalidate = 0;

export default async function TagArticlesPage({ params }: { params: { slug: string, page?: string } }) {
    const page = params.page ? parseInt(params.page) : 1;
    return <TagView slug={params.slug} page={page} />;
}
