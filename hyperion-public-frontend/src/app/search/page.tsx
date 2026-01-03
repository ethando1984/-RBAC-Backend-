import { PublicApi } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';
import { Search } from 'lucide-react';

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
            <header className="mb-12 space-y-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Search Results</h1>
                    <p className="text-xl text-white/50">
                        {query ? `Showing results for "${query}"` : 'Enter a search term to begin.'}
                    </p>
                </div>

                <form action="/search" method="GET" className="relative group max-w-2xl">
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="Search for articles, topics, or trends..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all text-lg"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-500 transition-colors">
                        <Search size={20} />
                    </div>
                </form>
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
