import { PublicApi } from '@/lib/api';
import { PageRenderer } from '@/components/PageRenderer';
import { notFound } from 'next/navigation';

export default async function StandalonePage({ params }: { params: { slug: string } }) {
    let layout;
    try {
        layout = await PublicApi.getStandaloneLayout(params.slug);
    } catch (e) {
        console.error("Failed to fetch standalone layout", e);
        return notFound();
    }

    if (!layout || !layout.isActive) {
        return notFound();
    }

    // Fetch some default data in case widgets need it
    const [articles, homeData, categories] = await Promise.all([
        PublicApi.getArticles(0, 5),
        PublicApi.getHome(),
        PublicApi.getCategories()
    ]);

    return (
        <div className="relative isolate min-h-screen">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[128px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[128px] -z-10" />

            <div className="max-w-4xl mx-auto py-20 px-4 md:px-0">
                <PageRenderer
                    configJson={layout.configJson}
                    articles={articles}
                    staffPicks={homeData.staffPicks}
                    categories={categories}
                />
            </div>
        </div>
    );
}
