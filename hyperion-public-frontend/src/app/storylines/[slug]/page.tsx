import { PublicApi } from '@/lib/api';
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/ArticleCard';
import { getImageUrl } from '@/lib/images';
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

// Convert JSON content to rendered HTML components
function renderContentFromJson(contentsJson: string) {
    if (!contentsJson) return null;

    try {
        const parsed = JSON.parse(contentsJson);

        // Handle Editor.js or block-based format
        if (parsed.blocks && Array.isArray(parsed.blocks)) {
            return (
                <div className="space-y-6">
                    {parsed.blocks.map((block: any, index: number) => {
                        switch (block.type) {
                            case 'paragraph':
                                return (
                                    <p key={index} className="text-lg leading-relaxed text-white/80">
                                        {block.data.text}
                                    </p>
                                );

                            case 'header':
                                const level = block.data.level || 2;
                                const className = level === 1
                                    ? "text-4xl font-bold text-white mt-12 mb-6"
                                    : level === 2
                                        ? "text-3xl font-bold text-white mt-10 mb-5"
                                        : "text-2xl font-bold text-white mt-8 mb-4";

                                return React.createElement(
                                    `h${level}`,
                                    { key: index, className },
                                    block.data.text
                                );

                            case 'list':
                                const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                                const listClass = block.data.style === 'ordered'
                                    ? 'list-decimal list-inside space-y-2 text-white/80 ml-4'
                                    : 'list-disc list-inside space-y-2 text-white/80 ml-4';

                                return (
                                    <ListTag key={index} className={listClass}>
                                        {block.data.items.map((item: string, i: number) => (
                                            <li key={i} className="leading-relaxed">{item}</li>
                                        ))}
                                    </ListTag>
                                );

                            case 'image':
                                return (
                                    <div key={index} className="my-8">
                                        <img
                                            src={getImageUrl(block.data.file?.url || block.data.url)}
                                            alt={block.data.caption || ''}
                                            className="w-full rounded-2xl shadow-2xl"
                                        />
                                        {block.data.caption && (
                                            <p className="text-sm text-white/50 text-center mt-3">
                                                {block.data.caption}
                                            </p>
                                        )}
                                    </div>
                                );

                            case 'quote':
                                return (
                                    <blockquote key={index} className="border-l-4 border-indigo-500 pl-6 py-4 my-8 italic text-white/70 text-lg">
                                        {block.data.text}
                                        {block.data.caption && (
                                            <footer className="text-sm text-white/50 mt-2 not-italic">
                                                — {block.data.caption}
                                            </footer>
                                        )}
                                    </blockquote>
                                );

                            case 'delimiter':
                                return (
                                    <div key={index} className="flex items-center justify-center my-8">
                                        <div className="flex space-x-2">
                                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                                        </div>
                                    </div>
                                );

                            case 'warning':
                            case 'alert':
                                return (
                                    <div key={index} className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 my-6">
                                        <div className="flex items-start space-x-3">
                                            <span className="text-2xl">⚠️</span>
                                            <div>
                                                {block.data.title && (
                                                    <h4 className="font-bold text-yellow-400 mb-2">{block.data.title}</h4>
                                                )}
                                                <p className="text-white/80">{block.data.message || block.data.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                );

                            case 'code':
                                return (
                                    <pre key={index} className="bg-black/40 rounded-2xl p-6 overflow-x-auto my-6">
                                        <code className="text-sm text-green-400 font-mono">
                                            {block.data.code}
                                        </code>
                                    </pre>
                                );

                            default:
                                // For unknown block types, try to render as paragraph
                                if (block.data.text) {
                                    return (
                                        <p key={index} className="text-lg leading-relaxed text-white/80">
                                            {block.data.text}
                                        </p>
                                    );
                                }
                                return null;
                        }
                    })}
                </div>
            );
        }

        // Handle Array of blocks directly (new format)
        if (Array.isArray(parsed)) {
            return (
                <div className="space-y-8">
                    {parsed.map((block: any, index: number) => {
                        switch (block.type) {
                            case 'text':
                                return (
                                    <p key={index} className="text-lg leading-relaxed text-white/80">
                                        {block.content}
                                    </p>
                                );
                            case 'quote':
                                return (
                                    <div key={index} className="py-20 px-8 md:px-16 my-12 relative group/quote overflow-hidden rounded-[40px] border border-amber-500/10 bg-amber-500/5 backdrop-blur-sm">
                                        {/* Large Quote Mark Decoration */}
                                        <div className="absolute -top-10 -left-6 text-[12rem] font-black text-amber-500/5 pointer-events-none select-none">
                                            “
                                        </div>

                                        <div className="relative z-10 space-y-8">
                                            <p className="text-2xl md:text-4xl font-bold italic leading-relaxed text-amber-100 tracking-tight">
                                                {block.content}
                                            </p>

                                            {(block.settings?.author || block.settings?.subtitle) && (
                                                <div className="flex items-center space-x-4">
                                                    <div className="h-px w-10 bg-amber-500/40" />
                                                    <span className="text-xs font-black uppercase tracking-[0.4em] text-amber-500">
                                                        {block.settings.author || block.settings.subtitle}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            case 'image':
                                return (
                                    <div key={index} className="my-10">
                                        <img
                                            src={getImageUrl(block.settings?.url || block.content)}
                                            alt=""
                                            className="w-full rounded-[32px] shadow-2xl border border-white/10"
                                        />
                                    </div>
                                );
                            case 'article':
                                return (
                                    <div key={index} className="bg-indigo-500/5 border border-indigo-500/10 rounded-[32px] p-8">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">Featured Insight</h4>
                                        <Link href={`/article/${block.settings?.slug}`} className="block group">
                                            <h3 className="text-2xl font-bold group-hover:text-indigo-400 transition-colors mb-2">
                                                {block.settings?.title}
                                            </h3>
                                            <p className="text-white/40 text-sm line-clamp-2">
                                                {block.settings?.excerpt || 'Click to read this featured article.'}
                                            </p>
                                        </Link>
                                    </div>
                                );
                            default:
                                return null;
                        }
                    })}
                </div>
            );
        }

        // Handle simple object with content field
        if (parsed.content && typeof parsed.content === 'string') {
            return <div dangerouslySetInnerHTML={{ __html: parsed.content }} />;
        }

        // If it's just a string wrapped in JSON
        if (typeof parsed === 'string') {
            return <div dangerouslySetInnerHTML={{ __html: parsed }} />;
        }

        // Fallback: display as formatted JSON (for debugging)
        return (
            <div className="bg-white/5 rounded-2xl p-6 my-6">
                <p className="text-white/50 text-sm mb-2">Content structure:</p>
                <pre className="text-xs text-white/40 overflow-x-auto">
                    {JSON.stringify(parsed, null, 2)}
                </pre>
            </div>
        );

    } catch (e) {
        // Not JSON, treat as HTML string
        return <div dangerouslySetInnerHTML={{ __html: contentsJson }} />;
    }
}

export default async function StorylineDetail({ params }: PageProps) {
    let storyline;
    try {
        storyline = await PublicApi.getStoryline(params.slug);
    } catch (error) {
        return notFound();
    }

    if (!storyline) return notFound();

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <header className="mb-20 text-center relative isolate">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/5 blur-[100px] -z-10" />

                <div className="inline-flex items-center space-x-2 px-4 py-1.5 mb-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span>{storyline.status === 'ONGOING' ? 'ONGOING' : 'ARCHIVED'}</span>
                </div>

                <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 text-gradient leading-[0.9]">
                    {storyline.title}
                </h1>

                <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed font-medium">
                    {storyline.description}
                </p>
            </header>

            {/* Storyline Content Body - Rendered from JSON */}
            {storyline.contentsJson && (
                <div className="max-w-3xl mx-auto mb-24">
                    <article className="prose prose-invert prose-indigo prose-lg max-w-none">
                        {renderContentFromJson(storyline.contentsJson)}
                    </article>
                </div>
            )}

            {/* Timeline Section */}
            {storyline.articles && storyline.articles.length > 0 && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center space-x-8 mb-20">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-white/10" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 whitespace-nowrap">
                            Timeline of Events
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-white/10" />
                    </div>

                    <div className="relative ml-4 md:ml-12 border-l border-white/10 pl-12 md:pl-20 space-y-24">
                        {storyline.articles.map((article: any, index: number) => (
                            <div key={article.id} className="relative group/item">
                                {/* Timeline Indicator (The Dot) */}
                                <div className="absolute -left-[58px] md:-left-[90px] top-0 w-[18px] h-[18px] rounded-full bg-black border-[3px] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover/item:scale-125 transition-transform duration-300" />

                                {/* Chapter Label */}
                                <div className="mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                                        Chapter {index + 1}
                                    </span>
                                </div>

                                {/* Article Card in Timeline */}
                                <div className="transition-all duration-500 hover:-translate-y-1">
                                    <ArticleCard article={article} variant="list" />
                                </div>

                                {/* Connector logic for better flow */}
                                {index === storyline.articles.length - 1 && (
                                    <div className="absolute -left-[50px] md:-left-[81.5px] top-[18px] bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(!storyline.articles || storyline.articles.length === 0) && (
                <div className="text-center py-12">
                    <p className="text-white/40 italic">No articles in this storyline yet.</p>
                </div>
            )}
        </div>
    );
}
