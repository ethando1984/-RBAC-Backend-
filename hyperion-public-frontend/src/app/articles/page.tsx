import { PublicApi } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';
import { StaffPicks } from '@/components/StaffPicks';
import { ArticleList } from '@/components/ArticleList';
import { Article } from '@/lib/types';
import { Newspaper } from 'lucide-react';

export const revalidate = 0; // No cache

export default async function ArticlesPage() {
    let articles: Article[] = [];
    let staffPicks: Article[] = [];

    try {
        const [articlesData, homeData] = await Promise.all([
            PublicApi.getArticles(0, 20),
            PublicApi.getHome()
        ]);
        articles = articlesData || [];
        staffPicks = homeData.staffPicks || [];
    } catch (e) {
        console.error("Failed to fetch articles", e);
    }

    return (
        <div className="relative isolate">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] -z-10 animate-pulse-slow" />

            <div className="max-w-4xl mx-auto pt-16 pb-32 px-4 md:px-0">
                <header className="mb-24 space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
                        <Newspaper size={14} />
                        <span>Journal</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight text-gradient leading-[0.9]">
                        Latest <span className="italic text-indigo-gradient">Insights</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/50 max-w-2xl leading-relaxed font-medium">
                        The definitive source for deep tech, market shifts, and product-led growth.
                    </p>
                </header>

                {staffPicks.length > 0 && (
                    <section className="mb-32">
                        <StaffPicks articles={staffPicks} />
                    </section>
                )}

                <div className="space-y-12">
                    <div className="flex items-center space-x-4 mb-12">
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 whitespace-nowrap">Chronological Feed</h2>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>

                    <ArticleList initialArticles={articles} />
                </div>
            </div>
        </div>
    );
}
