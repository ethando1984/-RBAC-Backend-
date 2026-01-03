import { PublicApi } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';
import { Article, HomeResponse, Category } from '@/lib/types';
import Link from 'next/link';
import { Sparkles, TrendingUp, Compass, ArrowRight } from 'lucide-react';

export default async function Home() {
    let articles: Article[] = [];
    let staffPicks: Article[] = [];
    let topics: Category[] = [];
    try {
        const data: HomeResponse = await PublicApi.getHome();
        articles = data.feed || [];
        staffPicks = data.staffPicks || [];
        topics = data.recommendedTopics || [];
    } catch (error) {
        console.error("Home fetch failed, using fallbacks", error);
    }

    return (
        <div className="relative isolate">
            {/* Background Blobs */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] -z-10 animate-pulse-slow" />
            <div className="absolute top-1/2 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] -z-10 animate-pulse-slow" />

            <div className="max-w-4xl mx-auto space-y-24 py-12">
                {/* Hero Section */}
                <header className="relative space-y-8">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        <Sparkles size={14} />
                        <span>Intelligence Platform</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] text-gradient">
                        Future of <br />
                        <span className="text-indigo-gradient italic">Publishing</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/50 font-medium max-w-2xl leading-relaxed">
                        Hyperion is a next-generation content engine delivering deep insights at the speed of thought.
                    </p>
                </header>

                {/* Staff Picks - Featured Slider Style */}
                {staffPicks.length > 0 && (
                    <section>
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2">Editor's Selection</h3>
                                <h2 className="text-3xl font-bold">Staff Picks</h2>
                            </div>
                            <Link href="/articles" className="text-sm font-bold text-white/40 hover:text-white transition flex items-center space-x-2 group">
                                <span>See all articles</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid gap-8">
                            {staffPicks.map(article => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Topics - Grid Style */}
                {topics.length > 0 && (
                    <section className="p-10 rounded-[32px] bg-white/[0.02] border border-white/[0.05]">
                        <div className="flex items-center space-x-3 mb-8">
                            <Compass className="text-indigo-500" />
                            <h2 className="text-2xl font-bold">Recommended Topics</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {topics.map(topic => (
                                <Link
                                    key={topic.id}
                                    href={`/category/${topic.slug}`}
                                    className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] transition-all text-sm font-semibold"
                                >
                                    {topic.name}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Latest Feed */}
                <section>
                    <div className="flex items-center space-x-3 mb-10">
                        <TrendingUp className="text-indigo-500" size={20} />
                        <h2 className="text-2xl font-bold uppercase tracking-wider">Latest Stories</h2>
                    </div>
                    <div className="space-y-4">
                        {articles.length > 0 ? (
                            articles.map((article: Article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))
                        ) : (
                            <div className="py-20 text-center glass-card rounded-3xl text-white/20 italic">
                                No stories have been published yet.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
