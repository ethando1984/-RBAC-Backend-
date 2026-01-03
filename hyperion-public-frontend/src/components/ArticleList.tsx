'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Article } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { PublicApi } from '@/lib/api';
import { Loader2, Sparkles } from 'lucide-react';

interface ArticleListProps {
    initialArticles: Article[];
    type?: 'general' | 'category';
    targetId?: string;
}

export function ArticleList({ initialArticles, type = 'general', targetId }: ArticleListProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialArticles.length >= 10);
    const [activePage, setActivePage] = useState(1);

    const observerTarget = useRef<HTMLDivElement>(null);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);

        try {
            const nextPage = page;
            let nextArticles: Article[] = [];

            if (type === 'category' && targetId) {
                nextArticles = await PublicApi.getCategoryArticles(targetId, nextPage);
            } else {
                nextArticles = await PublicApi.getArticles(nextPage, 10);
            }

            if (nextArticles.length < 10) {
                setHasMore(false);
            }

            setArticles(prev => [...prev, ...nextArticles]);
            setPage(prev => prev + 1);
        } catch (error) {
            console.error("Failed to load more articles", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, page, type, targetId]);

    // Setup Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '400px' // Start loading 400px before reaching the bottom
            }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [loadMore, hasMore, isLoading]);

    // Handle scroll to update active page indicator (UX improvement)
    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY + (window.innerHeight / 2);
            // Rough estimation of current page based on scroll position and article height
            // We assume each ArticleCard is roughly 600px tall
            const articleHeight = 600;
            const index = Math.floor(scrollPos / articleHeight);
            const approxPage = Math.max(1, Math.min(page, Math.ceil((index + 1) / 10)));
            setActivePage(approxPage);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [page, articles.length]);

    return (
        <div className="relative space-y-12 pb-20">
            {/* Floating Page Indicator - Dynamic HUD Style */}
            <div className="fixed bottom-12 right-12 z-50 flex items-center space-x-3 pointer-events-none">
                <div className="glass-card px-6 py-3 rounded-2xl border border-indigo-500/30 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] backdrop-blur-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping opacity-75" />
                    </div>
                    <div className="h-4 w-px bg-white/10 mx-2" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                        Discovery <span className="text-indigo-400">P.{activePage}</span>
                    </span>
                </div>
            </div>

            <div className="grid gap-16">
                {articles.map((article, idx) => (
                    <div
                        key={article.id + idx}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${(idx % 10) * 100}ms` }}
                    >
                        <ArticleCard article={article} />
                    </div>
                ))}
            </div>

            {/* Intersection Observer Trigger */}
            <div ref={observerTarget} className="h-40 w-full flex items-center justify-center">
                {isLoading && (
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                            Streaming Archive...
                        </span>
                    </div>
                )}
            </div>

            {!hasMore && articles.length > 0 && (
                <div className="pt-20 pb-40 text-center">
                    <div className="inline-flex flex-col items-center space-y-8">
                        <div className="flex items-center space-x-6">
                            <div className="h-px w-20 bg-gradient-to-r from-transparent to-indigo-500/30" />
                            <Sparkles className="h-5 w-5 text-indigo-400/50" />
                            <div className="h-px w-20 bg-gradient-to-l from-transparent to-indigo-500/30" />
                        </div>
                        <div className="space-y-2">
                            <span className="block text-xs font-black uppercase tracking-[0.6em] text-white/20">END_OF_TRANSMISSION</span>
                            <span className="block text-[10px] text-white/10 font-medium">Hyperion Core Archive v1.4.0</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
