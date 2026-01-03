import { useState, useEffect } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { FileText, MoreHorizontal, Clock, Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useQuery } from '@tanstack/react-query';
import { hemeraApi } from '../../api/client';

const statusColors: Record<string, string> = {
    PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
    PENDING_EDITORIAL: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    SCHEDULED: 'bg-purple-100 text-purple-700 border-purple-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    PENDING_PUBLISHING: 'bg-blue-100 text-blue-700 border-blue-200',
    ARCHIVED: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function ArticleList() {
    const [view, setView] = useState<'table' | 'cards'>('table');
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(0); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: articles, isLoading, error } = useQuery({
        queryKey: ['articles', page, debouncedSearch],
        queryFn: async () => {
            const response = await hemeraApi.get('/articles', {
                params: {
                    page,
                    size: 10,
                    search: debouncedSearch
                }
            });
            return response.data;
        }
    });

    if (error) {
        return (
            <PageShell title="Articles" description="Manage your content library">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
                    Error loading articles. Please check your connection or try logging in again.
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell
            title="Articles"
            description="Manage your content library"
            actions={
                <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => setView('table')}
                        className={cn("px-3 py-1.5 text-sm rounded-md font-medium transition-all", view === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900')}
                    >Table</button>
                    <button
                        onClick={() => setView('cards')}
                        className={cn("px-3 py-1.5 text-sm rounded-md font-medium transition-all", view === 'cards' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900')}
                    >Cards</button>
                </div>
            }
        >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                <div className="p-4 border-b border-gray-200 flex gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                            <Loader2 className="h-10 w-10 animate-spin mb-4" />
                            <p>Loading your articles...</p>
                        </div>
                    ) : (
                        <>
                            {view === 'table' ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Article</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {articles?.map((article: any) => (
                                            <tr key={article.id} onClick={() => navigate(`/articles/edit/${article.id}`)} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{article.title}</div>
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">{article.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn("px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border", statusColors[article.status] || 'bg-gray-100')}>
                                                        {article.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.createdByEmail}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(article.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {articles?.map((article: any) => (
                                        <div key={article.id} onClick={() => navigate(`/articles/edit/${article.id}`)} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all group cursor-pointer relative bg-white hover:-translate-y-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={cn("px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border", statusColors[article.status] || 'bg-gray-100')}>
                                                    {article.status.replace('_', ' ')}
                                                </span>
                                                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="h-5 w-5" /></button>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{article.title}</h3>
                                            <p className="text-sm text-gray-500 mb-4">{article.createdByEmail}</p>
                                            <div className="text-xs text-gray-400 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" /> {new Date(article.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {articles?.length === 0 && (
                                <div className="p-20 text-center text-gray-500">
                                    No articles found. Start by creating a new one!
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing page <span className="font-medium text-gray-900">{page + 1}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || isLoading}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={!articles || articles.length < 10 || isLoading}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
