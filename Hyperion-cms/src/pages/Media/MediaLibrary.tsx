import { useState, useRef } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { Image, Film, Upload, Search, Play, Trash2, Loader2, RotateCcw, LayoutGrid, List, Check, Info, HardDrive, FileText, Calendar, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hemeraApi } from '../../api/client';

export function MediaLibrary() {
    const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [displayLimit, setDisplayLimit] = useState(20);
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: media, isLoading } = useQuery({
        queryKey: ['media'],
        queryFn: async () => {
            const response = await hemeraApi.get('/media');
            return response.data;
        }
    });

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return hemeraApi.post('/media', formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return hemeraApi.delete(`/media/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
            setSelectedItem(null);
        }
    });

    const replaceMutation = useMutation({
        mutationFn: async ({ id, file }: { id: string, file: File }) => {
            const formData = new FormData();
            formData.append('file', file);
            return hemeraApi.put(`/media/${id}`, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
            setSelectedItem(null);
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this asset forever?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleReplace = (id: string) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
                replaceMutation.mutate({ id, file });
            }
        };
        input.click();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadMutation.mutate(file);
        }
    };

    const isImage = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
    };

    const isVideo = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        return ['mp4', 'webm', 'ogg', 'mov'].includes(ext || '');
    };

    const filteredMedia = media?.filter((item: any) => {
        const matchesType = activeTab === 'images' ? isImage(item.filename) : isVideo(item.filename);
        const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    }) || [];

    const displayedMedia = filteredMedia.slice(0, displayLimit);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <PageShell
            title="Media Library"
            description="Manage images and video assets"
            actions={
                <div className="flex gap-3">
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadMutation.isPending}
                        className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-95"
                    >
                        {uploadMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2 stroke-[3]" />}
                        Upload Asset
                    </button>
                </div>
            }
        >
            <div className="mb-8 border-b border-gray-100 pb-1">
                <div className="flex justify-between items-end">
                    <div className="flex space-x-10">
                        <button
                            onClick={() => { setActiveTab('images'); setDisplayLimit(20); setSelectedItem(null); }}
                            className={cn(
                                "pb-4 text-sm font-bold transition-all relative",
                                activeTab === 'images' ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <Image className="h-4 w-4" /> Images
                            </span>
                            {activeTab === 'images' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full animate-in slide-in-from-bottom-1" />}
                        </button>
                        <button
                            onClick={() => { setActiveTab('videos'); setDisplayLimit(20); setSelectedItem(null); }}
                            className={cn(
                                "pb-4 text-sm font-bold transition-all relative",
                                activeTab === 'videos' ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <Film className="h-4 w-4" /> Videos
                            </span>
                            {activeTab === 'videos' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full animate-in slide-in-from-bottom-1" />}
                        </button>
                    </div>

                    <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm mb-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-1.5 rounded-lg transition-all",
                                viewMode === 'grid' ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:bg-gray-50"
                            )}
                            title="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-1.5 rounded-lg transition-all",
                                viewMode === 'list' ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:bg-gray-50"
                            )}
                            title="List View"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-8 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-sm"
                    placeholder={`Search through ${filteredMedia.length} ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex gap-6 h-[calc(100vh-320px)]">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-32 text-gray-400">
                        <div className="h-16 w-16 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                        <p className="font-bold text-gray-900">Curating your assets...</p>
                        <p className="text-xs mt-1">Connecting to Hyperion  Cloud</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                        {displayedMedia.length > 0 ? (
                            <>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                                        {displayedMedia.map((file: any) => (
                                            <div
                                                key={file.id}
                                                onClick={() => setSelectedItem(selectedItem?.id === file.id ? null : file)}
                                                className={cn(
                                                    "group relative rounded-[2rem] border bg-white p-2 transition-all duration-500 hover:-translate-y-1 cursor-pointer",
                                                    selectedItem?.id === file.id
                                                        ? "border-blue-500 ring-4 ring-blue-500/10 shadow-xl"
                                                        : "border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
                                                )}
                                            >
                                                <div className="aspect-square bg-gray-50 rounded-[1.5rem] relative overflow-hidden flex items-center justify-center">
                                                    {activeTab === 'images' ? (
                                                        <img
                                                            src={`http://localhost:8081${file.url}`}
                                                            alt={file.filename}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                                                            <Film className="h-10 w-10 text-white/10" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                                                                    <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedItem?.id === file.id && (
                                                        <div className="absolute top-2 right-2 flex items-center justify-center h-8 w-8 bg-blue-600 text-white rounded-full shadow-lg animate-in zoom-in">
                                                            <Check className="h-4 w-4 stroke-[3]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4 px-2 text-center">
                                                    <p className={cn("text-xs font-bold truncate transition-colors", selectedItem?.id === file.id ? "text-blue-600" : "text-gray-900")} title={file.filename}>
                                                        {file.filename}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                                                        {formatSize(file.size)} &bull; {file.createdAt?.split('T')[0]}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {displayedMedia.map((file: any) => (
                                            <div
                                                key={file.id}
                                                onClick={() => setSelectedItem(selectedItem?.id === file.id ? null : file)}
                                                className={cn(
                                                    "flex items-center gap-4 p-3 rounded-2xl border cursor-pointer transition-all",
                                                    selectedItem?.id === file.id
                                                        ? "bg-blue-50/50 border-blue-200 shadow-sm"
                                                        : "bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                                                )}
                                            >
                                                <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                    {activeTab === 'images' ? (
                                                        <img src={`http://localhost:8081${file.url}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-900"><Film className="h-6 w-6 text-white/50" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn("text-sm font-bold truncate", selectedItem?.id === file.id ? "text-blue-700" : "text-gray-900")}>
                                                        {file.filename}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                                        <span>{formatSize(file.size)}</span>
                                                        <span>&bull;</span>
                                                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                                    </p>
                                                </div>
                                                {selectedItem?.id === file.id && (
                                                    <div className="mr-2">
                                                        <div className="h-8 w-8 bg-blue-100/50 text-blue-600 rounded-full flex items-center justify-center">
                                                            <Check className="h-4 w-4 stroke-[3]" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {filteredMedia.length > displayLimit && (
                                    <div className="mt-12 text-center pb-8">
                                        <button
                                            onClick={() => setDisplayLimit(curr => curr + 20)}
                                            className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-full transition-colors"
                                        >
                                            Load More ({filteredMedia.length - displayLimit} remaining)
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    {activeTab === 'images' ? <Image className="h-8 w-8 text-gray-200" /> : <Film className="h-8 w-8 text-gray-200" />}
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No {activeTab} found</h3>
                                <p className="mt-1 text-sm text-gray-500">Upload new assets to get started.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Details Pane */}
                {selectedItem && (
                    <div className="w-80 border-l border-gray-100 pl-6 animate-in slide-in-from-right-10 duration-500 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900">Asset Details</h3>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 mb-6 flex items-center justify-center shadow-sm">
                            {activeTab === 'images' ? (
                                <img src={`http://localhost:8081${selectedItem.url}`} alt="" className="w-full h-full object-contain" />
                            ) : (
                                <Film className="h-10 w-10 text-gray-300" />
                            )}
                        </div>

                        <div className="flex-1 space-y-6 overflow-y-auto">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Filename</label>
                                <p className="text-sm font-bold text-gray-900 break-all leading-tight">{selectedItem.filename}</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                        <HardDrive className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">File Size</p>
                                        <p className="text-xs font-bold text-gray-700">{formatSize(selectedItem.size)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Type</p>
                                        <p className="text-xs font-bold text-gray-700">{selectedItem.filename.split('.').pop()?.toUpperCase() || 'UNKNOWN'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Uploaded</p>
                                        <p className="text-xs font-bold text-gray-700">
                                            {new Date(selectedItem.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 space-y-3">
                            <button
                                onClick={() => handleReplace(selectedItem.id)}
                                className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Replace File
                            </button>
                            <button
                                onClick={() => handleDelete(selectedItem.id)}
                                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete Asset
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PageShell>
    );
}
