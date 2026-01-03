import { Article } from '@/lib/types';
import { ArticleCard } from './ArticleCard';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StaffPicksProps {
    articles: Article[];
    title?: string;
    variant?: 'full' | 'sidebar';
}

export function StaffPicks({ articles, title = "Staff Picks", variant = 'full' }: StaffPicksProps) {
    if (!articles || articles.length === 0) return null;

    if (variant === 'sidebar') {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-2 text-indigo-500">
                    <Sparkles size={16} />
                    <h3 className="text-sm font-black uppercase tracking-widest">{title}</h3>
                </div>
                <div className="space-y-4">
                    {articles.map(article => (
                        <Link
                            key={article.id}
                            href={`/article/${article.slug}`}
                            className="group block"
                        >
                            <h4 className="text-sm font-bold group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-1">
                                {article.title}
                            </h4>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                {article.author?.name || 'Editorial'}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <section className="relative">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Editor's Selection</h3>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight">{title}</h2>
                </div>
            </div>
            <div className="grid gap-8">
                {articles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </section>
    );
}
