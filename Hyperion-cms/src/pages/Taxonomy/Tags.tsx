import { useState } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { Tag as TagIcon, Plus, Loader2, Search, Edit2, Trash2, X, Hash, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagApi, type Tag } from '../../api/tags';

export function Tags() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

    const { data: tags, isLoading } = useQuery({
        queryKey: ['tags'],
        queryFn: tagApi.list
    });

    const saveMutation = useMutation({
        mutationFn: (data: Partial<Tag>) => {
            if (editingTag) return tagApi.update(editingTag.id, data);
            return tagApi.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            setIsModalOpen(false);
            setEditingTag(null);
            setFormData({ name: '', slug: '', description: '' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: tagApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        }
    });

    const handleEdit = (tag: Tag) => {
        setEditingTag(tag);
        setFormData({ name: tag.name, slug: tag.slug, description: tag.description || '' });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this tag? Articles using it will not be deleted.')) {
            deleteMutation.mutate(id);
        }
    };

    const filteredTags = tags?.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <PageShell
            title="Tags & Keywords"
            description="Manage indexing terms and SEO keywords"
            actions={
                <button
                    onClick={() => {
                        setEditingTag(null);
                        setFormData({ name: '', slug: '', description: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4 mr-2" /> New Tag
                </button>
            }
        >
            <div className="space-y-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tags..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="h-10 w-10 animate-spin mb-4" />
                        <p>Loading tags dictionary...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredTags.map(tag => (
                            <div
                                key={tag.id}
                                className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <Hash className="h-5 w-5" />
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(tag)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tag.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">{tag.name}</h4>
                                    <p className="text-[10px] font-mono text-gray-400 mb-2 truncate">/{tag.slug}</p>
                                    {tag.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{tag.description}</p>
                                    )}
                                </div>

                                {tag.createdAt && (
                                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                        <Calendar className="h-3 w-3 mr-1" /> {new Date(tag.createdAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredTags.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
                                <TagIcon className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                <p className="text-lg font-medium">No tags found</p>
                                <p className="text-sm">Try a different search or create a new tag.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tag Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">{editingTag ? 'Edit Tag' : 'Create New Tag'}</h3>
                                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase mt-1">Classification Metadata</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tag Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. Breaking News"
                                        value={formData.name}
                                        onChange={e => {
                                            const name = e.target.value;
                                            const slug = name.toLowerCase().replaceAll(/[^a-z0-9]/g, '-');
                                            setFormData({ ...formData, name, slug });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Url Slug</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-mono focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        placeholder="breaking-news"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description (Optional)</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none leading-relaxed"
                                        rows={3}
                                        placeholder="What kind of content belongs here?"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => saveMutation.mutate(formData)}
                                    disabled={!formData.name || saveMutation.isPending}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-100"
                                >
                                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (editingTag ? 'Save Changes' : 'Create Tag')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
