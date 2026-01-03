import { PublicApi } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';
import { Article } from '@/lib/types';
import { Newspaper } from 'lucide-react';

export const revalidate = 0; // No cache

export default async function ArticlesPage() {
    let articles: Article[] = [];
    try {
        articles = await PublicApi.getArticles(0, 20);
    } catch (e) {
        console.error("Failed to fetch articles", e);
    }

    return (
        <div className="relative isolate">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] -z-10 animate-pulse-slow" />

            <div className="max-w-4xl mx-auto py-12 px-4 md:px-0">
                <header className="mb-20 space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
                        <Newspaper size={14} />
                        <span>Journal</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tight text-gradient">
                        Latest <span className="italic text-indigo-gradient">Insights</span>
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
                        The definitive source for deep tech, market shifts, and product-led growth.
                    </p>
                </header>

                <div className="grid gap-6">
                    {articles.length > 0 ? (
                        articles.map(article => (
                            <ArticleCard key={article.id} article={article} />
                        ))
                    ) : (
                        <div className="py-24 text-center glass-card rounded-[32px] border-dashed">
                            <p className="text-white/30 font-medium text-lg">No articles have been published yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
