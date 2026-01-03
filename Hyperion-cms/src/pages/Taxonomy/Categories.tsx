import { useState, useEffect } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import {
    FolderTree,
    Plus,
    Settings,
    Save,
    Loader2,
    Trash2,
    X,
    ChevronRight,
    Globe,
    Code,
    LayoutTemplate,
    Grid,
    List,
    Columns,
    Maximize,
    Eye
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hemeraApi } from '../../api/client';

// --- Types ---
interface LayoutConfig {
    mode: 'grid' | 'list' | 'masonry';
    sidebar: 'none' | 'left' | 'right';
    showHero: boolean;
    itemsPerPage: number;
}

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
    mode: 'grid',
    sidebar: 'right',
    showHero: true,
    itemsPerPage: 12
};

export function Categories() {
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [editorTab, setEditorTab] = useState<'general' | 'seo' | 'layout'>('general');

    // Layout Config State (parsed from JSON)
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(DEFAULT_LAYOUT_CONFIG);
    const [rawLayoutJson, setRawLayoutJson] = useState<string>('');

    const queryClient = useQueryClient();

    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await hemeraApi.get('/categories');
            return response.data;
        }
    });

    const { data: flatCategories } = useQuery({
        queryKey: ['categories', 'flat'],
        queryFn: async () => {
            const response = await hemeraApi.get('/categories', { params: { flat: true } });
            return response.data;
        }
    });

    // Update local layout state when selectedCategory changes
    useEffect(() => {
        if (selectedCategory) {
            try {
                if (selectedCategory.positionConfigJson) {
                    const parsed = JSON.parse(selectedCategory.positionConfigJson);
                    setLayoutConfig({ ...DEFAULT_LAYOUT_CONFIG, ...parsed });
                    setRawLayoutJson(selectedCategory.positionConfigJson);
                } else {
                    setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
                    setRawLayoutJson(JSON.stringify(DEFAULT_LAYOUT_CONFIG, null, 2));
                }
            } catch (e) {
                console.warn("Failed to parse layout config", e);
                setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
                setRawLayoutJson('{}');
            }
        }
    }, [selectedCategory?.id]); // Only re-run if ID changes (switching categories)

    // Sync layoutConfig back to selectedCategory when it changes
    const updateLayoutConfig = (newConfig: LayoutConfig) => {
        setLayoutConfig(newConfig);
        const json = JSON.stringify(newConfig);
        setRawLayoutJson(json);
        setSelectedCategory((prev: any) => ({ ...prev, positionConfigJson: json }));
    };

    const createMutation = useMutation({
        mutationFn: (data: any) => hemeraApi.post('/categories', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setSelectedCategory(null);
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => hemeraApi.put(`/categories/${data.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => hemeraApi.delete(`/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setSelectedCategory(null);
        }
    });

    const handleCreateNew = () => {
        const newCat = {
            name: 'New Category',
            slug: '',
            parentId: null,
            seoTitle: '',
            seoDescription: '',
            positionConfigJson: JSON.stringify(DEFAULT_LAYOUT_CONFIG),
        };
        setSelectedCategory(newCat);
        // Force state update for layout
        setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
        setRawLayoutJson(JSON.stringify(DEFAULT_LAYOUT_CONFIG));
        setEditorTab('general');
    };

    const handleSave = () => {
        if (selectedCategory.id) {
            updateMutation.mutate(selectedCategory);
        } else {
            createMutation.mutate(selectedCategory);
        }
    };

    const handleDelete = () => {
        if (selectedCategory?.id && window.confirm('Are you sure you want to delete this category?')) {
            deleteMutation.mutate(selectedCategory.id);
        }
    };

    return (
        <PageShell
            title="Categories & Layout"
            description="Manage taxonomy structure and category page layouts"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
                {/* Left Column: Tree */}
                <div className="lg:col-span-1 bg-white flex flex-col rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Category Structure</h3>
                        <button
                            onClick={handleCreateNew}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Add Root Category"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : categories?.length === 0 ? (
                            <div className="text-center py-8 px-4">
                                <p className="text-sm text-gray-500 mb-2">No categories found.</p>
                                <button
                                    onClick={handleCreateNew}
                                    className="text-sm text-blue-600 font-medium hover:underline"
                                >
                                    Create your first category
                                </button>
                            </div>
                        ) : (
                            <ul className="space-y-1">
                                {categories?.map((cat: any) => (
                                    <li key={cat.id}>
                                        <div
                                            onClick={() => setSelectedCategory(cat)}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all group",
                                                selectedCategory?.id === cat.id ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200" : "hover:bg-gray-50 text-gray-700 border-transparent"
                                            )}
                                        >
                                            <span className="flex items-center gap-2.5">
                                                <FolderTree className={cn("h-4 w-4", selectedCategory?.id === cat.id ? "text-blue-500" : "text-gray-400")} />
                                                {cat.name}
                                            </span>
                                            <ChevronRight className={cn("h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform", selectedCategory?.id === cat.id ? "opacity-100" : "opacity-0")} />
                                        </div>
                                        {cat.children && cat.children.length > 0 && (
                                            <ul className="ml-5 mt-1 border-l border-gray-200 pl-2 space-y-1 my-1">
                                                {cat.children.map((sub: any) => (
                                                    <li
                                                        key={sub.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCategory(sub);
                                                        }}
                                                        className={cn(
                                                            "text-sm px-3 py-2 rounded-md cursor-pointer transition-all flex items-center gap-2",
                                                            selectedCategory?.id === sub.id ? "bg-blue-50 text-blue-600 font-medium ring-1 ring-blue-100" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                        )}
                                                    >
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", selectedCategory?.id === sub.id ? "bg-blue-400" : "bg-gray-300")}></div>
                                                        {sub.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right Column: Editor */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    {selectedCategory ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Editor Header */}
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-gray-400" />
                                    {selectedCategory.id ? `Editing: ${selectedCategory.name}` : 'Create New Category'}
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDelete()} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors" title="Delete">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setSelectedCategory(null)} className="p-2 hover:bg-gray-200 rounded text-gray-400 transition-colors" title="Close">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Editor Tabs */}
                            <div className="border-b border-gray-200 flex shrink-0">
                                <button
                                    onClick={() => setEditorTab('general')}
                                    className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2", editorTab === 'general' ? "border-blue-500 text-blue-600 bg-blue-50/30" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
                                >
                                    <Settings className="h-3.5 w-3.5" /> General
                                </button>
                                <button
                                    onClick={() => setEditorTab('layout')}
                                    className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2", editorTab === 'layout' ? "border-blue-500 text-blue-600 bg-blue-50/30" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
                                >
                                    <LayoutTemplate className="h-3.5 w-3.5" /> Layout
                                </button>
                                <button
                                    onClick={() => setEditorTab('seo')}
                                    className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2", editorTab === 'seo' ? "border-blue-500 text-blue-600 bg-blue-50/30" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
                                >
                                    <Globe className="h-3.5 w-3.5" /> SEO
                                </button>
                            </div>

                            {/* Editor Content Area */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* GENERAL TAB */}
                                {editorTab === 'general' && (
                                    <div className="space-y-5 max-w-2xl">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                            <input
                                                type="text"
                                                value={selectedCategory.name}
                                                onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                                                className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                                placeholder="e.g. Technology"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                                            <div className="relative">
                                                <Code className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={selectedCategory.slug}
                                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, slug: e.target.value })}
                                                    className="w-full pl-9 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-gray-50/50"
                                                    placeholder="auto-generated"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                                            <select
                                                value={selectedCategory.parentId || ''}
                                                onChange={(e) => setSelectedCategory({ ...selectedCategory, parentId: e.target.value || null })}
                                                className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                            >
                                                <option value="">None (Root)</option>
                                                {flatCategories?.filter((c: any) => c.id !== selectedCategory.id).map((c: any) => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* LAYOUT TAB */}
                                {editorTab === 'layout' && (
                                    <div className="space-y-8">
                                        {/* Visual Layout Mode Selector */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Content Display Mode</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                <button
                                                    onClick={() => updateLayoutConfig({ ...layoutConfig, mode: 'grid' })}
                                                    className={cn("flex flex-col items-center gap-2 p-4 border rounded-xl transition-all", layoutConfig.mode === 'grid' ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50")}
                                                >
                                                    <Grid className="h-6 w-6" />
                                                    <span className="text-sm font-medium">Grid View</span>
                                                </button>
                                                <button
                                                    onClick={() => updateLayoutConfig({ ...layoutConfig, mode: 'list' })}
                                                    className={cn("flex flex-col items-center gap-2 p-4 border rounded-xl transition-all", layoutConfig.mode === 'list' ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50")}
                                                >
                                                    <List className="h-6 w-6" />
                                                    <span className="text-sm font-medium">List View</span>
                                                </button>
                                                <button
                                                    onClick={() => updateLayoutConfig({ ...layoutConfig, mode: 'masonry' })}
                                                    className={cn("flex flex-col items-center gap-2 p-4 border rounded-xl transition-all", layoutConfig.mode === 'masonry' ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50")}
                                                >
                                                    <LayoutTemplate className="h-6 w-6" />
                                                    <span className="text-sm font-medium">Masonry</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Sidebar Config */}
                                            <div className="space-y-4">
                                                <label className="block text-sm font-medium text-gray-700">Sidebar Position</label>
                                                <div className="space-y-2">
                                                    {['none', 'left', 'right'].map((pos) => (
                                                        <label key={pos} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                            <input
                                                                type="radio"
                                                                name="sidebar"
                                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                                checked={layoutConfig.sidebar === pos}
                                                                onChange={() => updateLayoutConfig({ ...layoutConfig, sidebar: pos as any })}
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                {pos === 'none' && <Maximize className="h-4 w-4 text-gray-500" />}
                                                                {pos === 'left' && <Columns className="h-4 w-4 text-gray-500 rotate-180" />}
                                                                {pos === 'right' && <Columns className="h-4 w-4 text-gray-500" />}
                                                                <span className="text-sm text-gray-700 capitalize">{pos} Sidebar</span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Other Options */}
                                            <div className="space-y-4">
                                                <label className="block text-sm font-medium text-gray-700">Display Options</label>
                                                <div className="space-y-3">
                                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            checked={layoutConfig.showHero}
                                                            onChange={(e) => updateLayoutConfig({ ...layoutConfig, showHero: e.target.checked })}
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <Eye className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm text-gray-700">Show Hero Section</span>
                                                        </div>
                                                    </label>

                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1.5 uppercase font-semibold tracking-wider">Items Per Page</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="100"
                                                            value={layoutConfig.itemsPerPage}
                                                            onChange={(e) => updateLayoutConfig({ ...layoutConfig, itemsPerPage: parseInt(e.target.value) || 12 })}
                                                            className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Raw JSON Fallback */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <details className="text-xs">
                                                <summary className="cursor-pointer text-gray-400 hover:text-gray-600 font-medium mb-2">Advanced: Edit Raw Layout JSON</summary>
                                                <textarea
                                                    value={rawLayoutJson}
                                                    onChange={(e) => {
                                                        setRawLayoutJson(e.target.value);
                                                        try {
                                                            const parsed = JSON.parse(e.target.value);
                                                            setLayoutConfig(parsed);
                                                            setSelectedCategory((prev: any) => ({ ...prev, positionConfigJson: e.target.value }));
                                                        } catch (err) {
                                                            // Invalid JSON, don't update object but allow typing
                                                        }
                                                    }}
                                                    className="w-full h-32 font-mono text-xs border-gray-200 rounded-lg focus:ring-gray-400 focus:border-gray-400 bg-gray-50"
                                                />
                                            </details>
                                        </div>
                                    </div>
                                )}

                                {/* SEO TAB */}
                                {editorTab === 'seo' && (
                                    <div className="space-y-6 max-w-2xl">
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                                            <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
                                                <Globe className="h-4 w-4" /> Search Engine Preview
                                            </h4>
                                            <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                                <div className="text-sm text-gray-500 mb-0.5">example.com › categories › {selectedCategory.slug || 'slug'}</div>
                                                <div className="text-xl text-blue-700 font-medium hover:underline cursor-pointer truncate">
                                                    {selectedCategory.seoTitle || selectedCategory.name || 'Category Title'}
                                                </div>
                                                <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                                                    {selectedCategory.seoDescription || "This is how your category will appear in search engine results. Add a compelling description to improve click-through rates."}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title Tag</label>
                                            <input
                                                type="text"
                                                value={selectedCategory.seoTitle || ''}
                                                onChange={(e) => setSelectedCategory({ ...selectedCategory, seoTitle: e.target.value })}
                                                className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                                placeholder="Custom title for search engines"
                                            />
                                            <p className="mt-1 text-xs text-gray-400">Ideally 50-60 characters.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                            <textarea
                                                value={selectedCategory.seoDescription || ''}
                                                onChange={(e) => setSelectedCategory({ ...selectedCategory, seoDescription: e.target.value })}
                                                className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow h-24 resize-none"
                                                placeholder="Brief summary for search results"
                                            />
                                            <p className="mt-1 text-xs text-gray-400">Ideally 150-160 characters.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Editor Footer */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 shrink-0">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending || createMutation.isPending}
                                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 disabled:opacity-50"
                                >
                                    {updateMutation.isPending || createMutation.isPending ? (<Loader2 className="h-4 w-4 mr-2 animate-spin" />) : (<Save className="h-4 w-4 mr-2" />)}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 border-dashed flex flex-col items-center justify-center text-center text-gray-400 h-full p-8">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <FolderTree className="h-10 w-10 text-gray-300" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">Category Management</h4>
                            <p className="max-w-sm text-sm text-gray-500 mb-8 leading-relaxed">
                                Select a category from the tree on the left to edit its details, SEO metadata, and layout configuration.
                            </p>
                            <button
                                onClick={handleCreateNew}
                                className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Create Root Category
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </PageShell>
    );
}
