import Link from 'next/link';
import { format } from 'date-fns';
import { Clock, ExternalLink } from 'lucide-react';

export function ArticleCard({ article }: { article: any }) {
    const formattedDate = article.publishedAt ? format(new Date(article.publishedAt), 'MMM d, yyyy') : '';

    return (
        <Link
            href={`/article/${article.slug}`}
            className="block glass-card rounded-3xl p-6 md:p-10 group relative isolate overflow-hidden"
        >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-colors duration-700 -z-10" />

            <article className="flex flex-col md:flex-row gap-8 lg:gap-12">
                {article.coverMediaUrl && (
                    <div className="w-full md:w-[280px] h-[200px] shrink-0 rounded-2xl overflow-hidden bg-white/5 relative group-hover:shadow-[0_0_30px_rgba(79,70,229,0.2)] transition-shadow duration-500">
                        <img
                            src={article.coverMediaUrl}
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
                                <span className="text-white/40">{article.author.name}</span>
                            )}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-indigo-400 transition-colors duration-300">
                            {article.title}
                        </h2>

                        <p className="text-white/50 line-clamp-2 md:line-clamp-3 leading-relaxed">
                            {article.excerpt}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                        <div className="flex items-center space-x-4 text-xs font-bold text-white/30 uppercase tracking-widest">
                            <span className="flex items-center space-x-1.5">
                                <span>{formattedDate}</span>
                            </span>
                            {article.readTime && (
                                <span className="flex items-center space-x-1.5">
                                    <Clock size={12} className="text-indigo-500/50" />
                                    <span>{article.readTime} min read</span>
                                </span>
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
