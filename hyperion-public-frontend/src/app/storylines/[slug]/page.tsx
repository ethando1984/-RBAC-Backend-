import { PublicApi } from '@/lib/api';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/ArticleCard';
import { format } from 'date-fns';
import type { Metadata, Viewport } from 'next';

export const revalidate = 0;

interface PageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const storyline = await PublicApi.getStoryline(params.slug);
        if (!storyline) return { title: 'Not Found' };

        return {
            title: storyline.title,
            description: storyline.description,
        };
    } catch (e) {
        return { title: 'Error' };
    }
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export default async function StorylineDetail({ params }: PageProps) {
    let storyline;
    try {
        storyline = await PublicApi.getStoryline(params.slug);
    } catch (error) {
        return notFound();
    }

    if (!storyline) return notFound();

    return (
        <div className="max-w-4xl mx-auto py-12">
            <header className="mb-20 text-center relative isolate">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/5 blur-[100px] -z-10" />

                <div className="inline-flex items-center space-x-2 px-4 py-1.5 mb-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span>Active Narrative</span>
                </div>

                <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 text-gradient leading-[0.9]">
                    {storyline.title}
                </h1>

                <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed font-medium">
                    {storyline.description}
                </p>
            </header>

            {/* Storyline Content Body */}
            {storyline.contentsJson && (
                <div className="max-w-3xl mx-auto mb-24 prose prose-invert prose-indigo prose-lg">
                    <div
                        className="text-white/80 leading-relaxed space-y-6"
                        dangerouslySetInnerHTML={{ __html: storyline.contentsJson }}
                    />
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                <div className="flex items-center space-x-4 mb-12">
                    <div className="h-px flex-1 bg-white/10" />
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/30 whitespace-nowrap">Timeline of Events</h2>
                    <div className="h-px flex-1 bg-white/10" />
                </div>
            </div>

            <div className="relative border-l-2 border-white/10 ml-4 md:ml-8 pl-8 md:pl-12 space-y-12">
                {storyline.articles?.map((article: any, index: number) => (
                    <div key={article.id} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute -left-[41px] md:-left-[57px] top-6 w-5 h-5 rounded-full bg-black border-4 border-indigo-500" />

                        <div className="mb-2 text-sm text-indigo-400 font-bold uppercase tracking-widest">
                            Chapter {index + 1}
                        </div>

                        <ArticleCard article={article} />
                    </div>
                ))}

                {storyline.articles?.length === 0 && (
                    <div className="text-white/40 italic">No articles in this storyline yet.</div>
                )}
            </div>
        </div>
    );
}
