import { PublicApi } from '@/lib/api';
import { Storyline } from '@/lib/types';
import Link from 'next/link';
import { BookOpen, Calendar, Layers, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function StorylinesPage() {
    let storylines: Storyline[] = [];
    try {
        storylines = await PublicApi.getStorylines();
    } catch (e) {
        console.error("Failed to fetch storylines", e);
    }

    return (
        <div className="relative isolate">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" />

            <div className="max-w-4xl mx-auto pt-16 pb-32 px-4 md:px-0">
                <header className="mb-24 space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
                        <BookOpen size={14} />
                        <span>Curated Series</span>
                    </div>

                </header>

                <div className="space-y-24">
                    {storylines.length > 0 ? (
                        storylines.map(storyline => (
                            <article
                                key={storyline.id}
                                className="group"
                            >
                                {/* Status Badge */}
                                <div className="mb-6">
                                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/30">
                                        {storyline.status}
                                    </span>
                                </div>

                                {/* Title */}
                                <Link
                                    href={`/storylines/${storyline.slug}`}
                                    className="block mb-6 group-hover:text-indigo-400 transition-colors"
                                >
                                    <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1] transition-transform duration-300 group-hover:translate-x-2">
                                        {storyline.title}
                                    </h2>
                                </Link>

                                {/* Description/Subtitle */}
                                <p className="text-lg md:text-xl text-zinc-600 mb-10 leading-relaxed max-w-2xl">
                                    {storyline.description}
                                </p>

                                {/* Meta Information */}
                                <div className="flex flex-wrap items-center gap-8 text-xs text-zinc-400 mb-10">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-lg bg-zinc-100">
                                            <Layers size={14} className="text-indigo-500" />
                                        </div>
                                        <span className="font-bold tracking-wider">{storyline.articleCount || 0} ARTICLES</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-lg bg-zinc-100">
                                            <Calendar size={14} className="text-indigo-500" />
                                        </div>
                                        <span className="font-bold tracking-wider uppercase">Updated {new Date(storyline.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                {/* Read More Link */}
                                <Link
                                    href={`/storylines/${storyline.slug}`}
                                    className="inline-flex items-center space-x-3 px-6 py-3 rounded-xl bg-zinc-100 border border-zinc-200 text-indigo-400 hover:text-white hover:bg-indigo-500 transition-all duration-300 text-sm font-bold group/btn"
                                >
                                    <span>Enter Storyline</span>
                                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </Link>

                                {/* Divider */}
                                {storylines.indexOf(storyline) < storylines.length - 1 && (
                                    <div className="mt-24 h-px bg-gradient-to-r from-zinc-200 via-zinc-100 to-transparent" />
                                )}
                            </article>
                        ))
                    ) : (
                        <div className="py-24 text-center glass-card rounded-[32px] border-dashed border-zinc-200">
                            <p className="text-zinc-400 font-medium text-lg">No ongoing storylines were found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
