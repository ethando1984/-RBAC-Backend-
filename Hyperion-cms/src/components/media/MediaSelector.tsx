import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hemeraApi } from '../../api/client';
import { Loader2, Search, X, Image, Film, Upload } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MediaSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (media: any) => void;
    type?: 'image' | 'video' | 'all';
}

export function MediaSelector({ isOpen, onClose, onSelect, type = 'all' }: MediaSelectorProps) {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'image' | 'video'>(type === 'video' ? 'video' : 'image');
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
            // Optionally auto-select the uploaded file if needed, but for now just refresh list
        }
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadMutation.mutate(file);
        }
    };

    if (!isOpen) return null;

    const isImage = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
    };

    const isVideo = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        return ['mp4', 'webm', 'ogg', 'mov'].includes(ext || '');
    };

    const filteredMedia = media?.filter((item: any) => {
        const matchesType = activeTab === 'image' ? isImage(item.filename) : isVideo(item.filename);
        const matchesSearch = item.filename.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    }) || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Select Media</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex gap-4 items-center bg-white sticky top-0 z-10">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('image')}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === 'image' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <Image className="h-4 w-4" /> Images
                        </button>
                        <button
                            onClick={() => setActiveTab('video')}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === 'video' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <Film className="h-4 w-4" /> Videos
                        </button>
                    </div>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div>
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept={activeTab === 'image' ? "image/*" : "video/*"}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadMutation.isPending}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                            Upload
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="h-10 w-10 animate-spin mb-4" />
                            <p>Loading library...</p>
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Image className="h-12 w-12 mb-4 opacity-20" />
                            <p>No media found</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-2 text-blue-600 hover:underline text-sm font-medium"
                            >
                                Upload new asset
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredMedia.map((file: any) => (
                                <div
                                    key={file.id}
                                    onClick={() => onSelect(file)}
                                    className="group cursor-pointer relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-500 hover:shadow-md transition-all aspect-square"
                                >
                                    {activeTab === 'image' ? (
                                        <img
                                            src={`http://localhost:8081${file.url}`}
                                            alt={file.filename}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                            <Film className="h-8 w-8 text-white/50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs font-medium truncate">{file.filename}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
