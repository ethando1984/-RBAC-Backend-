import { hemeraApi } from './client';

export interface CrawlerSource {
    id: string;
    name: string;
    baseUrl: string;
    enabled: boolean;
    extractionTemplateJson: string;
    createdAt?: string;
}

export interface CrawlerJob {
    id: string;
    sourceId: string;
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
    startedAt: string;
    finishedAt?: string;
    createdByUserId: string;
}

export interface CrawlerResult {
    id: string;
    jobId: string;
    url: string;
    extractedTitle: string;
    extractedHtml: string;
    extractedMetaJson?: string;
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONVERTED';
    reviewedByUserId?: string;
    reviewedAt?: string;
}

export const crawlerApi = {
    // Sources
    listSources: () => hemeraApi.get<CrawlerSource[]>('/crawler/sources').then(res => res.data),
    createSource: (source: Partial<CrawlerSource>) => hemeraApi.post<CrawlerSource>('/crawler/sources', source).then(res => res.data),
    updateSource: (id: string, source: Partial<CrawlerSource>) => hemeraApi.put<CrawlerSource>(`/crawler/sources/${id}`, source).then(res => res.data),
    deleteSource: (id: string) => hemeraApi.delete(`/crawler/sources/${id}`),

    // Engine
    runCrawl: (sourceId: string) => hemeraApi.post(`/crawler/sources/${sourceId}/run`),
    listJobs: (sourceId: string) => hemeraApi.get<CrawlerJob[]>('/crawler/jobs', { params: { sourceId } }).then(res => res.data),
    listResults: (jobId: string) => hemeraApi.get<CrawlerResult[]>(`/crawler/jobs/${jobId}/results`).then(res => res.data),
    convertToDraft: (resultId: string) => hemeraApi.post<{ articleId: string }>(`/crawler/results/${resultId}/convert`).then(res => res.data),
};
