import { hemeraApi } from './client';

export interface CrawlerSource {
    id: string;
    name: string;
    baseUrl: string;
    enabled: boolean;
    extractionTemplateJson: string;
    createdAt?: string;
}

export const crawlerApi = {
    listSources: () => hemeraApi.get<CrawlerSource[]>('/crawler/sources').then(res => res.data),
    createSource: (source: Partial<CrawlerSource>) => hemeraApi.post<CrawlerSource>('/crawler/sources', source).then(res => res.data),
    updateSource: (id: string, source: Partial<CrawlerSource>) => hemeraApi.put<CrawlerSource>(`/crawler/sources/${id}`, source).then(res => res.data),
    deleteSource: (id: string) => hemeraApi.delete(`/crawler/sources/${id}`),
};
