import type { Storyline } from '../../api/storylines';
import { X, FileText } from 'lucide-react';

interface StorylinePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    storyline: Partial<Storyline>;
    blocks: any[];
}

export function StorylinePreviewModal({ isOpen, onClose, storyline, blocks }: StorylinePreviewModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Storyline Preview</h2>
                        <p className="text-sm text-gray-500 font-medium">Visualizing the reader experience</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all active:scale-95"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Preview Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50/30">
                    <div className="max-w-3xl mx-auto py-16 px-6">
                        {/* Hero Section */}
                        <div className="mb-16 text-center">
                            <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                                {storyline.status || 'Draft'}
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
                                {storyline.title || 'Untitled Storyline'}
                            </h1>
                            {storyline.description && (
                                <p className="text-xl text-gray-500 leading-relaxed font-medium max-w-2xl mx-auto">
                                    {storyline.description}
                                </p>
                            )}
                        </div>

                        {/* Blocks */}
                        <div className="space-y-12 pb-20">
                            {blocks.map((block) => (
                                <div key={block.id} className="animate-in slide-in-from-bottom-4 duration-500">
                                    {block.type === 'text' && (
                                        <div className="prose prose-lg prose-slate max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                            {block.content}
                                        </div>
                                    )}

                                    {block.type === 'image' && block.settings?.url && (
                                        <figure className="space-y-4">
                                            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-gray-200">
                                                <img
                                                    src={`http://localhost:8081${block.settings.url}`}
                                                    alt="Storyline visual"
                                                    className="w-full h-auto object-cover"
                                                />
                                            </div>
                                            {block.settings.filename && (
                                                <figcaption className="text-center text-sm text-gray-400 font-medium italic">
                                                    {block.settings.filename}
                                                </figcaption>
                                            )}
                                        </figure>
                                    )}

                                    {block.type === 'video' && block.settings?.url && (
                                        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 bg-black aspect-video">
                                            <video
                                                src={`http://localhost:8081${block.settings.url}`}
                                                controls
                                                className="w-full h-full"
                                            />
                                        </div>
                                    )}

                                    {block.type === 'embed' && block.content && (
                                        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 aspect-video bg-gray-100">
                                            <iframe
                                                src={block.content.replace('watch?v=', 'embed/')}
                                                className="w-full h-full"
                                                allowFullScreen
                                                title="Preview embed"
                                            />
                                        </div>
                                    )}

                                    {block.type === 'article' && block.content && (
                                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100 flex items-start gap-6 group hover:translate-y-[-4px] transition-all duration-300">
                                            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                                <FileText className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Related Story</div>
                                                <h4 className="text-2xl font-black text-gray-900 mb-3 leading-tight tracking-tight">
                                                    {block.settings?.title || 'Linked Article'}
                                                </h4>
                                                <p className="text-gray-500 line-clamp-2 font-medium leading-relaxed">
                                                    {block.settings?.excerpt || 'Click to read more about this topic.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {blocks.length === 0 && (
                                <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
                                    <p className="text-gray-400 font-bold">No content blocks to display yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-6 border-t border-gray-100 bg-white text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">End of Storyline Preview</p>
                </div>
            </div>
        </div>
    );
}
