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

            <div className="max-w-4xl mx-auto py-12 px-4 md:px-0">
                <header className="mb-20 space-y-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        <BookOpen size={14} />
                        <span>Curated Series</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tight text-gradient leading-tight">
                        Deep <span className="italic text-indigo-gradient">Storylines</span>
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
                        Follow evolving narratives and long-term coverage across our most important topics.
                    </p>
                </header>

                <div className="grid gap-8">
                    {storylines.length > 0 ? (
                        storylines.map(storyline => (
                            <Link
                                key={storyline.id}
                                href={`/storylines/${storyline.slug}`}
                                className="group block glass-card rounded-[32px] p-8 md:p-12 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                    <h2 className="text-3xl md:text-4xl font-bold group-hover:text-indigo-400 transition-colors">
                                        {storyline.title}
                                    </h2>
                                    <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/30">
                                        {storyline.status}
                                    </span>
                                </div>

                                <p className="text-xl text-white/60 mb-10 leading-relaxed line-clamp-2 md:line-clamp-none">
                                    {storyline.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                    <div className="flex items-center space-x-2">
                                        <Layers size={14} className="text-indigo-500/50" />
                                        <span>{storyline.articleCount} Articles</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar size={14} className="text-indigo-500/50" />
                                        <span>Updated {new Date(storyline.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="ml-auto flex items-center space-x-2 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span>Explore Narrative</span>
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="py-24 text-center glass-card rounded-[32px] border-dashed">
                            <p className="text-white/30 font-medium text-lg">No ongoing storylines were found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
