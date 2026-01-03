import { PublicApi } from '@/lib/api';
import { ArticleList } from '@/components/ArticleList';
import { notFound } from 'next/navigation';
import { Hash, SlidersHorizontal } from 'lucide-react';

export async function TagView({ slug, page = 1 }: { slug: string, page?: number }) {
    let tag;
    let articles = [];

    try {
        tag = await PublicApi.getTag(slug);
        articles = await PublicApi.getTagArticles(slug, 0, page * 10);
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
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-gradient leading-tight">
                            #{tag.name}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4 pt-4">
                        <div className="h-px flex-1 bg-zinc-200" />
                        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">
                            <SlidersHorizontal size={14} />
                        </div>
                        <div className="h-px flex-1 bg-zinc-200" />
                    </div>
                </header>

                <div className="w-full">
                    {articles.length > 0 ? (
                        <ArticleList
                            initialArticles={articles}
                            type="category"
                            targetId={slug}
                            initialPage={page}
                            showHeader={false}
                        />
                    ) : (
                        <div className="py-24 text-center glass-card rounded-[32px] border-dashed border-zinc-200">
                            <p className="text-zinc-400 font-medium text-lg">
                                No articles have been found for this tag yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
