import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../components/layout/PageShell';
import { BookOpen, Calendar, Plus, Loader2, AlertCircle, Edit2, Trash2, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storylineApi, type Storyline } from '../../api/storylines';
import { cn } from '../../utils/cn';
import { StorylinePreviewModal } from '../../components/storylines/StorylinePreviewModal';

export function Storylines() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [previewStory, setPreviewStory] = useState<Storyline | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 9;

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['storylines', page],
        queryFn: () => storylineApi.list({ page, size: pageSize }),
        placeholderData: (previousData) => previousData,
    });

    const storylines = response?.items || [];
    const total = response?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    const deleteMutation = useMutation({
        mutationFn: storylineApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['storylines'] });
        }
    });

    const handleEdit = (story: Storyline) => {
        navigate(`/taxonomy/storylines/${story.id}`);
    };

    const handleCreate = () => {
        navigate(`/taxonomy/storylines/new`);
    };

    const handlePreview = async (id: string) => {
        const fullStory = await storylineApi.get(id);
        setPreviewStory(fullStory);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this storyline? This will not delete the articles.')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <PageShell
            title="Storylines"
            description="Group articles into serialized content"
            actions={
                <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4 mr-2" /> New Storyline
                </button>
            }
        >
            {isLoading && !response ? (
                <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                    <Loader2 className="h-10 w-10 animate-spin mb-4" />
                    <p>Loading storylines...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl flex items-center">
                    <AlertCircle className="h-6 w-6 mr-3" />
                    <div>
                        <p className="font-semibold">Error loading storylines</p>
                        <p className="text-sm opacity-90">Please check your permissions or try again later.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {storylines.map(story => (
                            <div key={story.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handlePreview(story.id!)}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Quick Preview"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(story)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(story.id!)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{story.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{story.description || 'No description provided.'}</p>

                                <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-gray-100">
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                        story.status === 'ONGOING'
                                            ? "bg-green-100 text-green-700 border-green-200"
                                            : "bg-gray-100 text-gray-600 border-gray-200"
                                    )}>
                                        {story.status}
                                    </span>
                                    <span className="text-gray-500 font-medium">{story.articleCount || 0} articles</span>
                                </div>
                                {story.updatedAt && (
                                    <div className="text-[10px] text-gray-400 mt-3 flex items-center uppercase tracking-wider font-semibold">
                                        <Calendar className="h-3 w-3 mr-1" /> Updated {new Date(story.updatedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}

                        {storylines.length === 0 && (
                            <div className="col-span-full py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                                <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-lg font-medium">No storylines yet</p>
                                <p className="text-sm">Create your first storyline to group related content.</p>
                                <button
                                    onClick={handleCreate}
                                    className="mt-4 px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    + New Storyline
                                </button>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, total)}</span> of <span className="font-medium">{total}</span> storylines
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={cn(
                                                "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                                                page === i + 1
                                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                                    : "text-gray-600 hover:bg-gray-100"
                                            )}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {previewStory && (
                <StorylinePreviewModal
                    isOpen={!!previewStory}
                    onClose={() => setPreviewStory(null)}
                    storyline={previewStory}
                    blocks={JSON.parse(previewStory.contentsJson || '[]')}
                />
            )}
        </PageShell>
    );
}
