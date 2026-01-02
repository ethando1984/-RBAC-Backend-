import { useState, useRef } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { Image, Film, Upload, Search, Play, Trash2, Loader2, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hemeraApi } from '../../api/client';

export function MediaLibrary() {
    const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
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

    const filteredMedia = media?.filter((item: any) =>
        activeTab === 'images' ? isImage(item.filename) : isVideo(item.filename)
    ) || [];

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
                <div className="flex space-x-10">
                    <button
                        onClick={() => setActiveTab('images')}
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
                        onClick={() => setActiveTab('videos')}
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
            </div>

            <div className="mb-8 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-sm"
                    placeholder={`Search through ${filteredMedia.length} ${activeTab}...`}
                />
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                    <div className="h-16 w-16 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                    <p className="font-bold text-gray-900">Curating your assets...</p>
                    <p className="text-xs mt-1">Connecting to Hemera Cloud</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {filteredMedia.map((file: any) => (
                        <div key={file.id} className="group relative rounded-[2rem] border border-gray-100 bg-white p-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1">
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
                                <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReplace(file.id)}
                                            className="p-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold text-xs flex items-center gap-2 shadow-lg scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 duration-300 delay-[50ms]"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(file.id)}
                                            className="p-2.5 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-all font-bold text-xs flex items-center gap-2 shadow-lg scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 duration-300 delay-[100ms]"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <button
                                        className="px-4 py-2 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-all font-bold text-[10px] uppercase tracking-wider shadow-lg scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 duration-300 delay-[150ms]"
                                    >
                                        Details
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 px-2 text-center">
                                <p className="text-xs font-bold text-gray-900 truncate" title={file.filename}>{file.filename}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{formatSize(file.size)} &bull; {file.createdAt?.split('T')[0]}</p>
                            </div>
                        </div>
                    ))}

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors min-h-[200px]"
                    >
                        <Upload className="h-8 w-8 text-gray-300 mb-2" />
                        <span className="text-sm font-medium text-gray-600">Upload New</span>
                        <span className="text-xs text-gray-400 mt-1">Drag & drop or click</span>
                    </div>
                </div>
            )}

            {!isLoading && filteredMedia.length === 0 && (
                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="mx-auto h-12 w-12 text-gray-300 mb-4 flex items-center justify-center">
                        {activeTab === 'images' ? <Image className="h-full w-full" /> : <Film className="h-full w-full" />}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No {activeTab} yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by uploading your first {activeTab.slice(0, -1)}.</p>
                </div>
            )}
        </PageShell>
    );
}
