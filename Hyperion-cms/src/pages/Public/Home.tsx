import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { ArticleCard } from '../../components/public/ArticleCard';
import { hemeraApi } from '../../api/client';
import { cn } from '../../utils/cn';

const TABS = [
    { id: 'for-you', label: 'For You' },
    { id: 'featured', label: 'Featured' },
    { id: 'latest', label: 'Latest' },
];

export const Home: React.FC = () => {
    const [activeTab, setActiveTab] = useState('latest');

    const { data: articles, isLoading } = useQuery({
        queryKey: ['public-articles', activeTab],
        queryFn: async () => {
            // Use the new public API
            const endpoint = activeTab === 'featured' ? '/public/featured' : '/public/latest';
            const response = await hemeraApi.get(endpoint);
            return response.data;
        }
    });

    return (
        <div className="space-y-6">
            {/* Feed Tabs */}
            <div className="flex items-center gap-6 border-b border-gray-100 mb-6 px-1">
                <button className="h-10 text-gray-400 hover:text-gray-900 transition-colors">
                    <Plus className="h-5 w-5" />
                </button>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "h-10 text-sm font-medium transition-all relative",
                            activeTab === tab.id ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Feed */}
            <div className="divide-y divide-gray-100">
                {isLoading ? (
                    // Skeleton Loading
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="py-8 animate-pulse space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-gray-100" />
                                <div className="h-3 w-24 bg-gray-100 rounded" />
                            </div>
                            <div className="flex gap-6">
                                <div className="flex-1 space-y-2">
                                    <div className="h-6 w-3/4 bg-gray-100 rounded" />
                                    <div className="h-4 w-full bg-gray-100 rounded" />
                                    <div className="h-4 w-2/3 bg-gray-100 rounded" />
                                </div>
                                <div className="h-24 w-32 bg-gray-100 rounded hidden md:block" />
                            </div>
                        </div>
                    ))
                ) : (
                    articles?.map((article: any) => (
                        <ArticleCard
                            key={article.id}
                            id={article.id}
                            title={article.title}
                            subtitle={article.subtitle}
                            excerpt={article.excerpt}
                            slug={article.slug}
                            coverMediaUrl={article.coverMediaUrl}
                            authorName={article.authorName || 'Hyperion Staff'}
                            authorAvatar={article.authorAvatar}
                            publishedAt={article.publishedAt || article.createdAt}
                            readTimeMinutes={article.readTimeMinutes || 5}
                            tags={article.tags}
                        />
                    ))
                )}

                {articles?.length === 0 && !isLoading && (
                    <div className="py-20 text-center text-gray-500">
                        <p className="text-xl font-medium text-gray-900">No stories found</p>
                        <p className="mt-2 text-sm">Check back later for new content.</p>
                    </div>
                )}
            </div>

            {/* Load More Trigger (Infinite Scroll Placeholder) */}
            {!isLoading && articles?.length > 0 && (
                <div className="py-12 flex justify-center">
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        Show more stories
                    </button>
                </div>
            )}
        </div>
    );
};
