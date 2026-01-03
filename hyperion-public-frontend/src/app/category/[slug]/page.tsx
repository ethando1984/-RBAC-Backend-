import { PublicApi } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';
import { notFound } from 'next/navigation';
import { Hash } from 'lucide-react';

export const revalidate = 0;

export default async function CategoryPage({ params }: { params: { slug: string } }) {
    let category;
    let articles = [];

    try {
        category = await PublicApi.getCategory(params.slug);
        articles = await PublicApi.getCategoryArticles(params.slug);
    } catch (error) {
        console.error(error);
        return notFound();
    }

    if (!category) return notFound();

    return (
        <div className="relative isolate">
            <div className="absolute -top-24 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] -z-10 animate-pulse-slow" />

            <div className="max-w-4xl mx-auto py-12 px-4 md:px-0">
                <header className="mb-20 space-y-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                        <Hash size={14} />
                        <span>Category</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tight text-gradient leading-tight">
                        {category.name}
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
                        {category.description || `In-depth coverage and curated perspectives on ${category.name}.`}
                    </p>
                </header>

                <div className="grid gap-8">
                    {articles.length > 0 ? (
                        articles.map((article: any) => (
                            <ArticleCard key={article.id} article={article} />
                        ))
                    ) : (
                        <div className="py-24 text-center glass-card rounded-[32px] border-dashed">
                            <p className="text-white/30 font-medium text-lg">No articles have been published in this category yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
