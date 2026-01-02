import { useState } from 'react';
import { X, Search, Image as ImageIcon, Film, Upload, Loader2, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hemeraApi } from '../../api/client';
import { cn } from '../../utils/cn';

interface MediaSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (media: any) => void;
}

export function MediaSelectorModal({ isOpen, onClose, onSelect }: MediaSelectorModalProps) {
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
    const [mediaTab, setMediaTab] = useState<'images' | 'videos'>('images');
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    const { data: media, isLoading } = useQuery({
        queryKey: ['media'],
        queryFn: async () => {
            const response = await hemeraApi.get('/media');
            return response.data;
        },
        enabled: isOpen
    });

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return hemeraApi.post('/media', formData);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
            onSelect(response.data);
            onClose();
        }
    });

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
        const matchesType = mediaTab === 'images' ? isImage(item.filename) : isVideo(item.filename);
        const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    }) || [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Select Media</h2>
                        <p className="text-xs text-gray-500 mt-1">Choose an asset from your library or upload a new one</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={cn(
                            "px-6 py-4 text-sm font-bold border-b-2 transition-all",
                            activeTab === 'library' ? "border-blue-600 text-blue-600 bg-blue-50/30" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        Media Library
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={cn(
                            "px-6 py-4 text-sm font-bold border-b-2 transition-all",
                            activeTab === 'upload' ? "border-blue-600 text-blue-600 bg-blue-50/30" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        Upload New
                    </button>
                </div>

                <div className="flex-1 min-h-0 flex flex-col">
                    {activeTab === 'library' ? (
                        <>
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                                    <button
                                        onClick={() => setMediaTab('images')}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                            mediaTab === 'images' ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        <ImageIcon className="h-3.5 w-3.5" /> Images
                                    </button>
                                    <button
                                        onClick={() => setMediaTab('videos')}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                            mediaTab === 'videos' ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        <Film className="h-3.5 w-3.5" /> Videos
                                    </button>
                                </div>

                                <div className="relative flex-1 max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search media..."
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                                {isLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <Loader2 className="h-10 w-10 animate-spin mb-4" />
                                        <p className="text-sm font-medium">Loading your assets...</p>
                                    </div>
                                ) : filteredMedia.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                        {filteredMedia.map((item: any) => (
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    onSelect(item);
                                                    onClose();
                                                }}
                                                className="group relative aspect-square rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden cursor-pointer hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10 transition-all"
                                            >
                                                {mediaTab === 'images' ? (
                                                    <img
                                                        src={`http://localhost:8081${item.url}`}
                                                        alt={item.filename}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                                        <Film className="h-10 w-10 text-white/20" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors" />
                                                <div className="absolute top-2 right-2 h-6 w-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-sm">
                                                    <Check className="h-3.5 w-3.5 text-blue-600 stroke-[3]" />
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-[10px] font-medium text-white truncate">{item.filename}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <ImageIcon className="h-8 w-8 text-gray-200" />
                                        </div>
                                        <p className="text-sm font-medium">No results found</p>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="text-xs text-blue-600 mt-2 font-bold hover:underline"
                                        >
                                            Clear search filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 p-12">
                            <label className="max-w-xl mx-auto border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 group hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer relative overflow-hidden">
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={uploadMutation.isPending}
                                />
                                <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                    {uploadMutation.isPending ? <Loader2 className="h-10 w-10 animate-spin" /> : <Upload className="h-10 w-10" />}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 glow-blue">
                                    {uploadMutation.isPending ? 'Uploading Asset...' : 'Click or Drag File'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                                    Support high-resolution images and HD videos up to 100MB.
                                </p>

                                {uploadMutation.isPending && (
                                    <div className="absolute bottom-0 left-0 h-1.5 bg-blue-600 animate-loading-bar" style={{ width: '100%' }}></div>
                                )}
                            </label>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
