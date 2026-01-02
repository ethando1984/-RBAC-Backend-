import { useState, useEffect } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { Globe, CheckCircle, AlertTriangle, Download, RefreshCw, TrendingUp, FileText, Image, Search, Loader2, ExternalLink, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { seoApi } from '../../api/seo';
import { cn } from '../../utils/cn';

export function SEO() {
    const { data: sitemapInfo, refetch: refetchSitemap } = useQuery({
        queryKey: ['seo-sitemap'],
        queryFn: seoApi.getSitemapInfo
    });

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['seo-analytics'],
        queryFn: seoApi.getAnalytics
    });

    const [isRegenerating, setIsRegenerating] = useState(false);

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        await refetchSitemap();
        setTimeout(() => setIsRegenerating(false), 1000);
    };

    const getHealthColor = (score: number) => {
        if (score >= 90) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', ring: 'ring-green-500' };
        if (score >= 70) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', ring: 'ring-yellow-500' };
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', ring: 'ring-red-500' };
    };

    const healthScore = analytics?.healthScore || 0;
    const healthColors = getHealthColor(healthScore);

    return (
        <PageShell
            title="SEO Management"
            description="Search engine optimization, sitemaps, and content health monitoring"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Health Score Hero */}
                    <div className={cn(
                        "relative overflow-hidden rounded-[2.5rem] p-10 border-2 shadow-xl transition-all",
                        healthColors.bg, healthColors.border
                    )}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className={cn("text-sm font-bold uppercase tracking-[0.2em] mb-2", healthColors.text, "opacity-70")}>
                                        SEO Health Score
                                    </h3>
                                    <p className="text-xs text-gray-500">Based on {analytics?.totalArticles || 0} published articles</p>
                                </div>
                                <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg", healthColors.bg, "border-2", healthColors.border)}>
                                    <TrendingUp className={cn("h-8 w-8", healthColors.text)} />
                                </div>
                            </div>

                            <div className="flex items-end gap-6">
                                <div>
                                    {analyticsLoading ? (
                                        <Loader2 className="h-20 w-20 animate-spin text-gray-300" />
                                    ) : (
                                        <div className="flex items-baseline">
                                            <span className={cn("text-7xl font-black tracking-tight", healthColors.text)}>{healthScore}</span>
                                            <span className={cn("text-3xl font-bold ml-2", healthColors.text, "opacity-50")}>/100</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 grid grid-cols-3 gap-4 pb-2">
                                    <div className="text-center">
                                        <div className={cn("text-2xl font-black", healthColors.text)}>{analytics?.missingMetaDescription || 0}</div>
                                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1">Missing Meta</div>
                                    </div>
                                    <div className="text-center">
                                        <div className={cn("text-2xl font-black", healthColors.text)}>{analytics?.missingSeoTitle || 0}</div>
                                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1">Missing Title</div>
                                    </div>
                                    <div className="text-center">
                                        <div className={cn("text-2xl font-black", healthColors.text)}>{analytics?.missingAltTags || 0}</div>
                                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1">Missing Alt</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sitemap Section */}
                    <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-lg overflow-hidden">
                        <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                        <Globe className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900">XML Sitemap</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">Search engine discovery manifest</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRegenerate}
                                    disabled={isRegenerating}
                                    className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                    <RefreshCw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />
                                    {isRegenerating ? 'Regenerating...' : 'Refresh'}
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Primary Sitemap</span>
                                    </div>
                                    <p className="text-sm font-mono text-blue-900 font-semibold">https://hemera.com/sitemap.xml</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-blue-700">
                                        <span className="flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                                            {sitemapInfo?.totalUrls || 0} URLs indexed
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                            Last updated: {sitemapInfo?.lastGenerated ? new Date(sitemapInfo.lastGenerated).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => seoApi.downloadSitemap()}
                                        className="p-3 bg-white hover:bg-blue-50 text-blue-600 rounded-xl transition-all shadow-sm border border-blue-100 active:scale-95"
                                        title="View XML"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => seoApi.downloadSitemap()}
                                        className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md active:scale-95"
                                        title="Download"
                                    >
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="h-4 w-4 text-purple-600" />
                                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Robots Configuration</span>
                                    </div>
                                    <p className="text-sm font-mono text-purple-900 font-semibold">https://hemera.com/robots.txt</p>
                                    <p className="text-xs text-purple-700 mt-2">Crawler access control and sitemap reference</p>
                                </div>
                                <button
                                    onClick={() => seoApi.downloadRobotsTxt()}
                                    className="p-3 bg-white hover:bg-purple-50 text-purple-600 rounded-xl transition-all shadow-sm border border-purple-100 active:scale-95"
                                    title="View robots.txt"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-lg p-6">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl transition-all text-left border-2 border-blue-100 active:scale-95 group">
                                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <Search className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-blue-900">Submit to Google</div>
                                    <div className="text-[10px] text-blue-600 font-medium">Search Console</div>
                                </div>
                            </button>

                            <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl transition-all text-left border-2 border-green-100 active:scale-95 group">
                                <div className="h-10 w-10 bg-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-green-900">Validate Schema</div>
                                    <div className="text-[10px] text-green-600 font-medium">Structured Data</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Health Checks */}
                    <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-lg p-6">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">System Health</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">Robots.txt Valid</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Accessible by all major crawlers</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">SSL Certificate</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Valid and secure</p>
                                </div>
                            </div>

                            {analytics && analytics.missingAltTags > 0 && (
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">Missing Alt Tags</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{analytics.missingAltTags} images need descriptions</p>
                                    </div>
                                </div>
                            )}

                            {analytics && analytics.missingMetaDescription > 0 && (
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">Meta Descriptions</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{analytics.missingMetaDescription} articles missing</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
