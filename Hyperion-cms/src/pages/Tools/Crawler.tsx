import { useState } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { Bot, Play, RefreshCw, ExternalLink, Plus, Settings, X, Trash2, Check, AlertCircle, Loader2, Code, History, FileText, ArrowRight, CornerDownRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crawlerApi, type CrawlerSource, type CrawlerJob, type CrawlerResult } from '../../api/crawler';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

export function Crawler() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'sources' | 'jobs'>('sources');
    const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<CrawlerSource | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        baseUrl: '',
        enabled: true,
        extractionTemplateJson: JSON.stringify({
            itemSelector: 'article',
            titleSelector: 'h2',
            linkSelector: 'a',
            contentSelector: '.entry-content',
            excerptSelector: '.excerpt'
        }, null, 2)
    });

    const { data: sources, isLoading: isLoadingSources } = useQuery({
        queryKey: ['crawler-sources'],
        queryFn: crawlerApi.listSources
    });

    const { data: jobs, isLoading: isLoadingJobs } = useQuery({
        queryKey: ['crawler-jobs', selectedSourceId],
        queryFn: () => selectedSourceId ? crawlerApi.listJobs(selectedSourceId) : Promise.resolve([]),
        enabled: !!selectedSourceId
    });

    const { data: results, isLoading: isLoadingResults } = useQuery({
        queryKey: ['crawler-results', selectedJobId],
        queryFn: () => selectedJobId ? crawlerApi.listResults(selectedJobId) : Promise.resolve([]),
        enabled: !!selectedJobId
    });

    const saveMutation = useMutation({
        mutationFn: (data: Partial<CrawlerSource>) => {
            if (editingSource) return crawlerApi.updateSource(editingSource.id, data);
            return crawlerApi.createSource(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crawler-sources'] });
            setIsModalOpen(false);
            setEditingSource(null);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: crawlerApi.deleteSource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crawler-sources'] });
        }
    });

    const runCrawlMutation = useMutation({
        mutationFn: crawlerApi.runCrawl,
        onSuccess: () => {
            // Switch to jobs tab and select source
            // Wait a bit to ensure job is created
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['crawler-jobs'] });
            }, 1000);
            setActiveTab('jobs');
        }
    });

    const convertMutation = useMutation({
        mutationFn: crawlerApi.convertToDraft,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['crawler-results'] });
            if (window.confirm('Article draft created! Go to editor?')) {
                navigate(`/articles/edit/${data.articleId}`);
            }
        }
    });

    const resetForm = () => {
        setFormData({
            name: '',
            baseUrl: '',
            enabled: true,
            extractionTemplateJson: JSON.stringify({
                itemSelector: 'article',
                titleSelector: 'h2',
                linkSelector: 'a',
                contentSelector: '.entry-content',
                excerptSelector: '.excerpt'
            }, null, 2)
        });
    };

    const handleEdit = (source: CrawlerSource) => {
        setEditingSource(source);
        setFormData({
            name: source.name,
            baseUrl: source.baseUrl,
            enabled: source.enabled,
            extractionTemplateJson: source.extractionTemplateJson || '{}'
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this crawler source?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSave = () => {
        saveMutation.mutate(formData);
    };

    return (
        <PageShell
            title="Content Crawler"
            description="Configure and monitor aggregation jobs from external news sites"
            actions={
                <div className="flex gap-2">
                    <div className="bg-gray-100 p-1 rounded-lg flex items-center mr-4">
                        <button
                            onClick={() => setActiveTab('sources')}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                activeTab === 'sources' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                        >Sources</button>
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                activeTab === 'jobs' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                        >Jobs & Results</button>
                    </div>

                    <button
                        onClick={() => { setEditingSource(null); resetForm(); setIsModalOpen(true); }}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Source
                    </button>
                </div>
            }
        >
            {activeTab === 'sources' && (
                <div className="grid grid-cols-1 gap-8">
                    {/* Sources Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Configured Sources</h3>
                                <p className="text-xs text-gray-500 mt-1">Found {sources?.length || 0} active configurations</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="bg-gray-50/30">
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source Entity</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base URL</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Commands</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {isLoadingSources ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 opacity-20" />
                                                <span className="text-xs font-medium uppercase tracking-widest">Initializing...</span>
                                            </td>
                                        </tr>
                                    ) : sources?.map(source => (
                                        <tr key={source.id} className="group hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-sm mr-4 group-hover:scale-110 transition-transform">
                                                        <Bot className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{source.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {source.id.substring(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {source.enabled ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wider">
                                                        <Check className="h-3 w-3 mr-1" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-100 uppercase tracking-wider">
                                                        <X className="h-3 w-3 mr-1" /> Terminated
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <a
                                                    href={source.baseUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1.5 transition-colors"
                                                >
                                                    <span className="truncate max-w-[200px]">{source.baseUrl}</span>
                                                    <ExternalLink className="h-3 w-3 opacity-50" />
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSourceId(source.id);
                                                            runCrawlMutation.mutate(source.id);
                                                        }}
                                                        disabled={runCrawlMutation.isPending}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Run Trigger"
                                                    >
                                                        {runCrawlMutation.isPending && selectedSourceId === source.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSourceId(source.id);
                                                            setActiveTab('jobs');
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                        title="View History"
                                                    >
                                                        <History className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(source)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Configure Source"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(source.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete Source"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!isLoadingSources && sources?.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <div className="max-w-xs mx-auto text-gray-400">
                                                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                                    <p className="text-lg font-medium text-gray-900 mb-1">No Sources Found</p>
                                                    <p className="text-sm">Click the button above to add your first content crawler source.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'jobs' && (
                <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
                    {/* Sidebar: Sources & Jobs */}
                    <div className="col-span-4 flex flex-col gap-6 h-full overflow-hidden">

                        {/* 1. Source Selection */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col max-h-[40%]">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Source</h3>
                            </div>
                            <div className="overflow-y-auto p-2 space-y-1">
                                {sources?.map(source => (
                                    <button
                                        key={source.id}
                                        onClick={() => { setSelectedSourceId(source.id); setSelectedJobId(null); }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                                            selectedSourceId === source.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <Bot className="h-4 w-4" />
                                        <span className="truncate">{source.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Job List */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Execution History</h3>
                                <button
                                    onClick={() => queryClient.invalidateQueries({ queryKey: ['crawler-jobs'] })}
                                    className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                ><RefreshCw className="h-3 w-3" /></button>
                            </div>
                            <div className="overflow-y-auto p-2 space-y-1">
                                {isLoadingJobs ? (
                                    <div className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-300" /></div>
                                ) : !selectedSourceId ? (
                                    <div className="p-8 text-center text-gray-400 text-xs italic">Select a source to view jobs</div>
                                ) : jobs?.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-xs italic">No jobs found</div>
                                ) : jobs?.map(job => (
                                    <button
                                        key={job.id}
                                        onClick={() => setSelectedJobId(job.id)}
                                        className={cn(
                                            "w-full flex flex-col gap-1 px-4 py-3 rounded-lg text-sm transition-colors text-left border border-transparent",
                                            selectedJobId === job.id ? "bg-purple-50 text-purple-900 border-purple-100" : "text-gray-600 hover:bg-gray-50 hover:border-gray-100"
                                        )}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span className={cn(
                                                "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                                                job.status === 'COMPLETED' ? "bg-green-100 text-green-600" :
                                                    job.status === 'FAILED' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                                            )}>{job.status}</span>
                                            <span className="text-[10px] text-gray-400">{new Date(job.startedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono pl-1">
                                            {new Date(job.startedAt).toLocaleTimeString()}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="col-span-8 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-full">
                        <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Extracted Results</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedJobId ? `Viewing results for Job ${selectedJobId.substring(0, 8)}` : "Select a job to view results"}
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {isLoadingResults ? (
                                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gray-300" /></div>
                            ) : !selectedJobId ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                    <CornerDownRight className="h-16 w-16 mb-4 opacity-20" />
                                    <p>Select a job from the left to view extracted content</p>
                                </div>
                            ) : results?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                                    <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
                                    <p>No valid results found in this crawl.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {results?.map(result => (
                                        <div key={result.id} className="group border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:bg-blue-50/10 transition-all">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{result.extractedTitle}</h4>
                                                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mb-3">
                                                        <span className="truncate max-w-md">{result.url}</span>
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                                            result.reviewStatus === 'CONVERTED' ? "bg-green-100 text-green-700" :
                                                                result.reviewStatus === 'REJECTED' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                                        )}>
                                                            {result.reviewStatus}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => convertMutation.mutate(result.id)}
                                                        disabled={result.reviewStatus === 'CONVERTED' || convertMutation.isPending}
                                                        className={cn(
                                                            "px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95",
                                                            result.reviewStatus === 'CONVERTED' ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                                                        )}
                                                    >
                                                        {convertMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                                                        Convert to Draft
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Config Modal - reused existing code Structure */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingSource ? 'Configure Source' : 'Deploy New Crawler'}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 text-blue-600">Extraction Engine Configuration</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 active:scale-90"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 CustomScrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Friendly Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        placeholder="e.g. Wired Technology Feed"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Base URL (Feed/List)</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        placeholder="https://example.com/rss"
                                        value={formData.baseUrl}
                                        onChange={e => setFormData({ ...formData, baseUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                        <Code className="h-3.5 w-3.5 text-blue-600" /> Extraction Template (JSON)
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Automation:</span>
                                            <button
                                                onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                                                className={cn(
                                                    "h-5 w-9 rounded-full relative transition-colors duration-300",
                                                    formData.enabled ? "bg-green-500" : "bg-gray-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 left-1 h-3 w-3 bg-white rounded-full transition-transform duration-300 shadow-sm",
                                                    formData.enabled ? "translate-x-4" : ""
                                                )}></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <textarea
                                        className="w-full px-6 py-6 bg-slate-900 text-blue-100 font-mono text-sm border-none rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 outline-none min-h-[250px] resize-none leading-relaxed shadow-lg overflow-hidden"
                                        spellCheck={false}
                                        value={formData.extractionTemplateJson}
                                        onChange={e => setFormData({ ...formData, extractionTemplateJson: e.target.value })}
                                    />
                                    <div className="absolute top-4 right-4 text-[9px] font-bold text-slate-700 bg-slate-800 px-2 py-1 rounded">CSS SHADOW SELECTORS</div>
                                    <div className="absolute bottom-6 right-8 text-[10px] font-bold text-blue-500/40 pointer-events-none tracking-widest italic group-hover:text-blue-500/60 transition-colors">CONFIG_ENCRYPTED_ON_SAVE</div>
                                </div>
                                <p className="text-[10px] text-gray-400 italic px-4">
                                    Define the DOM selectors to extract structured content. Ensure valid JSON format.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-6 flex-shrink-0">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 rounded-3xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!formData.name || !formData.baseUrl || saveMutation.isPending}
                                    className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-3xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingSource ? 'Update Deployment' : 'Launch Crawler'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
