import { useState, useEffect } from 'react';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import { Save, Send, ChevronLeft, Image as ImageIcon, Settings, Loader2, CheckCircle2, Rocket, RotateCcw, FolderTree, Star, CheckSquare, Square, ChevronDown, ChevronRight, Globe, ImagePlus, Users, Tag as TagIcon, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hemeraApi, iamApi } from '../../api/client';
import { cn } from '../../utils/cn';
import { MediaSelectorModal } from '../../components/modals/MediaSelectorModal';

export function ArticleEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEditMode = !!id;

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [status, setStatus] = useState('DRAFT');
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [sourceName, setSourceName] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [canonicalUrl, setCanonicalUrl] = useState('');
    const [robots, setRobots] = useState('index, follow');
    const [coverMediaId, setCoverMediaId] = useState('');
    const [coverMediaUrl, setCoverMediaUrl] = useState('');
    const [visibility, setVisibility] = useState('PUBLIC');
    const [scheduledAt, setScheduledAt] = useState('');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [primaryCategoryId, setPrimaryCategoryId] = useState<string>('');
    const [tagNames, setTagNames] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [authorUserId, setAuthorUserId] = useState('');
    const [authorRoleId, setAuthorRoleId] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'history'>('content');
    const [selectedVersion, setSelectedVersion] = useState<any>(null);
    const [rejectionNote, setRejectionNote] = useState('');
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    const { data: article, isLoading } = useQuery({
        queryKey: ['article', id],
        queryFn: async () => {
            const response = await hemeraApi.get(`/articles/${id}`);
            return response.data;
        },
        enabled: isEditMode,
    });

    const { data: mediaItems } = useQuery({
        queryKey: ['media'],
        queryFn: async () => {
            const response = await hemeraApi.get('/media');
            return response.data;
        }
    });

    useEffect(() => {
        if (coverMediaId && mediaItems) {
            const media = mediaItems.find((m: any) => m.id === coverMediaId || m.url.includes(coverMediaId));
            if (media) {
                setCoverMediaUrl(media.url);
            } else {
                // If ID is actually a URL fragment (as returned by our mock controller)
                if (coverMediaId.startsWith('/uploads/')) {
                    setCoverMediaUrl(coverMediaId);
                }
            }
        } else {
            setCoverMediaUrl('');
        }
    }, [coverMediaId, mediaItems]);

    const { data: categoriesTree } = useQuery({
        queryKey: ['categories', 'tree'],
        queryFn: async () => {
            const response = await hemeraApi.get('/categories');
            return response.data;
        }
    });

    const { data: users } = useQuery({
        queryKey: ['iam-users'],
        queryFn: async () => {
            const response = await iamApi.get('/users');
            return Array.isArray(response.data) ? response.data : (response.data.content || []);
        }
    });

    const { data: roles } = useQuery({
        queryKey: ['iam-roles'],
        queryFn: async () => {
            const response = await iamApi.get('/roles');
            return Array.isArray(response.data) ? response.data : (response.data.content || []);
        }
    });

    const { data: flatCategories } = useQuery({
        queryKey: ['categories', 'flat'],
        queryFn: async () => {
            const response = await hemeraApi.get('/categories', { params: { flat: true } });
            return response.data;
        }
    });

    const { data: versions } = useQuery({
        queryKey: ['article-versions', id],
        queryFn: async () => {
            const response = await hemeraApi.get(`/articles/${id}/versions`);
            return response.data;
        },
        enabled: isEditMode,
    });

    useEffect(() => {
        if (article) {
            setTitle(article.title || '');
            setSubtitle(article.subtitle || '');
            setContent(article.contentHtml || '');
            setExcerpt(article.excerpt || '');
            setStatus(article.status || 'DRAFT');
            setSeoTitle(article.seoTitle || '');
            setSeoDescription(article.seoDescription || '');
            setSourceName(article.sourceName || '');
            setSourceUrl(article.sourceUrl || '');
            setCanonicalUrl(article.canonicalUrl || '');
            setRobots(article.robots || 'index, follow');
            setCoverMediaId(article.coverMediaId || '');
            setVisibility(article.visibility || 'PUBLIC');
            setScheduledAt(article.scheduledAt ? article.scheduledAt.substring(0, 16) : '');
            setSelectedCategoryIds(article.categoryIds || []);
            setPrimaryCategoryId(article.primaryCategoryId || '');
            setTagNames(article.tagNames || []);
            setAuthorUserId(article.authorUserId || '');
            setAuthorRoleId(article.authorRoleId || '');
        }
    }, [article]);

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (isEditMode) {
                return hemeraApi.put(`/articles/${id}`, data);
            } else {
                return hemeraApi.post('/articles', data);
            }
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            if (isEditMode) {
                queryClient.invalidateQueries({ queryKey: ['article', id] });
            }
            if (!isEditMode) {
                navigate(`/articles/edit/${response.data.id}`, { replace: true });
            }
        }
    });

    const workflowMutation = useMutation({
        mutationFn: async ({ action, params }: { action: string, params?: any }) => {
            return hemeraApi.post(`/articles/${id}/${action}`, null, { params });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['article', id] });
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            queryClient.invalidateQueries({ queryKey: ['article-versions', id] });
            setIsRejectModalOpen(false);
            setIsScheduleModalOpen(false);
        }
    });

    const restoreMutation = useMutation({
        mutationFn: async (versionId: string) => {
            return hemeraApi.post(`/articles/versions/${versionId}/restore`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['article', id] });
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            queryClient.invalidateQueries({ queryKey: ['article-versions', id] });
            setActiveTab('content');
        }
    });

    const handleSave = () => {
        saveMutation.mutate({
            title,
            subtitle,
            contentHtml: content,
            excerpt,
            seoTitle,
            seoDescription,
            sourceName,
            sourceUrl,
            canonicalUrl,
            robots,
            coverMediaId: coverMediaId || null,
            visibility,
            scheduledAt: scheduledAt || null,
            status,
            categoryIds: selectedCategoryIds,
            primaryCategoryId: primaryCategoryId || (selectedCategoryIds.length > 0 ? selectedCategoryIds[0] : null),
            tagNames,
            authorUserId: authorUserId || null,
            authorRoleId: authorRoleId || null,
        });
    };

    const toggleCategory = (catId: string) => {
        if (selectedCategoryIds.includes(catId)) {
            setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== catId));
            if (primaryCategoryId === catId) {
                setPrimaryCategoryId('');
            }
        } else {
            setSelectedCategoryIds([...selectedCategoryIds, catId]);
            if (!primaryCategoryId) {
                setPrimaryCategoryId(catId);
            }
        }
    };

    const addTag = () => {
        const tag = newTag.trim();
        if (tag && !tagNames.includes(tag)) {
            setTagNames([...tagNames, tag]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTagNames(tagNames.filter(t => t !== tagToRemove));
    };

    const toggleExpand = (catId: string) => {
        if (expandedCategories.includes(catId)) {
            setExpandedCategories(expandedCategories.filter(id => id !== catId));
        } else {
            setExpandedCategories([...expandedCategories, catId]);
        }
    };

    const renderCategoryNode = (cat: any, depth = 0) => {
        const isSelected = selectedCategoryIds.includes(cat.id);
        const isPrimary = primaryCategoryId === cat.id;
        const hasChildren = cat.children && cat.children.length > 0;
        const isExpanded = expandedCategories.includes(cat.id);

        return (
            <div key={cat.id} className="space-y-1">
                <div
                    className={cn(
                        "flex items-center gap-2 py-1 px-2 rounded-lg transition-colors group",
                        isSelected ? "bg-blue-50/50" : "hover:bg-gray-50"
                    )}
                >
                    <div className="flex items-center gap-1 min-w-[20px]">
                        {hasChildren ? (
                            <button
                                onClick={() => toggleExpand(cat.id)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            </button>
                        ) : <div className="w-3" />}
                    </div>

                    <button
                        onClick={() => toggleCategory(cat.id)}
                        className={cn(
                            "flex-1 flex items-center gap-2 text-xs font-medium text-left",
                            isSelected ? "text-blue-700" : "text-gray-600"
                        )}
                    >
                        {isSelected ? <CheckSquare className="h-3.5 w-3.5 text-blue-500" /> : <Square className="h-3.5 w-3.5 text-gray-300" />}
                        <span className="truncate">{cat.name}</span>
                    </button>

                    {isSelected && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setPrimaryCategoryId(cat.id);
                            }}
                            className={cn(
                                "p-1 rounded-md transition-all",
                                isPrimary ? "text-amber-500 bg-amber-50" : "text-gray-300 hover:text-amber-400 hover:bg-amber-50 opacity-0 group-hover:opacity-100"
                            )}
                            title={isPrimary ? "Primary Category" : "Set as Primary"}
                        >
                            <Star className={cn("h-3 w-3", isPrimary && "fill-current")} />
                        </button>
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="ml-4 pl-2 border-l border-gray-100">
                        {cat.children.map((child: any) => renderCategoryNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const primaryCategory = flatCategories?.find((c: any) => c.id === primaryCategoryId);

    if (isEditMode && isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link to="/articles" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{status.replace('_', ' ')}</p>
                        <h1 className="text-sm font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">{title || 'Untitled Article'}</h1>
                    </div>
                </div>

                <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('content')}
                        className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", activeTab === 'content' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900")}
                    >Content</button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", activeTab === 'settings' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900")}
                    >SEO & Tools</button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", activeTab === 'history' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900")}
                    >History</button>
                </div>

                <div className="flex items-center gap-3">
                    {(saveMutation.isSuccess || workflowMutation.isSuccess || restoreMutation.isSuccess) && (
                        <span className="text-xs text-green-600 flex items-center mr-2 animate-fade-in">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Success
                        </span>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saveMutation.isPending || workflowMutation.isPending}
                        className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                    >
                        {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {isEditMode ? 'Save' : 'Draft'}
                    </button>

                    {isEditMode && (
                        <div className="flex gap-2">
                            {status === 'DRAFT' && (
                                <button
                                    onClick={() => workflowMutation.mutate({ action: 'submit-publishing' })}
                                    disabled={workflowMutation.isPending}
                                    className="flex items-center px-5 py-2 text-white bg-blue-600 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95 disabled:opacity-50"
                                >
                                    {workflowMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                    Submit
                                </button>
                            )}

                            {status === 'PENDING_PUBLISHING' && (
                                <>
                                    <button
                                        onClick={() => setIsRejectModalOpen(true)}
                                        className="flex items-center px-4 py-2 text-red-600 bg-red-50 border border-red-100 rounded-lg text-sm font-bold hover:bg-red-100 transition-all active:scale-95"
                                    >Reject</button>
                                    <button
                                        onClick={() => setIsScheduleModalOpen(true)}
                                        className="flex items-center px-4 py-2 text-purple-600 bg-purple-50 border border-purple-100 rounded-lg text-sm font-bold hover:bg-purple-100 transition-all active:scale-95"
                                    >Schedule</button>
                                    <button
                                        onClick={() => workflowMutation.mutate({ action: 'publish-now' })}
                                        className="flex items-center px-5 py-2 text-white bg-green-600 rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                                    >Publish Now</button>
                                </>
                            )}

                            {status === 'PUBLISHED' && (
                                <button
                                    onClick={() => workflowMutation.mutate({ action: 'archive' })}
                                    className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all active:scale-95"
                                >Archive</button>
                            )}

                            {status === 'ARCHIVED' && (
                                <button
                                    onClick={() => workflowMutation.mutate({ action: 'submit-publishing' })}
                                    className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 border border-blue-100 rounded-lg text-sm font-bold hover:bg-blue-100 transition-all active:scale-95"
                                >Restore to Draft</button>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 mt-16 flex relative overflow-hidden">
                {activeTab === 'content' && (
                    <>
                        <main className="flex-1 overflow-y-auto w-full scroll-smooth">
                            <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8">
                                <div className="space-y-4">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Article Title"
                                        className="w-full text-4xl sm:text-5xl font-extrabold bg-transparent border-none placeholder-gray-200 focus:ring-0 px-0 text-gray-900 tracking-tight outline-none"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />

                                    <input
                                        type="text"
                                        placeholder="Subtitle (optional)"
                                        className="w-full text-xl sm:text-2xl text-gray-400 bg-transparent border-none placeholder-gray-200 focus:ring-0 px-0 font-light outline-none"
                                        value={subtitle}
                                        onChange={(e) => setSubtitle(e.target.value)}
                                    />

                                    <div className="flex items-center gap-2 group/slug bg-gray-50/50 w-fit px-2 py-1 rounded border border-transparent hover:border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Slug:</span>
                                        <span className="text-[10px] text-blue-400 font-mono truncate max-w-xs">{article?.slug || 'pending-save'}</span>
                                    </div>

                                    <textarea
                                        placeholder="Write a brief excerpt (for listings)..."
                                        className="w-full text-base text-gray-500 bg-transparent border-none placeholder-gray-200 focus:ring-0 px-0 resize-none h-20 leading-relaxed"
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-4 py-4 border-y border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary:</span>
                                        {primaryCategory ? (
                                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                                <Star className="h-3 w-3 fill-current" />
                                                <span className="text-xs font-bold">{primaryCategory.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">None selected</span>
                                        )}
                                    </div>
                                    <div className="h-4 w-px bg-gray-200 mx-2"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Author:</span>
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-full pl-1 pr-3 py-1 border border-gray-100">
                                            <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold shadow-sm">
                                                {(users?.find((u: any) => u.userId === authorUserId)?.username || article?.createdByEmail || 'C').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-medium text-gray-700">
                                                {users?.find((u: any) => u.userId === authorUserId)?.username
                                                    ? users.find((u: any) => u.userId === authorUserId).username
                                                    : (article?.createdByEmail || 'Current User')}
                                            </span>
                                            {roles?.find((r: any) => r.roleId === authorRoleId) && (
                                                <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded leading-none border border-blue-100 uppercase ml-1">
                                                    {roles.find((r: any) => r.roleId === authorRoleId).roleKey}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="min-h-[600px] pb-20">
                                    <RichTextEditor content={content} onChange={setContent} />
                                </div>
                            </div>
                        </main>

                        <aside className="w-80 bg-white border-l border-gray-200 hidden xl:flex flex-col h-full sticky top-0 overflow-y-auto">
                            <div className="p-5 space-y-8 pb-24">
                                {/* Taxonomy Section - Tree View */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <FolderTree className="h-3 w-3" /> Taxonomy
                                        </h3>
                                        <Link to="/categories" className="text-[10px] text-blue-600 hover:underline font-bold">Manage</Link>
                                    </div>
                                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-3 max-h-[400px] overflow-y-auto scrollbar-thin">
                                        {categoriesTree && categoriesTree.length > 0 ? (
                                            <div className="space-y-1">
                                                {categoriesTree.map((cat: any) => renderCategoryNode(cat))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <Loader2 className="h-4 w-4 animate-spin mx-auto text-gray-300 mb-2" />
                                                <p className="text-[10px] text-gray-400">Loading categories...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tags Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <TagIcon className="h-3 w-3" /> Tags & Keywords
                                        </h3>
                                    </div>
                                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 space-y-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add tag..."
                                                className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            />
                                            <button
                                                onClick={addTag}
                                                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {tagNames.map(tag => (
                                                <div
                                                    key={tag}
                                                    className="flex items-center gap-1.5 bg-white border border-gray-200 pl-2.5 pr-1.5 py-1 rounded-lg text-[10px] font-bold text-gray-600 shadow-sm transition-all hover:border-blue-200 group/tag"
                                                >
                                                    {tag}
                                                    <button
                                                        onClick={() => removeTag(tag)}
                                                        className="p-0.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        <X className="h-2.5 w-2.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <ImageIcon className="h-3 w-3" /> Cover Media
                                    </h3>
                                    <div className="space-y-4">
                                        {coverMediaUrl ? (
                                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm group/image">
                                                <img
                                                    src={`http://localhost:8081${coverMediaUrl}`}
                                                    alt="Cover"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={() => setCoverMediaId('')}
                                                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity"
                                                ><X className="h-3 w-3" /></button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsMediaModalOpen(true)}
                                                className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/30 hover:border-blue-300 h-32 transition-all"
                                            >
                                                <ImagePlus className="h-6 w-6 text-blue-500 mb-2" />
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add Cover</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </>
                )}

                {activeTab === 'settings' && (
                    <main className="flex-1 overflow-y-auto p-12 bg-white">
                        <div className="max-w-3xl mx-auto space-y-12">
                            <section>
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-blue-600" /> SEO Optimization
                                </h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SEO Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            value={seoTitle}
                                            onChange={(e) => setSeoTitle(e.target.value)}
                                            placeholder="Leave empty to use article title"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meta Description</label>
                                        <textarea
                                            rows={3}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                            value={seoDescription}
                                            onChange={(e) => setSeoDescription(e.target.value)}
                                            placeholder="Write a compelling search snippet..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Canonical URL</label>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                                                value={canonicalUrl}
                                                onChange={(e) => setCanonicalUrl(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Robots</label>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                                                value={robots}
                                                onChange={(e) => setRobots(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-gray-600" /> Advanced Options
                                </h2>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scheduled Publishing</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                                                value={scheduledAt}
                                                onChange={(e) => setScheduledAt(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visibility</label>
                                            <select
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                                                value={visibility}
                                                onChange={(e) => setVisibility(e.target.value)}
                                            >
                                                <option value="PUBLIC">Public (Default)</option>
                                                <option value="PRIVATE">Private</option>
                                                <option value="PASSWORD">Password Protected</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source Name</label>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                                                value={sourceName}
                                                onChange={(e) => setSourceName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source URL</label>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                                                value={sourceUrl}
                                                onChange={(e) => setSourceUrl(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>
                )}

                {activeTab === 'history' && (
                    <main className="flex-1 overflow-y-auto p-12 bg-white">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
                                <RotateCcw className="h-5 w-5 text-amber-600" /> Version History
                            </h2>
                            <div className="space-y-4">
                                {versions?.map((v: any) => (
                                    <div key={v.id} className="group border border-gray-100 rounded-2xl p-6 hover:border-amber-200 hover:bg-amber-50/20 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="h-10 w-10 rounded-xl bg-gray-50 group-hover:bg-amber-100/50 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:text-amber-600 shadow-sm border border-gray-100 group-hover:border-amber-100">
                                                v{v.versionNumber}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-bold text-gray-900">{v.diffSummary || "General update"}</span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase">{v.statusAtThatTime}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                                    <span>{new Date(v.editedAt).toLocaleString()}</span>
                                                    <div className="h-1 w-1 bg-gray-200 rounded-full"></div>
                                                    <span>{v.editedByEmail}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setSelectedVersion(v)}
                                                className="px-4 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
                                            >View</button>
                                            <button
                                                onClick={() => restoreMutation.mutate(v.id)}
                                                disabled={restoreMutation.isPending}
                                                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all active:scale-95"
                                            >
                                                {restoreMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Restore"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!versions || versions.length === 0) && (
                                    <div className="text-center py-20 text-gray-400">
                                        <RotateCcw className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                        <p>No history found for this article.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                )}
            </div>

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Reject with Note</h3>
                        <p className="text-sm text-gray-500 mb-6">Explain why this article is being rejected so the author can improve it.</p>
                        <textarea
                            autoFocus
                            rows={4}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-all"
                            placeholder="Add your feedback here..."
                            value={rejectionNote}
                            onChange={(e) => setRejectionNote(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >Cancel</button>
                            <button
                                onClick={() => workflowMutation.mutate({ action: 'reject', params: { note: rejectionNote } })}
                                disabled={workflowMutation.isPending || !rejectionNote.trim()}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-50"
                            >Reject Article</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 font-display">Schedule Publishing</h3>
                        <p className="text-sm text-gray-500 mb-6 font-medium">Set a future date and time when this article will automatically go live.</p>
                        <input
                            type="datetime-local"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 mb-8 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono text-sm transition-all"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsScheduleModalOpen(false)}
                                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >Cancel</button>
                            <button
                                onClick={() => workflowMutation.mutate({ action: 'schedule', params: { scheduledAt } })}
                                disabled={workflowMutation.isPending || !scheduledAt}
                                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all active:scale-95 disabled:opacity-50"
                            >Schedule</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Version View Modal (Read Only) */}
            {selectedVersion && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-8">
                    <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-98 duration-300">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-[10px] font-extrabold text-gray-400">v{selectedVersion.versionNumber}</div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Version Preview</h3>
                                    <p className="text-xs text-gray-400 font-medium">Captured on {new Date(selectedVersion.editedAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedVersion(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-12 bg-white">
                            <div className="max-w-3xl mx-auto space-y-8 pointer-events-none">
                                {(() => {
                                    try {
                                        const snap = JSON.parse(selectedVersion.snapshotJson);
                                        return (
                                            <>
                                                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">{snap.title}</h1>
                                                <p className="text-2xl text-gray-400 font-light">{snap.subtitle}</p>
                                                <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: snap.contentHtml }}></div>
                                            </>
                                        )
                                    } catch (e) {
                                        return <p>Error loading version content.</p>
                                    }
                                })()}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button onClick={() => setSelectedVersion(null)} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900">Close Preview</button>
                            <button
                                onClick={() => {
                                    restoreMutation.mutate(selectedVersion.id);
                                    setSelectedVersion(null);
                                }}
                                className="px-8 py-2.5 text-sm font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 shadow-xl shadow-amber-100 active:scale-95 transition-all"
                            >Restore this Version</button>
                        </div>
                    </div>
                </div>
            )}

            <MediaSelectorModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onSelect={(media) => {
                    setCoverMediaId(media.id);
                    setCoverMediaUrl(media.url);
                }}
            />
        </div>
    );
}
