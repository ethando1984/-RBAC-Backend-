import { useState } from 'react';
import { X, Search, Image as ImageIcon, Film, Upload, Loader2, Check, Info, Calendar, FileText, HardDrive, LayoutGrid, List } from 'lucide-react';
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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [displayLimit, setDisplayLimit] = useState(20);
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

    const displayedMedia = filteredMedia.slice(0, displayLimit);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={cn(
                "bg-white w-full max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-200 transition-all",
                selectedItem ? "max-w-6xl" : "max-w-4xl"
            )}>
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

                <div className="flex-1 min-h-0 flex overflow-hidden">
                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {activeTab === 'library' ? (
                            <>
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                                    <div className="flex items-center gap-4">
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
                                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                                        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm hidden sm:flex">
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

                                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 bg-gray-50/30">
                                    {isLoading ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                            <Loader2 className="h-10 w-10 animate-spin mb-4" />
                                            <p className="text-sm font-medium">Loading your assets...</p>
                                        </div>
                                    ) : displayedMedia.length > 0 ? (
                                        <>
                                            {viewMode === 'grid' ? (
                                                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                                    {displayedMedia.map((item: any) => (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                                                            className={cn(
                                                                "group relative aspect-square rounded-2xl border bg-white overflow-hidden cursor-pointer transition-all hover:scale-[1.02]",
                                                                selectedItem?.id === item.id
                                                                    ? "border-blue-500 ring-4 ring-blue-500/20 shadow-lg z-10"
                                                                    : "border-gray-100 hover:border-blue-300 hover:shadow-md"
                                                            )}
                                                        >
                                                            {mediaTab === 'images' ? (
                                                                <img
                                                                    src={`http://localhost:8081${item.url}`}
                                                                    alt={item.filename}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                                                    <Film className="h-10 w-10 text-white/20" />
                                                                </div>
                                                            )}

                                                            <div className={cn(
                                                                "absolute inset-0 transition-colors flex items-center justify-center",
                                                                selectedItem?.id === item.id ? "bg-blue-600/20" : "bg-transparent group-hover:bg-black/5"
                                                            )}>
                                                                {selectedItem?.id === item.id && (
                                                                    <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg animate-in zoom-in-50 duration-200">
                                                                        <Check className="h-5 w-5 stroke-[3]" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <p className="text-[10px] font-medium text-white truncate">{item.filename}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {displayedMedia.map((item: any) => (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                                                            className={cn(
                                                                "flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all",
                                                                selectedItem?.id === item.id
                                                                    ? "bg-blue-50 border-blue-200 shadow-sm"
                                                                    : "bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                                                            )}
                                                        >
                                                            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                                {mediaTab === 'images' ? (
                                                                    <img src={`http://localhost:8081${item.url}`} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-900"><Film className="h-5 w-5 text-white/50" /></div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={cn("text-xs font-bold truncate", selectedItem?.id === item.id ? "text-blue-700" : "text-gray-900")}>
                                                                    {item.filename}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-2">
                                                                    <span>{formatSize(item.size)}</span>
                                                                    <span>&bull;</span>
                                                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                                </p>
                                                            </div>
                                                            {selectedItem?.id === item.id && (
                                                                <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm">
                                                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {filteredMedia.length > displayLimit && (
                                                <div className="mt-8 text-center pb-4">
                                                    <button
                                                        onClick={() => setDisplayLimit(curr => curr + 20)}
                                                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-full transition-colors"
                                                    >
                                                        Load More ({filteredMedia.length - displayLimit} remaining)
                                                    </button>
                                                </div>
                                            )}
                                        </>
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
                            <div className="flex-1 p-12 overflow-y-auto">
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

                    {/* Details Pane */}
                    {selectedItem && (
                        <div className="w-80 border-l border-gray-100 bg-white flex flex-col overflow-y-auto animate-in slide-in-from-right-4 duration-300">
                            <div className="p-6 border-b border-gray-100">
                                <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden border border-gray-100 mb-4 flex items-center justify-center">
                                    {mediaTab === 'images' ? (
                                        <img src={`http://localhost:8081${selectedItem.url}`} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <Film className="h-8 w-8 text-gray-300" />
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm break-all leading-tight">{selectedItem.filename}</h3>
                            </div>

                            <div className="flex-1 p-6 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Info className="h-3 w-3" /> Info
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <HardDrive className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase">Size</p>
                                                <p className="text-xs font-medium text-gray-700">{formatSize(selectedItem.size)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase">Type</p>
                                                <p className="text-xs font-medium text-gray-700">{selectedItem.filename.split('.').pop()?.toUpperCase() || 'UNKNOWN'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase">Uploaded</p>
                                                <p className="text-xs font-medium text-gray-700">{new Date(selectedItem.createdAt).toLocaleDateString()} {new Date(selectedItem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        onSelect(selectedItem);
                                        onClose();
                                    }}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Check className="h-4 w-4 stroke-[3]" />
                                    Use Selected Asset
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {!selectedItem && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
