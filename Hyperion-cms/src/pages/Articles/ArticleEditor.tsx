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
        mutationFn: async (action: 'submit-editorial' | 'publish' | 'reject') => {
            return hemeraApi.post(`/articles/${id}/${action}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['article', id] });
            queryClient.invalidateQueries({ queryKey: ['articles'] });
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

                <div className="flex items-center gap-3">
                    {(saveMutation.isSuccess || workflowMutation.isSuccess) && (
                        <span className="text-xs text-green-600 flex items-center mr-2 animate-fade-in">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Saved
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

                    {isEditMode && status === 'DRAFT' && (
                        <button
                            onClick={() => workflowMutation.mutate('submit-editorial')}
                            disabled={workflowMutation.isPending}
                            className="flex items-center px-5 py-2 text-white bg-blue-600 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95 disabled:opacity-50"
                        >
                            {workflowMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Publish
                        </button>
                    )}

                    {isEditMode && status === 'PENDING_EDITORIAL' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => workflowMutation.mutate('reject')}
                                disabled={workflowMutation.isPending}
                                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {workflowMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                                Reject
                            </button>
                            <button
                                onClick={() => workflowMutation.mutate('publish')}
                                disabled={workflowMutation.isPending}
                                className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95 disabled:opacity-50"
                            >
                                {workflowMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
                                Approve
                            </button>
                        </div>
                    )}

                    {isEditMode && status === 'PUBLISHED' && (
                        <div className="flex gap-2 items-center">
                            <span className="bg-green-50 text-green-700 text-[10px] font-bold px-3 py-2 rounded-lg border border-green-200 flex items-center uppercase tracking-wider">
                                <CheckCircle2 className="h-3 w-3 mr-2" /> Live
                            </span>
                            <button
                                onClick={() => workflowMutation.mutate('reject')}
                                disabled={workflowMutation.isPending}
                                className="text-gray-400 hover:text-red-600 p-2 rounded-full transition-colors"
                                title="Revert to Draft"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 mt-16 flex relative overflow-hidden">
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
                            <p className="mt-2 text-[9px] text-gray-400 leading-tight">Check boxes to assign categories. Use the <Star className="h-2 w-2 inline" /> icon to set the primary category for URLs.</p>
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
                                    {tagNames.length === 0 && (
                                        <p className="text-[10px] text-gray-400 italic py-2">No tags added yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Settings className="h-3 w-3" /> Publishing
                            </h3>
                            <div className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Schedule</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        value={scheduledAt}
                                        onChange={(e) => setScheduledAt(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Visibility</label>
                                    <select
                                        className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:16px] bg-[right_10px_center] bg-no-repeat"
                                        value={visibility}
                                        onChange={(e) => setVisibility(e.target.value)}
                                    >
                                        <option value="PUBLIC">Public</option>
                                        <option value="PRIVATE">Private</option>
                                        <option value="PASSWORD">Password</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Users className="h-3 w-3" /> Authorship
                            </h3>
                            <div className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Author User</label>
                                    <select
                                        className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:16px] bg-[right_10px_center] bg-no-repeat"
                                        value={authorUserId}
                                        onChange={(e) => setAuthorUserId(e.target.value)}
                                    >
                                        <option value="">System Default</option>
                                        {users?.map((user: any) => (
                                            <option key={user.userId} value={user.userId}>{user.username} ({user.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Attribution Role</label>
                                    <select
                                        className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:16px] bg-[right_10px_center] bg-no-repeat"
                                        value={authorRoleId}
                                        onChange={(e) => setAuthorRoleId(e.target.value)}
                                    >
                                        <option value="">Individual</option>
                                        {roles?.map((role: any) => (
                                            <option key={role.roleId} value={role.roleId}>{role.roleName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ImageIcon className="h-3 w-3" /> Cover Media
                                </h3>
                                {coverMediaId && (
                                    <button
                                        onClick={() => setIsMediaModalOpen(true)}
                                        className="text-[9px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
                                    >
                                        Replace
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {coverMediaUrl ? (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm group/image">
                                        <img
                                            src={`http://localhost:8081${coverMediaUrl}`}
                                            alt="Cover"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover/image:bg-black/40 transition-colors duration-300" />
                                        <button
                                            onClick={() => {
                                                setCoverMediaId('');
                                                setCoverMediaUrl('');
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-600 backdrop-blur-md text-white rounded-full transition-all scale-75 opacity-0 group-hover/image:scale-100 group-hover/image:opacity-100"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsMediaModalOpen(true)}
                                        className="w-full relative border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/30 hover:border-blue-300 transition-all h-36 group overflow-hidden bg-gray-50/20"
                                    >
                                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                            <ImagePlus className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-600 uppercase tracking-widest transition-colors">
                                            Select Cover Media
                                        </span>
                                    </button>
                                )}

                                {coverMediaId && (
                                    <div className="flex items-center gap-2 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                        <span className="text-[9px] font-mono text-blue-600 overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                                            {coverMediaId.length > 20 ? coverMediaId.substring(0, 18) + '...' : coverMediaId}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Globe className="h-3 w-3" /> Optimization
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">SEO Title</label>
                                    <input
                                        type="text"
                                        className="w-full text-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 px-4 py-2.5 transition-all outline-none"
                                        placeholder="Dynamic mapping..."
                                        value={seoTitle}
                                        onChange={(e) => setSeoTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Meta Description</label>
                                    <textarea
                                        rows={4}
                                        className="w-full text-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 px-4 py-2.5 transition-all outline-none resize-none leading-normal"
                                        placeholder="Craft a compelling search snippet..."
                                        value={seoDescription}
                                        onChange={(e) => setSeoDescription(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

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
