import { useState } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { BadgeCheck, Clock, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hemeraApi } from '../api/client';
import { useNavigate } from 'react-router-dom';

export function Workflow() {
    const [tab, setTab] = useState<'PENDING_EDITORIAL' | 'PENDING_PUBLISHING'>('PENDING_EDITORIAL');
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: articles, isLoading } = useQuery({
        queryKey: ['workflow', tab],
        queryFn: async () => {
            const response = await hemeraApi.get('/articles', {
                params: {
                    status: tab,
                    size: 50
                }
            });
            return response.data;
        }
    });

    const workflowMutation = useMutation({
        mutationFn: async ({ id, action }: { id: string, action: string }) => {
            return hemeraApi.post(`/articles/${id}/${action}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow'] });
            queryClient.invalidateQueries({ queryKey: ['articles'] });
        }
    });

    const handleAction = (id: string, action: 'submit-editorial' | 'publish' | 'reject') => {
        workflowMutation.mutate({ id, action });
    };

    return (
        <PageShell title="Workflow Queue" description="Review content items awaiting approval">
            <div className="flex border-b border-gray-200 mb-6 w-full">
                <button
                    onClick={() => setTab('PENDING_EDITORIAL')}
                    className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-all", tab === 'PENDING_EDITORIAL' ? "border-blue-500 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
                >
                    Pending Editorial
                    {tab === 'PENDING_EDITORIAL' && articles && (
                        <span className="ml-2 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">{articles.length}</span>
                    )}
                </button>
                <button
                    onClick={() => setTab('PENDING_PUBLISHING')}
                    className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-all", tab === 'PENDING_PUBLISHING' ? "border-blue-500 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
                >
                    Pending Publishing
                    {tab === 'PENDING_PUBLISHING' && articles && (
                        <span className="ml-2 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">{articles.length}</span>
                    )}
                </button>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="h-10 w-10 animate-spin mb-4" />
                        <p>Loading workflow queue...</p>
                    </div>
                ) : (
                    <>
                        {articles?.map((article: any) => (
                            <div key={article.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-yellow-100 text-yellow-600 rounded-lg flex-shrink-0">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-900 font-semibold text-lg group-hover:text-blue-600 transition-colors uppercase cursor-pointer" onClick={() => navigate(`/articles/edit/${article.id}`)}>{article.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">Submitted by <span className="font-medium text-gray-900">{article.createdByEmail}</span> • {new Date(article.createdAt).toLocaleDateString()} • <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{article.status.replace('_', ' ')}</span></p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-end md:self-auto">
                                    {tab === 'PENDING_EDITORIAL' && (
                                        <>
                                            <button
                                                onClick={() => handleAction(article.id, 'publish')}
                                                className="flex items-center pl-3 pr-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors border border-green-200 shadow-sm disabled:opacity-50"
                                                disabled={workflowMutation.isPending}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(article.id, 'reject')}
                                                className="flex items-center pl-3 pr-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200 shadow-sm disabled:opacity-50"
                                                disabled={workflowMutation.isPending}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" /> Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => navigate(`/articles/edit/${article.id}`)}
                                        className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm group/btn"
                                    >
                                        Review <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {articles?.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                                <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                                    <BadgeCheck className="h-full w-full" />
                                </div>
                                <p className="text-gray-500 font-medium">All caught up! No tasks pending.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PageShell>
    );
}
