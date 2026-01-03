import { HomeResponse, Article, Category, Tag, Storyline } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089';

export async function fetchFromGateway(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        next: { revalidate: 0 }, // No cache for now to ensure updates
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch from gateway: ${res.statusText}`);
    }

    return res.json();
}

export const PublicApi = {
    getHome: (): Promise<HomeResponse> => fetchFromGateway('/public/home'),
    getArticle: (slug: string): Promise<Article> => fetchFromGateway(`/public/articles/${slug}`),
    getArticles: (page = 0, pageSize = 10): Promise<Article[]> => fetchFromGateway(`/public/articles?page=${page}&pageSize=${pageSize}`),
    getCategories: (): Promise<Category[]> => fetchFromGateway('/public/categories'),
    getCategory: (slug: string): Promise<Category> => fetchFromGateway(`/public/categories/${slug}`),
    getCategoryArticles: (slug: string, page = 0, pageSize = 10): Promise<Article[]> => fetchFromGateway(`/public/categories/${slug}/articles?page=${page}&pageSize=${pageSize}`),
    getTag: (slug: string): Promise<Tag> => fetchFromGateway(`/public/tags/${slug}`),
    getTags: (): Promise<Tag[]> => fetchFromGateway('/public/tags'),
    getTagArticles: (slug: string, page = 0, pageSize = 10): Promise<Article[]> => fetchFromGateway(`/public/tags/${slug}/articles?page=${page}&pageSize=${pageSize}`),
    getStorylines: (page = 0): Promise<Storyline[]> => fetchFromGateway(`/public/storylines?page=${page}`),
    getStoryline: (slug: string): Promise<any> => fetchFromGateway(`/public/storylines/${slug}`),
    search: (q: string, page = 0): Promise<Article[]> => fetchFromGateway(`/public/search?q=${q}&page=${page}`),
    getStandaloneLayout: (slug: string): Promise<any> => fetchFromGateway(`/public/layouts/standalone/${slug}`),
    resolveLayout: (type: string, targetId?: string): Promise<any> =>
        fetchFromGateway(`/public/layouts/resolve?type=${type}${targetId ? `&targetId=${targetId}` : ''}`),
};
