import Link from 'next/link';
import { format } from 'date-fns';
import { Clock, ExternalLink } from 'lucide-react';
import { getImageUrl } from '@/lib/images';

export function ArticleCard({ article, variant = 'list', isFeatured = false }: { article: any, variant?: 'list' | 'grid', isFeatured?: boolean }) {
    const formattedDate = article.publishedAt ? format(new Date(article.publishedAt), 'MMM d, yyyy') : '';
    const isHorizontal = variant === 'list' || isFeatured;

    return (
        <Link
            href={`/article/${article.slug}`}
            className={`block glass-card rounded-3xl p-6 md:p-10 group relative isolate overflow-hidden ${!isHorizontal ? 'h-full md:p-6' : ''}`}
        >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-colors duration-700 -z-10" />

            <article className={`flex gap-8 lg:gap-12 ${!isHorizontal ? 'flex-col gap-6' : 'flex-col md:flex-row'}`}>
                {article.coverMediaUrl && (
                    <div className={`shrink-0 rounded-2xl overflow-hidden bg-zinc-100 relative group-hover:shadow-[0_0_30px_rgba(79,70,229,0.2)] transition-shadow duration-500 ${!isHorizontal ? 'w-full aspect-video h-auto' : isFeatured ? 'w-full md:w-1/2 aspect-video' : 'w-full md:w-[280px] h-[200px]'}`}>
                        <img
                            src={getImageUrl(article.coverMediaUrl)}
                            alt={article.title}
                            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                )}

                <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em]">
                            {article.category?.name && (
                                <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400">
                                    {article.category.name}
                                </span>
                            )}
                            {article.author?.name && (
                                <span className="text-zinc-500">{article.author.name}</span>
                            )}
                        </div>

                        <h2 className={`font-bold leading-tight group-hover:text-indigo-400 transition-colors duration-300 ${!isHorizontal ? 'text-xl md:text-2xl' : isFeatured ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'}`}>
                            {article.title}
                        </h2>

                        <p className={`text-zinc-600 leading-relaxed ${isFeatured ? 'text-lg line-clamp-4' : 'line-clamp-2 md:line-clamp-3'}`}>
                            {article.excerpt}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                        <div className="flex items-center space-x-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            <span className="flex items-center space-x-1.5">
                                <span>{formattedDate}</span>
                            </span>
                            {article.readTime && (
                                <span className="flex items-center space-x-1.5">
                                    <Clock size={12} className="text-indigo-500/50" />
                                    <span>{article.readTime} min read</span>
                                </span>
                            )}
                            {article.tags && article.tags.length > 0 && (
                                <div className="hidden sm:flex items-center space-x-2">
                                    <span className="text-zinc-300">•</span>
                                    {article.tags.slice(0, 2).map((tag: any) => (
                                        <span key={tag.id} className="text-indigo-400/60 lowercase">#{tag.name}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="hidden md:flex items-center space-x-2 text-indigo-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            <span className="text-xs font-bold uppercase tracking-widest">Read Story</span>
                            <ExternalLink size={14} />
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
