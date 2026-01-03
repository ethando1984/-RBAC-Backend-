import { ArticlesView } from '@/components/views/ArticlesView';

export const revalidate = 0;

export default async function ArticlesPaginationPage({ params }: { params: { page: string } }) {
    const page = parseInt(params.page);
    return <ArticlesView page={page} />;
}
