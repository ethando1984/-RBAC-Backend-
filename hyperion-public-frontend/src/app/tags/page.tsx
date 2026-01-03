import { PublicApi } from '@/lib/api';
import { Tag } from '@/lib/types';
import Link from 'next/link';
import { Hash, Tags, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function TagsPage() {
    let tags: Tag[] = [];
    try {
        tags = await PublicApi.getTags();
    } catch (e) {
        console.error("Failed to fetch tags", e);
    }

    return (
        <div className="relative isolate">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" />

            <div className="max-w-4xl mx-auto py-12 px-4 md:px-0">
                <header className="mb-20 space-y-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        <Tags size={14} />
                        <span>Taxonomy</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tight text-gradient leading-tight">
                        Explore by <span className="italic text-indigo-gradient">Tags</span>
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
                        Navigate through our knowledge graph and find articles grouped by specific technical topics and themes.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tags.length > 0 ? (
                        tags.map(tag => (
                            <Link
                                key={tag.id}
                                href={`/tags/${tag.slug}`}
                                className="group block glass-card p-8 rounded-[32px] hover:border-indigo-500/50 transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.2)]"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                        <Hash size={24} />
                                    </div>
                                    <ArrowRight size={20} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">
                                    {tag.name}
                                </h2>
                                <p className="text-sm text-white/40 leading-relaxed">
                                    Browse all articles tagged with {tag.name}.
                                </p>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center glass-card rounded-[32px] border-dashed">
                            <p className="text-white/30 font-medium text-lg">No tags were found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
