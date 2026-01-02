import { hemeraApi } from './client';

export interface Tag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    createdAt?: string;
}

export const tagApi = {
    list: () => hemeraApi.get<Tag[]>('/tags').then(res => res.data),
    get: (id: string) => hemeraApi.get<Tag>(`/tags/${id}`).then(res => res.data),
    create: (tag: Partial<Tag>) => hemeraApi.post<Tag>('/tags', tag).then(res => res.data),
    update: (id: string, tag: Partial<Tag>) => hemeraApi.put<Tag>(`/tags/${id}`, tag).then(res => res.data),
    delete: (id: string) => hemeraApi.delete(`/tags/${id}`),
    getArticleTags: (articleId: string) => hemeraApi.get<Tag[]>(`/tags/article/${articleId}`).then(res => res.data),
    search: (query: string) => hemeraApi.get<Tag[]>('/tags/search', { params: { q: query } }).then(res => res.data),
    trending: () => hemeraApi.get<Tag[]>('/tags/trending').then(res => res.data)
};
