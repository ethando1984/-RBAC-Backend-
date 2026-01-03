import React from 'react';
import { Article, Category } from '@/lib/types';
import { ArticleCard } from './ArticleCard';
import { StaffPicks } from './StaffPicks';
import Link from 'next/link';
import { Sparkles, TrendingUp, Compass } from 'lucide-react';

interface Widget {
    type: string;
    props?: any;
}

interface PageRendererProps {
    configJson: string;
    articles?: Article[];
    staffPicks?: Article[];
    categories?: Category[];
}

export function PageRenderer({ configJson, articles = [], staffPicks = [], categories = [] }: PageRendererProps) {
    let config: { widgets: Widget[] };
    try {
        config = JSON.parse(configJson);
    } catch (e) {
        console.error("Failed to parse page layout config", e);
        return <div className="p-10 text-center text-white/20">Layout configuration error</div>;
    }

    if (!config || !config.widgets || config.widgets.length === 0) {
        return (
            <div className="py-24 text-center glass-card rounded-[32px] border-dashed">
                <p className="text-white/30 font-medium text-lg">
                    This page has no content configured yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-24">
            {config.widgets.map((widget, idx) => (
                <div key={idx}>
                    {renderWidget(widget, { articles, staffPicks, categories })}
                </div>
            ))}
        </div>
    );
}

function renderWidget(widget: Widget, data: { articles: Article[], staffPicks: Article[], categories: Category[] }) {
    switch (widget.type) {
        case 'hero':
            return (
                <header className="relative space-y-8">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        <Sparkles size={14} />
                        <span>{widget.props?.badge || 'Intelligence Platform'}</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] text-gradient"
                        dangerouslySetInnerHTML={{ __html: widget.props?.title || 'Future of <br /><span className="text-indigo-gradient italic">Publishing</span>' }}
                    />
                    <p className="text-xl md:text-2xl text-white/50 font-medium max-w-2xl leading-relaxed">
                        {widget.props?.description || 'Hyperion is a next-generation content engine delivering deep insights at the speed of thought.'}
                    </p>
                </header>
            );

        case 'staff-picks':
            return data.staffPicks.length > 0 ? (
                <StaffPicks
                    articles={data.staffPicks}
                    title={widget.props?.title}
                    variant={widget.props?.variant || 'full'}
                />
            ) : null;

        case 'topics':
            return data.categories.length > 0 ? (
                <section className="p-10 rounded-[32px] bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center space-x-3 mb-8">
                        <Compass className="text-indigo-500" />
                        <h2 className="text-2xl font-bold">{widget.props?.title || 'Recommended Topics'}</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {data.categories.map(topic => (
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
            ) : null;

        case 'feed':
            return (
                <section>
                    <div className="flex items-center space-x-3 mb-10">
                        <TrendingUp className="text-indigo-500" size={20} />
                        <h2 className="text-2xl font-bold uppercase tracking-wider">{widget.props?.title || 'Latest Stories'}</h2>
                    </div>
                    <div className="space-y-4">
                        {data.articles.length > 0 ? (
                            data.articles.slice(0, widget.props?.limit || 10).map((article: Article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))
                        ) : (
                            <div className="py-20 text-center glass-card rounded-3xl text-white/20 italic">
                                No stories have been published yet.
                            </div>
                        )}
                    </div>
                </section>
            );

        case 'html':
            return (
                <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: widget.props?.content || '' }}
                />
            );

        default:
            return <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">Unknown widget: {widget.type}</div>;
    }
}
