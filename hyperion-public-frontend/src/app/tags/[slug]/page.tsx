import { PublicApi } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';
import { notFound } from 'next/navigation';
import { Hash, SlidersHorizontal } from 'lucide-react';

export const revalidate = 0;

export default async function TagArticlesPage({ params }: { params: { slug: string } }) {
    let tag;
    let articles = [];

    try {
        tag = await PublicApi.getTag(params.slug);
        articles = await PublicApi.getTagArticles(params.slug);
    } catch (error) {
        console.error("Failed to fetch tag or articles", error);
        return notFound();
    }

    if (!tag) return notFound();

    return (
        <div className="relative isolate">
            {/* Background enhancement */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

            <div className="max-w-4xl mx-auto py-12 px-4 md:px-0">
                <header className="mb-20 space-y-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                        <Hash size={14} />
                        <span>Tagged Content</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-gradient leading-tight">
                            #{tag.name}
                        </h1>
                        <p className="text-xl text-white/40 max-w-2xl leading-relaxed">
                            Discover our library of insights and deep-dives specifically related to <span className="text-white font-semibold">{tag.name}</span>.
                        </p>
                    </div>

                    <div className="flex items-center space-x-4 pt-4">
                        <div className="h-px flex-1 bg-white/10" />
                        <div className="flex items-center space-x-2 text-xs font-bold text-white/30 uppercase tracking-[0.2em]">
                            <SlidersHorizontal size={14} />
                            <span>{articles.length} Results Found</span>
                        </div>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>
                </header>

                <div className="grid gap-8">
                    {articles.length > 0 ? (
                        articles.map((article: any) => (
                            <ArticleCard key={article.id} article={article} />
                        ))
                    ) : (
                        <div className="py-24 text-center glass-card rounded-[32px] border-dashed">
                            <p className="text-white/30 font-medium text-lg">
                                No articles have been found for this tag yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
