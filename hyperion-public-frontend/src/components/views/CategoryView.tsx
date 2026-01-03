import { PublicApi } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';
import { StaffPicks } from '@/components/StaffPicks';
import { PageRenderer } from '@/components/PageRenderer';
import { ArticleList } from '@/components/ArticleList';
import { Article } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Hash, LayoutGrid, List, Columns } from 'lucide-react';

interface LayoutConfig {
    mode?: 'grid' | 'list' | 'masonry';
    sidebar?: 'none' | 'left' | 'right';
    showHero?: boolean;
    itemsPerPage?: number;
}

export async function CategoryView({ slug, page = 1 }: { slug: string, page?: number }) {
    let category;
    let articles = [];
    let staffPicks = [];
    let resolvedLayout = null;

    try {
        const [catData, artData, homeData] = await Promise.all([
            PublicApi.getCategory(slug),
            PublicApi.getCategoryArticles(slug, 0, page * 10),
            PublicApi.getHome()
        ]);
        category = catData;
        articles = artData;

        // Filter staff picks to only this category
        const categoryStaffPicks = (homeData.staffPicks || []).filter((art: Article) =>
            art.categories?.some(c => c.id === category.id || c.slug === slug)
        );

        staffPicks = categoryStaffPicks;

        // Try to resolve a custom layout for this category
        if (category) {
            try {
                resolvedLayout = await PublicApi.resolveLayout('CATEGORY', category.id);
            } catch (e) {
                // Ignore if no layout found
            }
        }
    } catch (error) {
        console.error(error);
        return notFound();
    }

    if (!category) return notFound();

    // Parse layout configuration
    let layoutConfig: LayoutConfig = {
        mode: 'masonry',
        sidebar: 'right',
        showHero: true,
        itemsPerPage: 12
    };

    if (category.positionConfigJson) {
        try {
            layoutConfig = { ...layoutConfig, ...JSON.parse(category.positionConfigJson) };
        } catch (e) {
            console.error('Failed to parse layout config:', e);
        }
    }

    const getContainerClasses = () => {
        if (layoutConfig.sidebar === 'none') {
            return 'max-w-7xl mx-auto';
        }
        return 'max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8';
    };

    const getMainClasses = () => {
        if (layoutConfig.sidebar === 'none') return '';
        if (layoutConfig.sidebar === 'left') return 'lg:col-span-9 lg:col-start-4';
        return 'lg:col-span-9';
    };

    const getSidebarClasses = () => {
        if (layoutConfig.sidebar === 'left') return 'lg:col-span-3 lg:col-start-1 lg:row-start-1';
        return 'lg:col-span-3';
    };

    return (
        <div className="relative isolate">
            <div className="absolute -top-24 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] -z-10 animate-pulse-slow" />

            <div className="pt-16 pb-32 px-4 md:px-6">
                {/* Hero Section */}
                {layoutConfig.showHero && (
                    <header className="max-w-4xl mx-auto mb-24 space-y-6">
                        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                            <Hash size={14} />
                            <span>Category</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tight text-gradient leading-[0.9]">
                            {category.name}
                        </h1>
                        <p className="text-xl md:text-2xl text-zinc-500 max-w-2xl leading-relaxed font-medium">
                            {category.description}
                        </p>

                    </header>
                )}

                {/* Content with Sidebar */}
                <div className={getContainerClasses()}>
                    {/* Sidebar */}
                    {layoutConfig.sidebar !== 'none' && (
                        <aside className={getSidebarClasses()}>
                            <div className="sticky top-24 space-y-8">
                                <section className="glass-card rounded-[32px] p-8 border-zinc-200">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Archive Stats</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-zinc-100 p-4 rounded-2xl">
                                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Volume</span>
                                            <span className="font-black text-zinc-900">{articles.length} Units</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-zinc-100 p-4 rounded-2xl">
                                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Format</span>
                                            <span className="font-black text-zinc-900 capitalize">{layoutConfig.mode}</span>
                                        </div>
                                    </div>
                                </section>

                                {staffPicks.length > 0 && (
                                    <section className="glass-card rounded-[32px] p-8 border-zinc-200">
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Editorial Picks</h3>
                                        <StaffPicks articles={staffPicks} variant="sidebar" />
                                    </section>
                                )}
                            </div>
                        </aside>
                    )}

                    {/* Main Content */}
                    <main className={getMainClasses()}>
                        {resolvedLayout && (
                            <section className="mb-20">
                                <PageRenderer
                                    configJson={resolvedLayout.configJson}
                                    articles={articles}
                                    staffPicks={staffPicks}
                                    categories={[]}
                                />
                            </section>
                        )}

                        <div className="space-y-12">
                            {staffPicks.length > 0 && (
                                <section className="mb-20">
                                    <div className="flex items-center space-x-4 mb-10">
                                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400 whitespace-nowrap">Editorial Selection</h2>
                                        <div className="h-px flex-1 bg-indigo-500/10" />
                                    </div>
                                    <ArticleCard
                                        article={staffPicks[0]}
                                        variant="list"
                                    />
                                </section>
                            )}

                            <div className="flex items-center space-x-4 mb-12">
                                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 whitespace-nowrap">Category Archive</h2>
                                <div className="h-px flex-1 bg-zinc-200" />
                            </div>

                            {articles.length > 0 ? (
                                <div className="w-full">
                                    <ArticleList
                                        initialArticles={articles
                                            .filter((a: any) => !staffPicks[0] || a.id !== staffPicks[0].id)
                                        }
                                        type="category"
                                        targetId={category.slug}
                                        layout={layoutConfig.mode}
                                        initialPage={page}
                                        showHeader={false}
                                    />
                                </div>
                            ) : (
                                <div className="py-40 text-center glass-card rounded-[48px] border-dashed border-zinc-200">
                                    <div className="inline-flex p-6 rounded-full bg-zinc-100 mb-6">
                                        <Hash size={40} className="text-zinc-300" />
                                    </div>
                                    <p className="text-zinc-400 font-black uppercase tracking-[0.2em]">
                                        Archive Empty
                                    </p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
