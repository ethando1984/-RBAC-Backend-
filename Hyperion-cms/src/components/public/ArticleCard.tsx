import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ArticleCardProps {
    id: string;
    title: string;
    subtitle?: string;
    excerpt?: string;
    slug: string;
    coverMediaUrl?: string;
    authorName: string;
    authorAvatar?: string;
    publishedAt: string;
    readTimeMinutes: number;
    tags?: string[];
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
    title,
    subtitle,
    excerpt,
    slug,
    coverMediaUrl,
    authorName,
    authorAvatar,
    publishedAt,
    readTimeMinutes,
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-6 py-8 border-b border-gray-100 last:border-0 group">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {authorAvatar ? (
                            <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-100">
                                {authorName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{authorName}</span>
                    <span className="text-sm text-gray-500">·</span>
                    <span className="text-sm text-gray-500">{new Date(publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>

                <Link to={`/p/article/${slug}`} className="block group-hover:opacity-80 transition-opacity">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight font-serif line-clamp-2">
                        {title}
                    </h2>
                    {excerpt && (
                        <p className="text-gray-600 text-sm md:text-base line-clamp-3 mb-4 font-sans leading-relaxed">
                            {excerpt}
                        </p>
                    )}
                </Link>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
                            Category
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {readTimeMinutes} min read
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                        <button className="hover:text-gray-900 transition-colors">
                            <Bookmark className="h-5 w-5" />
                        </button>
                        <button className="hover:text-gray-900 transition-colors">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {coverMediaUrl && (
                <Link to={`/p/article/${slug}`} className="w-full md:w-48 h-32 md:h-32 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    <img
                        src={`http://localhost:8081${coverMediaUrl}`}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </Link>
            )}
        </div>
    );
};
