import { PublicApi } from '@/lib/api';
import Link from 'next/link';
import { Compass, BookOpen, Layers, Hash, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function ExplorePage() {
    let categories = [];
    let tags = [];
    let storylines = [];

    try {
        [categories, tags, storylines] = await Promise.all([
            PublicApi.getCategories(),
            PublicApi.getTags(),
            PublicApi.getStorylines()
        ]);
    } catch (e) {
        console.error("Explore fetch failed", e);
    }

    return (
        <div className="relative isolate">
            <div className="absolute top-0 right-0 w-full h-full bg-indigo-500/[0.02] -z-10" />

            <div className="max-w-5xl mx-auto py-12 px-4 md:px-0 space-y-24">
                <header className="space-y-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        <Compass size={14} />
                        <span>Curated Discovery</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight text-gradient leading-[0.9]">
                        Explore <br />
                        <span className="italic text-indigo-gradient">Intelligence</span>
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
                        Deep dive into our structured knowledge base through categories, narrative storylines, and technical tags.
                    </p>
                </header>

                {/* Categories Section */}
                <section>
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center space-x-3">
                            <Layers className="text-indigo-500" size={24} />
                            <h2 className="text-3xl font-bold italic text-white">Top Categories</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.slice(0, 9).map((category: any) => (
                            <Link
                                key={category.id}
                                href={`/category/${category.slug}`}
                                className="group relative overflow-hidden p-8 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.05] transition-all"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Layers size={48} className="text-indigo-500" />
                                </div>
                                <div className="relative z-10 flex flex-col items-start gap-4">
                                    <span className="font-black text-xl md:text-2xl group-hover:text-indigo-400 transition-colors tracking-tight">{category.name}</span>
                                    <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors line-clamp-2">
                                        Explore the latest articles and deep dives in {category.name.toLowerCase()}.
                                    </p>
                                    <ArrowRight size={20} className="text-indigo-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Storylines Section */}
                <section>
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center space-x-3">
                            <BookOpen className="text-indigo-500" size={24} />
                            <h2 className="text-3xl font-bold italic">Narrative Storylines</h2>
                        </div>
                        <Link href="/storylines" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View all storylines</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {storylines.slice(0, 4).map((storyline: any) => (
                            <Link
                                key={storyline.id}
                                href={`/storylines/${storyline.slug}`}
                                className="group relative overflow-hidden glass-card rounded-[32px] p-8 hover:border-indigo-500/50 transition-all"
                            >
                                <div className="relative z-10">
                                    <span className="inline-block px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                        {storyline.status}
                                    </span>
                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">{storyline.title}</h3>
                                    <p className="text-white/50 text-sm line-clamp-2 mb-6 leading-relaxed">{storyline.description}</p>
                                    <div className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center space-x-2">
                                        <span>{storyline.articleCount} Articles</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span>Updated {new Date(storyline.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Tags Section */}
                <section className="bg-indigo-500/[0.03] border border-indigo-500/10 rounded-[40px] p-10 md:p-16">
                    <div className="max-w-3xl">
                        <div className="flex items-center space-x-3 mb-6">
                            <Hash className="text-indigo-500" size={24} />
                            <h2 className="text-3xl font-bold italic">Popular Tags</h2>
                        </div>
                        <p className="text-white/50 mb-10 leading-relaxed text-lg">
                            Quickly find articles related to the technologies and concepts you're interested in.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {tags.slice(0, 20).map((tag: any) => (
                                <Link
                                    key={tag.id}
                                    href={`/tags/${tag.slug}`}
                                    className="px-5 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:bg-indigo-500 hover:border-indigo-500 transition-all text-sm font-semibold"
                                >
                                    #{tag.name}
                                </Link>
                            ))}
                            <Link
                                href="/tags"
                                className="px-5 py-2.5 rounded-2xl border border-dashed border-white/20 hover:border-white/40 transition-all text-sm font-semibold text-white/40 hover:text-white"
                            >
                                View all tags →
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
