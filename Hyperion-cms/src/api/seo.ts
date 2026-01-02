import { hemeraApi } from './client';

export interface SEOAnalytics {
    totalArticles: number;
    missingMetaDescription: number;
    missingSeoTitle: number;
    missingAltTags: number;
    healthScore: number;
}

export interface SitemapInfo {
    totalUrls: number;
    lastGenerated: string;
    sitemapUrl: string;
}

export const seoApi = {
    getSitemapInfo: () => hemeraApi.get<SitemapInfo>('/seo/sitemap').then(res => res.data),
    getAnalytics: () => hemeraApi.get<SEOAnalytics>('/seo/analytics').then(res => res.data),
    downloadSitemap: () => window.open('http://localhost:8081/api/seo/sitemap.xml', '_blank'),
    downloadRobotsTxt: () => window.open('http://localhost:8081/api/seo/robots.txt', '_blank'),
};
