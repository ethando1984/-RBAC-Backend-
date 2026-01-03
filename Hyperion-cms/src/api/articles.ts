import { hemeraApi } from './client';

export interface Article {
    id: string;
    title: string;
    subtitle?: string;
    slug: string;
    contentHtml: string;
    excerpt?: string;
    coverMediaId?: string;
    coverMediaUrl?: string;
    status: 'DRAFT' | 'PENDING_EDITORIAL' | 'PENDING_PUBLISHING' | 'SCHEDULED' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
    visibility: 'PUBLIC' | 'PRIVATE' | 'PASSWORD';
    authorUserId?: string;
    authorRoleId?: string;
    createdByEmail?: string;
    updatedByEmail?: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
    scheduledAt?: string;
    categoryIds?: string[];
    primaryCategoryId?: string;
    tagNames?: string[];
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    robots?: string;
    sourceName?: string;
    sourceUrl?: string;
}

export const articleApi = {
    list: (params?: any) => hemeraApi.get<Article[]>('/articles', { params }).then(res => res.data),
    get: (id: string) => hemeraApi.get<Article>(`/articles/${id}`).then(res => res.data),
    create: (data: Partial<Article>) => hemeraApi.post<Article>('/articles', data).then(res => res.data),
    update: (id: string, data: Partial<Article>) => hemeraApi.put<Article>(`/articles/${id}`, data).then(res => res.data),
    delete: (id: string) => hemeraApi.delete(`/articles/${id}`),
    workflow: (id: string, action: string, params?: any) => hemeraApi.post(`/articles/${id}/workflow/${action}`, null, { params }).then(res => res.data),
    getVersions: (id: string) => hemeraApi.get(`/articles/${id}/versions`).then(res => res.data),
    restoreVersion: (id: string, versionId: string) => hemeraApi.post(`/articles/${id}/restore/${versionId}`).then(res => res.data),
};
