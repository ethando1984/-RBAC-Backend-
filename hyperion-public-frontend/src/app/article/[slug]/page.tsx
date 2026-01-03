import { PublicApi } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getImageUrl } from '@/lib/images';

export default async function ArticleDetail({ params }: { params: { slug: string } }) {
    let article;
    try {
        article = await PublicApi.getArticle(params.slug);
    } catch (error) {
        console.error(error);
        return notFound();
    }

    if (!article) return notFound();

    return (
        <article className="max-w-3xl mx-auto py-12">
            <header className="mb-12 space-y-8">
                <div className="flex items-center space-x-4">
                    {article.author?.name && (
                        <>
                            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                {article.author.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold">{article.author.name}</div>
                                <div className="text-sm text-white/50">
                                    {article.publishedAt && format(new Date(article.publishedAt), 'MMM d, yyyy')}
                                    {article.publishedAt && article.readTime && ' • '}
                                    {article.readTime && `${article.readTime} min read`}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                    {article.title}
                </h1>

                {article.subtitle && (
                    <p className="text-2xl text-white/60 font-medium">
                        {article.subtitle}
                    </p>
                )}

                {article.coverMediaUrl && (
                    <div className="aspect-video rounded-3xl overflow-hidden bg-white/5">
                        <img
                            src={getImageUrl(article.coverMediaUrl)}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </header>

            <div
                className="prose prose-invert prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            />

            <footer className="mt-16 pt-8 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                    {article.tags?.map((tag: any) => (
                        <Link
                            key={tag.slug}
                            href={`/tags/${tag.slug}`}
                            className="px-4 py-2 rounded-full bg-white/5 text-sm hover:bg-white/10 transition cursor-pointer"
                        >
                            #{tag.name}
                        </Link>
                    ))}
                </div>
            </footer>
        </article>
    );
}
