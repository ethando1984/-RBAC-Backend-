import { hemeraApi } from './client';

export interface StorylineMedia {
    storylineId: string;
    mediaId: string;
    role: 'HERO' | 'GALLERY' | 'ATTACHMENT';
    sortOrder: number;
    mediaUrl?: string;
    mediaType?: string;
}

export interface Storyline {
    id?: string;
    title: string;
    slug?: string;
    description?: string;
    status: 'ONGOING' | 'ARCHIVED';
    contentsJson?: string;
    layoutJson?: string;
    seoTitle?: string;
    seoDescription?: string;
    createdByUserId?: string;
    createdByEmail?: string;
    createdAt?: string;
    updatedAt?: string;
    articleCount?: number;
    articleIds?: string[];
    articles?: any[];
    media?: StorylineMedia[];
}

export const storylineApi = {
    list: (params?: { search?: string, page?: number, size?: number }) =>
        hemeraApi.get<Storyline[]>('/storylines', { params }).then(res => res.data),
    get: (id: string) => hemeraApi.get<Storyline>(`/storylines/${id}`).then(res => res.data),
    create: (data: Storyline) => hemeraApi.post<Storyline>('/storylines', data).then(res => res.data),
    update: (id: string, data: Storyline) => hemeraApi.put<Storyline>(`/storylines/${id}`, data).then(res => res.data),
    updateContents: (id: string, contentsJson: string) => hemeraApi.put(`/storylines/${id}/contents`, contentsJson, { headers: { 'Content-Type': 'text/plain' } }),
    updateLayout: (id: string, layoutJson: string) => hemeraApi.put(`/storylines/${id}/layout`, layoutJson, { headers: { 'Content-Type': 'text/plain' } }),
    addMedia: (id: string, mediaIds: string[], role: string = 'GALLERY') => hemeraApi.post(`/storylines/${id}/media`, { mediaIds, role }),
    removeMedia: (id: string, mediaId: string) => hemeraApi.delete(`/storylines/${id}/media/${mediaId}`),
    delete: (id: string) => hemeraApi.delete(`/storylines/${id}`).then(res => res.data),
    preview: (id: string) => hemeraApi.get<Storyline>(`/storylines/${id}/preview`).then(res => res.data),
};
