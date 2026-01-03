import { PublicApi } from '@/lib/api';
import { PageRenderer } from '@/components/PageRenderer';
import { Article, HomeResponse, Category } from '@/lib/types';

export default async function Home() {
    let articles: Article[] = [];
    let staffPicks: Article[] = [];
    let topics: Category[] = [];
    let layout: any = null;

    try {
        const data: HomeResponse = await PublicApi.getHome();
        articles = data.feed || [];
        staffPicks = data.staffPicks || [];
        topics = data.recommendedTopics || [];
        layout = data.layout;
    } catch (error) {
        console.error("Home fetch failed, using fallbacks", error);
    }

    // Default configuration if no layout is set in CMS
    const DEFAULT_HOME_CONFIG = JSON.stringify({
        widgets: [
            { type: 'hero', props: { badge: 'Intelligence Platform', title: 'Future of <br /> <span className="text-indigo-gradient italic">Publishing</span>', description: 'Hyperion is a next-generation content engine delivering deep insights at the speed of thought.' } },
            { type: 'staff-picks', props: { title: 'Staff Picks' } },
            { type: 'topics', props: { title: 'Recommended Topics' } },
            { type: 'feed', props: { title: 'Latest Stories' } }
        ]
    });

    return (
        <div className="relative isolate">
            {/* Background Blobs */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] -z-10 animate-pulse-slow" />
            <div className="absolute top-1/2 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] -z-10 animate-pulse-slow" />

            <div className="max-w-4xl mx-auto py-12">
                <PageRenderer
                    configJson={layout?.configJson || DEFAULT_HOME_CONFIG}
                    articles={articles}
                    staffPicks={staffPicks}
                    categories={topics}
                />
            </div>
        </div>
    );
}
