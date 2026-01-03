import { TagView } from '@/components/views/TagView';

export const revalidate = 0;

export default async function TagPaginationPage({ params }: { params: { slug: string, page: string } }) {
    const page = parseInt(params.page);
    return <TagView slug={params.slug} page={page} />;
}
