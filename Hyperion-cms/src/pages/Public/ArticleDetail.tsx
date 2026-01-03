import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, Share2, MoreHorizontal, MessageCircle, Heart, ChevronLeft } from 'lucide-react';
import { hemeraApi } from '../../api/client';
import { cn } from '../../utils/cn';

export const ArticleDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    const { data: article, isLoading } = useQuery({
        queryKey: ['public-article', slug],
        queryFn: async () => {
            const response = await hemeraApi.get(`/public/articles/${slug}`);
            return response.data;
        },
        enabled: !!slug
    });

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-20 animate-pulse space-y-8">
                <div className="h-12 w-3/4 bg-gray-100 rounded" />
                <div className="h-6 w-1/2 bg-gray-100 rounded" />
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-100" />
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-100 rounded" />
                        <div className="h-3 w-24 bg-gray-100 rounded" />
                    </div>
                </div>
                <div className="h-96 w-full bg-gray-100 rounded" />
                <div className="space-y-4">
                    <div className="h-4 w-full bg-gray-100 rounded" />
                    <div className="h-4 w-full bg-gray-100 rounded" />
                    <div className="h-4 w-3/4 bg-gray-100 rounded" />
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="py-40 text-center">
                <h1 className="text-4xl font-bold font-serif">404</h1>
                <p className="mt-4 text-gray-500 text-lg">Story not found or no longer available.</p>
                <Link to="/" className="mt-8 inline-block text-blue-600 hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Article Header */}
            <article className="max-w-screen-md mx-auto px-4 pt-10 md:pt-20">
                <h1 className="text-3xl md:text-5xl font-bold font-serif text-gray-900 leading-[1.15] mb-4">
                    {article.title}
                </h1>
                {article.subtitle && (
                    <h2 className="text-xl md:text-2xl text-gray-500 font-sans font-medium mb-8">
                        {article.subtitle}
                    </h2>
                )}

                {/* Author Bio */}
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                            {article.authorAvatar ? (
                                <img src={article.authorAvatar} alt={article.authorName} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-lg font-bold text-gray-500 bg-gray-100 uppercase">
                                    {article.authorName?.charAt(0) || 'H'}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{article.authorName || 'Hyperion Staff'}</span>
                                <span className="text-gray-500">·</span>
                                <button className="text-sm font-medium text-green-700 hover:text-green-800">Follow</button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{article.readTimeMinutes || 5} min read</span>
                                <span>·</span>
                                <span>{new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-500">
                        <button className="hover:text-gray-900 transition-colors"><Bookmark className="h-6 w-6" /></button>
                        <button className="hover:text-gray-900 transition-colors"><Share2 className="h-6 w-6" /></button>
                        <button className="hover:text-gray-900 transition-colors"><MoreHorizontal className="h-6 w-6" /></button>
                    </div>
                </div>

                {/* Hero Image */}
                {article.coverMediaUrl && (
                    <figure className="mb-10 -mx-4 md:-mx-10">
                        <img
                            src={`http://localhost:8081${article.coverMediaUrl}`}
                            alt={article.title}
                            className="w-full aspect-[16/9] object-cover md:rounded-lg"
                        />
                    </figure>
                )}

                {/* Article Body */}
                <div
                    className="prose prose-lg md:prose-xl prose-slate max-w-none font-serif leading-relaxed text-gray-800 selection:bg-blue-100"
                    dangerouslySetInnerHTML={{ __html: article.contentHtml || article.excerpt }}
                />

                {/* Footer info */}
                <div className="mt-16 pt-10 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 mb-10">
                        {article.tags?.map((tag: string) => (
                            <Link
                                key={tag}
                                to={`/p/topic/${tag.toLowerCase()}`}
                                className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>

                    {/* Interaction Bar */}
                    <div className="flex items-center justify-between py-6 px-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-6">
                            <button className="flex items-center gap-2 text-gray-500 hover:text-rose-600 transition-colors group">
                                <Heart className="h-6 w-6 group-hover:fill-rose-600" />
                                <span className="text-sm font-medium">{article.likes || 12}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group">
                                <MessageCircle className="h-6 w-6" />
                                <span className="text-sm font-medium">{article.comments || 4}</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-gray-500">
                            <button className="hover:text-gray-900 transition-colors"><Bookmark className="h-6 w-6" /></button>
                            <button className="hover:text-gray-900 transition-colors"><Share2 className="h-6 w-6" /></button>
                        </div>
                    </div>
                </div>
            </article>

            {/* Suggested Reading - Simplified for now */}
            <footer className="mt-20 py-20 bg-gray-50 border-t border-gray-100">
                <div className="max-w-screen-md mx-auto px-4 text-center">
                    <h4 className="text-xl font-bold font-serif mb-4">Recommended Stories</h4>
                    <p className="text-gray-500 mb-8 font-serif">Discover more thoughts and ideas from our writers.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to Home
                    </Link>
                </div>
            </footer>
        </div>
    );
};
