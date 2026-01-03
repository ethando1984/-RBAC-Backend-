import { useState, useEffect } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storylineApi, type Storyline } from '../../api/storylines';
import { hemeraApi } from '../../api/client';
import { Loader2, ArrowLeft, Save, Trash2, Image as ImageIcon, Layout, Type, Link, Video, FileText, Search, X, ArrowUp, ArrowDown, Eye, Quote } from 'lucide-react';
import { MediaSelector } from '../../components/media/MediaSelector';
import { StorylinePreviewModal } from '../../components/storylines/StorylinePreviewModal';

export function StorylineEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isNew = id === 'new';

    // Core state
    const [storyline, setStoryline] = useState<Partial<Storyline>>({
        title: '',
        status: 'ONGOING',
        contentsJson: '[]',
        layoutJson: '{}'
    });

    // Parsed state for editor
    const [blocks, setBlocks] = useState<any[]>([]);
    const [timelineArticles, setTimelineArticles] = useState<any[]>([]);
    const [timelineSearch, setTimelineSearch] = useState('');

    // UI State
    const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [mediaSelectorType, setMediaSelectorType] = useState<'image' | 'video'>('image');

    // Article Search State (for Article blocks)
    const [articleSearch, setArticleSearch] = useState('');

    const { data: fetchedStoryline, isLoading } = useQuery({
        queryKey: ['storyline', id],
        queryFn: () => storylineApi.get(id!),
        enabled: !isNew
    });

    const { data: allArticles } = useQuery({
        queryKey: ['articles', 'selection'],
        queryFn: async () => {
            const res = await hemeraApi.get('/articles', { params: { size: 50 } });
            return res.data;
        }
    });

    useEffect(() => {
        if (fetchedStoryline) {
            setStoryline(fetchedStoryline);
            try {
                setBlocks(JSON.parse(fetchedStoryline.contentsJson || '[]'));
            } catch (e) {
                setBlocks([]);
            }
            setTimelineArticles(fetchedStoryline.articles || []);
        }
    }, [fetchedStoryline]);

    const saveMutation = useMutation({
        mutationFn: (data: Storyline) => {
            const payload = {
                ...data,
                contentsJson: JSON.stringify(blocks),
                articleIds: timelineArticles.map(a => a.id)
            };
            return isNew ? storylineApi.create(payload as Storyline) : storylineApi.update(id!, payload as Storyline);
        },
        onSuccess: (saved) => {
            queryClient.invalidateQueries({ queryKey: ['storylines'] });
            if (isNew) {
                navigate(`/taxonomy/storylines/${saved.id}`);
            } else {
                alert('Saved successfully');
            }
        }
    });

    const addBlock = (type: string) => {
        const newBlock = {
            id: crypto.randomUUID(),
            type,
            content: '',
            settings: {}
        };
        setBlocks([...blocks, newBlock]);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const removeBlock = (blockId: string) => {
        setBlocks(blocks.filter(b => b.id !== blockId));
    };

    const updateBlock = (blockId: string, updates: any) => {
        setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...updates } : b));
    };

    const openMediaSelector = (blockId: string, type: 'image' | 'video') => {
        setActiveBlockId(blockId);
        setMediaSelectorType(type);
        setMediaSelectorOpen(true);
    };

    const handleMediaSelect = (media: any) => {
        if (activeBlockId) {
            const block = blocks.find(b => b.id === activeBlockId);
            if (block) {
                updateBlock(activeBlockId, {
                    content: media.id, // Store ID as content reference
                    settings: {
                        ...block.settings,
                        url: media.url,
                        filename: media.filename,
                        mimeType: media.mimeType
                    }
                });
            }
        }
        setMediaSelectorOpen(false);
        setActiveBlockId(null);
    };

    const filteredArticles = allArticles?.filter((a: any) =>
        a.title.toLowerCase().includes(articleSearch.toLowerCase())
    ) || [];

    const filteredTimelineArticles = allArticles?.filter((a: any) =>
        a.title.toLowerCase().includes(timelineSearch.toLowerCase()) &&
        !timelineArticles.some(ta => ta.id === a.id)
    ) || [];

    const moveTimelineArticle = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === timelineArticles.length - 1) return;
        const newArticles = [...timelineArticles];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newArticles[index], newArticles[swapIndex]] = [newArticles[swapIndex], newArticles[index]];
        setTimelineArticles(newArticles);
    };

    const removeTimelineArticle = (articleId: string) => {
        setTimelineArticles(timelineArticles.filter(a => a.id !== articleId));
    };

    if (isLoading && !isNew) {
        return <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <PageShell
            title={isNew ? "New Storyline" : "Edit Storyline"}
            description="Compose rich storytelling experiences"
            actions={
                <div className="flex gap-2">
                    <button onClick={() => navigate('/taxonomy/storylines')} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </button>
                    <button
                        onClick={() => setPreviewOpen(true)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center hover:bg-gray-200 transition-colors font-medium"
                    >
                        <Eye className="h-4 w-4 mr-2" /> Preview
                    </button>
                    <button
                        onClick={() => saveMutation.mutate(storyline as Storyline)}
                        disabled={saveMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-100"
                    >
                        {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </button>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Metadata Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={storyline.title}
                                onChange={e => setStoryline({ ...storyline, title: e.target.value })}
                                className="w-full text-2xl font-bold border-none border-b-2 border-transparent focus:border-blue-500 focus:ring-0 px-0 placeholder-gray-300"
                                placeholder="Enter storyline title..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Lead</label>
                            <textarea
                                value={storyline.description}
                                onChange={e => setStoryline({ ...storyline, description: e.target.value })}
                                className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                                placeholder="Short description for SEO and lists..."
                            />
                        </div>
                    </div>

                    {/* Timeline Management Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Timeline of Events</h3>
                                <p className="text-xs text-gray-400 font-medium tracking-tight">Manage the chronological sequence of articles for the storyline archive</p>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-4 py-2 text-sm border-gray-100 bg-gray-50 rounded-lg focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    placeholder="Link article to timeline..."
                                    value={timelineSearch}
                                    onChange={e => setTimelineSearch(e.target.value)}
                                />
                                {timelineSearch && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-30 max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                        {filteredTimelineArticles.length > 0 ? filteredTimelineArticles.map((article: any) => (
                                            <button
                                                key={article.id}
                                                onClick={() => {
                                                    setTimelineArticles([...timelineArticles, article]);
                                                    setTimelineSearch('');
                                                }}
                                                className="w-full text-left px-5 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors group"
                                            >
                                                <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{article.title}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">ID: {article.id.slice(0, 8)}...</div>
                                            </button>
                                        )) : (
                                            <div className="p-4 text-center text-sm text-gray-400 font-medium">No results found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {timelineArticles.length === 0 ? (
                                <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                                    <FileText className="h-10 w-10 mb-3 opacity-20" />
                                    <p className="text-sm font-medium">No articles in the timeline yet.</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest mt-1">Search above to begin the sequence</p>
                                </div>
                            ) : (
                                <div className="relative border-l-2 border-gray-100 ml-4 pl-10 space-y-6 py-4">
                                    {timelineArticles.map((article, idx) => (
                                        <div key={article.id} className="relative group/timeline">
                                            {/* Technical Marker */}
                                            <div className="absolute -left-[51px] top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full bg-white border-[4px] border-blue-600 shadow-lg shadow-blue-100 z-10" />

                                            <div className="flex items-center gap-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 group-hover/timeline:border-blue-200 group-hover/timeline:bg-white transition-all duration-300">
                                                <div className="grow min-w-0">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 flex items-center gap-2">
                                                        <span>Chapter {idx + 1}</span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                        <span className="text-gray-400">{article.slug}</span>
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 truncate">{article.title}</h4>
                                                </div>

                                                <div className="flex gap-1 opacity-0 group-hover/timeline:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); moveTimelineArticle(idx, 'up'); }}
                                                        disabled={idx === 0}
                                                        className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-blue-600 disabled:opacity-30 transition-all border border-transparent hover:border-gray-100 shadow-sm"
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); moveTimelineArticle(idx, 'down'); }}
                                                        disabled={idx === timelineArticles.length - 1}
                                                        className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-blue-600 disabled:opacity-30 transition-all border border-transparent hover:border-gray-100 shadow-sm"
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                    </button>
                                                    <div className="w-px h-6 bg-gray-200 mx-1" />
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); removeTimelineArticle(article.id); }}
                                                        className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-red-600 transition-all border border-transparent hover:border-gray-100 shadow-sm"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Block Editor Area */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Content Blocks</h3>
                            <div className="flex gap-2">
                                <BlockButton icon={Type} label="Text" onClick={() => addBlock('text')} />
                                <BlockButton icon={ImageIcon} label="Image" onClick={() => addBlock('image')} />
                                <BlockButton icon={Video} label="Video" onClick={() => addBlock('video')} />
                                <BlockButton icon={Link} label="Embed" onClick={() => addBlock('embed')} />
                                <BlockButton icon={FileText} label="Article" onClick={() => addBlock('article')} />
                                <BlockButton icon={Quote} label="Quote" onClick={() => addBlock('quote')} />
                            </div>
                        </div>

                        <div className="space-y-4 min-h-[300px] pb-20">
                            {blocks.length === 0 && (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
                                    <Layout className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    <p>Start adding blocks to build your storyline layout</p>
                                </div>
                            )}

                            {blocks.map((block, index) => (
                                <div key={block.id} className="bg-white group relative border border-gray-200 rounded-xl p-4 shadow-sm hover:border-blue-300 transition-all">
                                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1 z-10 transition-opacity">
                                        <button
                                            onClick={() => moveBlock(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ArrowUp className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => moveBlock(index, 'down')}
                                            disabled={index === blocks.length - 1}
                                            className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ArrowDown className="h-3 w-3" />
                                        </button>
                                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                        <button onClick={() => removeBlock(block.id)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-red-600 shadow-sm"><Trash2 className="h-3 w-3" /></button>
                                    </div>

                                    <div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        {block.type === 'text' && <Type className="h-3 w-3" />}
                                        {block.type === 'image' && <ImageIcon className="h-3 w-3" />}
                                        {block.type === 'video' && <Video className="h-3 w-3" />}
                                        {block.type === 'embed' && <Link className="h-3 w-3" />}
                                        {block.type === 'article' && <FileText className="h-3 w-3" />}
                                        {block.type === 'quote' && <Quote className="h-3 w-3 text-amber-500" />}
                                        <span className={block.type === 'quote' ? 'text-amber-600' : ''}>{block.type} BLOCK</span>
                                    </div>

                                    {/* TEXT BLOCK */}
                                    {block.type === 'text' && (
                                        <textarea
                                            value={block.content}
                                            onChange={e => updateBlock(block.id, { content: e.target.value })}
                                            className="w-full border-gray-200 rounded-lg text-sm min-h-[100px] focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Write content here..."
                                        />
                                    )}

                                    {/* QUOTE BLOCK */}
                                    {block.type === 'quote' && (
                                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-amber-500 mb-1">Quote Text</label>
                                                <textarea
                                                    value={block.content}
                                                    onChange={e => updateBlock(block.id, { content: e.target.value })}
                                                    className="w-full border-amber-200 rounded-lg text-lg font-medium italic text-amber-900 focus:ring-amber-500 focus:border-amber-500 min-h-[80px]"
                                                    placeholder="Enter the wisdom or focal thought..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-amber-500 mb-1">Author / Citation</label>
                                                <input
                                                    type="text"
                                                    value={block.settings?.author || block.settings?.subtitle || ''}
                                                    onChange={e => updateBlock(block.id, { settings: { ...block.settings, author: e.target.value } })}
                                                    className="w-full border-amber-200 rounded-lg text-sm text-amber-700 focus:ring-amber-500 focus:border-amber-500"
                                                    placeholder="e.g. Satoshi Nakamoto"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* IMAGE & VIDEO BLOCK */}
                                    {(block.type === 'image' || block.type === 'video') && (
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center">
                                            {block.settings?.url ? (
                                                <div className="relative w-full">
                                                    {block.type === 'image' ? (
                                                        <img src={`http://localhost:8081${block.settings.url}`} alt="Block media" className="w-full h-48 object-cover rounded-2xl shadow-lg border border-white/20" />
                                                    ) : (
                                                        <video src={`http://localhost:8081${block.settings.url}`} controls className="w-full h-48 object-cover rounded-2xl shadow-lg border border-white/20" />
                                                    )}

                                                    <div className="mt-3 text-center">
                                                        <button
                                                            onClick={() => openMediaSelector(block.id, block.type as any)}
                                                            className="text-xs font-medium text-blue-600 hover:underline"
                                                        >
                                                            Replace Media
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {block.type === 'image' ? <ImageIcon className="h-8 w-8 text-gray-300 mb-2" /> : <Video className="h-8 w-8 text-gray-300 mb-2" />}
                                                    <p className="text-sm font-medium text-gray-500">No media selected</p>
                                                    <button
                                                        onClick={() => openMediaSelector(block.id, block.type as any)}
                                                        className="mt-3 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:text-blue-600 transition-colors"
                                                    >
                                                        Select from Library
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* EMBED BLOCK */}
                                    {block.type === 'embed' && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Paste YouTube or Embed URL here..."
                                                    className="flex-1 border-gray-200 rounded-lg text-sm"
                                                    value={block.content}
                                                    onChange={e => updateBlock(block.id, { content: e.target.value })}
                                                />
                                            </div>
                                            {block.content && (
                                                <div className="mt-3 aspect-video bg-black rounded-lg overflow-hidden relative">
                                                    <iframe
                                                        src={block.content.replace('watch?v=', 'embed/')}
                                                        className="absolute inset-0 w-full h-full"
                                                        allowFullScreen
                                                        title="Embed preview"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ARTICLE BLOCK */}
                                    {block.type === 'article' && (
                                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            {!block.content ? (
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        className="w-full pl-9 pr-4 py-2 text-sm border-gray-200 rounded-lg"
                                                        placeholder="Search article to link..."
                                                        value={articleSearch}
                                                        onChange={e => setArticleSearch(e.target.value)}
                                                    />
                                                    {articleSearch && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-[200px] overflow-y-auto">
                                                            {filteredArticles.map((article: any) => (
                                                                <button
                                                                    key={article.id}
                                                                    onClick={() => {
                                                                        updateBlock(block.id, {
                                                                            content: article.id,
                                                                            settings: {
                                                                                title: article.title,
                                                                                slug: article.slug,
                                                                                excerpt: article.excerpt
                                                                            }
                                                                        });
                                                                        setArticleSearch('');
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0"
                                                                >
                                                                    <div className="font-medium text-gray-900">{article.title}</div>
                                                                    <div className="text-xs text-gray-500 truncate">{article.excerpt || 'No excerpt'}</div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-5 bg-white p-4 rounded-2xl border border-blue-100 shadow-[0_10px_30px_-15px_rgba(59,130,246,0.3)] group relative overflow-hidden">
                                                    <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                                        <FileText className="h-7 w-7" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Featured Insight</div>
                                                        <div className="text-base font-bold text-gray-900 truncate pr-8">{block.settings?.title || 'Linked Article'}</div>
                                                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{block.settings?.excerpt || 'Reference story attached.'}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => updateBlock(block.id, { content: '', settings: {} })}
                                                        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-4">Publishing</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                                <select
                                    value={storyline.status}
                                    onChange={e => setStoryline({ ...storyline, status: e.target.value as any })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-sm p-2"
                                >
                                    <option value="ONGOING">Ongoing</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={storyline.slug || ''}
                                    disabled
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-sm p-2 text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-4">SEO Settings</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title</label>
                                <input
                                    type="text"
                                    value={storyline.seoTitle || ''}
                                    onChange={e => setStoryline({ ...storyline, seoTitle: e.target.value })}
                                    className="w-full border-gray-200 rounded-lg text-sm"
                                    placeholder="Optional override"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                                <textarea
                                    value={storyline.seoDescription || ''}
                                    onChange={e => setStoryline({ ...storyline, seoDescription: e.target.value })}
                                    className="w-full border-gray-200 rounded-lg text-sm"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MediaSelector
                isOpen={mediaSelectorOpen}
                onClose={() => setMediaSelectorOpen(false)}
                onSelect={handleMediaSelect}
                type={mediaSelectorType}
            />
            <StorylinePreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                storyline={storyline}
                blocks={blocks}
            />
        </PageShell >
    );
}

function BlockButton({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex items-center px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-blue-600 transition-colors">
            <Icon className="h-4 w-4 mr-2" /> {label}
        </button>
    );
}
