import { ArticlesView } from '@/components/views/ArticlesView';

export const revalidate = 0;

export default async function ArticlesPage({ params }: { params?: { page?: string } }) {
    const page = params?.page ? parseInt(params.page) : 1;
    return <ArticlesView page={page} />;
}
