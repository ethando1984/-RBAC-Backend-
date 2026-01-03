import { PublicApi } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';

export default async function SearchPage({ searchParams }: { searchParams: { q: string } }) {
    const query = searchParams.q || '';
    let results = [];

    if (query) {
        try {
            results = await PublicApi.search(query);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-12">
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Search Results</h1>
                <p className="text-xl text-white/50">
                    {query ? `Showing results for "${query}"` : 'Enter a search term to begin.'}
                </p>
            </header>

            <div className="divide-y divide-white/10">
                {results.length > 0 ? (
                    results.map((article: any) => (
                        <ArticleCard key={article.id} article={article} />
                    ))
                ) : query ? (
                    <div className="py-20 text-center text-white/30 text-xl font-medium">
                        No articles found matching your search.
                    </div>
                ) : null}
            </div>
        </div>
    );
}
