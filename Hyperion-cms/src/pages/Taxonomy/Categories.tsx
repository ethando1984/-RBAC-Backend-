import { useState } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    type DragStartEvent,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, FolderTree, Plus, Settings, Save, LayoutTemplate, Loader2, Trash2, X, ChevronRight, Globe, Code } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hemeraApi } from '../../api/client';

// --- Sortable Item Component ---
function SortableItem({ id, title }: { id: string; title: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg mb-2 group",
                isDragging ? "opacity-50 ring-2 ring-blue-500 z-10" : "hover:border-blue-300"
            )}
        >
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                <GripVertical className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
    );
}

const homeLayoutSlots = [
    { id: 'slot-1', title: 'Hero Section' },
    { id: 'slot-2', title: 'Trending Now' },
    { id: 'slot-3', title: 'Editor Picks' },
    { id: 'slot-4', title: 'Latest Reviews' },
];

export function Categories() {
    const [activeTab, setActiveTab] = useState<'tree' | 'layout'>('tree');
    const [layoutItems, setLayoutItems] = useState(homeLayoutSlots);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLayoutItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    }

    const handleCreateNew = () => {
        setSelectedCategory({
            name: 'New Category',
            slug: '',
            parentId: null,
            seoTitle: '',
            seoDescription: ''
        });
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
            description="Manage taxonomy structure and homepage layout"
        >
            <div className="flex border-b border-gray-200 mb-6 w-full">
                <button
                    onClick={() => setActiveTab('tree')}
                    className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2", activeTab === 'tree' ? "border-blue-500 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
                >
                    <FolderTree className="h-4 w-4" /> Category Tree
                </button>
                <button
                    onClick={() => setActiveTab('layout')}
                    className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2", activeTab === 'layout' ? "border-blue-500 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
                >
                    <LayoutTemplate className="h-4 w-4" /> Layout Editor
                </button>
            </div>

            {activeTab === 'tree' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Root Categories</h3>
                            <button
                                onClick={handleCreateNew}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : (
                            <ul className="space-y-1">
                                {categories?.map((cat: any) => (
                                    <li key={cat.id}>
                                        <div
                                            onClick={() => setSelectedCategory(cat)}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all group",
                                                selectedCategory?.id === cat.id ? "bg-blue-50 text-blue-700 border-blue-100 border" : "hover:bg-gray-50 text-gray-700 border-transparent border"
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", selectedCategory?.id === cat.id ? "bg-blue-500" : "bg-gray-300")}></div>
                                                {cat.name}
                                            </span>
                                            <ChevronRight className={cn("h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform", selectedCategory?.id === cat.id ? "opacity-100" : "opacity-0")} />
                                        </div>
                                        {cat.children && cat.children.length > 0 && (
                                            <ul className="ml-6 space-y-1 mt-1 border-l-2 border-gray-100 pl-2">
                                                {cat.children.map((sub: any) => (
                                                    <li
                                                        key={sub.id}
                                                        onClick={() => setSelectedCategory(sub)}
                                                        className={cn(
                                                            "text-xs px-2 py-1.5 rounded cursor-pointer transition-all",
                                                            selectedCategory?.id === sub.id ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-500 hover:bg-gray-50"
                                                        )}
                                                    >
                                                        {sub.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                                {categories?.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">No categories found.</p>
                                )}
                            </ul>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        {selectedCategory ? (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-gray-400" />
                                        {selectedCategory.id ? 'Edit Category' : 'Create New Category'}
                                    </h3>
                                    <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-gray-200 rounded text-gray-400">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                                <input
                                                    type="text"
                                                    value={selectedCategory.name}
                                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                                                    className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                                                        className="w-full pl-9 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                        placeholder="auto-generated"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                                                <select
                                                    value={selectedCategory.parentId || ''}
                                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, parentId: e.target.value || null })}
                                                    className="w-full border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                >
                                                    <option value="">None (Root)</option>
                                                    {flatCategories?.filter((c: any) => c.id !== selectedCategory.id).map((c: any) => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <p className="mt-1 text-[10px] text-gray-400">Hierarchical nesting affects URL structure and breadcrumbs.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Globe className="h-3.5 w-3.5" /> SEO Metadata
                                            </h4>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">SEO Title Tag</label>
                                                <input
                                                    type="text"
                                                    value={selectedCategory.seoTitle || ''}
                                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, seoTitle: e.target.value })}
                                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                                    placeholder="Custom title for search engines"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                                                <textarea
                                                    value={selectedCategory.seoDescription || ''}
                                                    onChange={(e) => setSelectedCategory({ ...selectedCategory, seoDescription: e.target.value })}
                                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all h-20 resize-none bg-white"
                                                    placeholder="Brief summary for search results"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                        <button
                                            onClick={handleDelete}
                                            className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1.5" /> Delete Category
                                        </button>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setSelectedCategory(null)}
                                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={updateMutation.isPending || createMutation.isPending}
                                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 disabled:opacity-50"
                                            >
                                                {updateMutation.isPending || createMutation.isPending ? (<Loader2 className="h-4 w-4 mr-2 animate-spin" />) : (<Save className="h-4 w-4 mr-2" />)}
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center text-gray-400 min-h-[400px]">
                                <FolderTree className="h-16 w-16 text-gray-200 mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-1">Taxonomy Management</h4>
                                <p className="max-w-xs text-sm">Select a category from the tree on the left to edit its properties, SEO settings, and hierarchy.</p>
                                <button
                                    onClick={handleCreateNew}
                                    className="mt-6 flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-50 transition-all"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Create Root Category
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Homepage Layout Slots</h3>
                            <button className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                <Save className="h-4 w-4 mr-1.5" /> Save Layout
                            </button>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={layoutItems.map(i => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[400px]">
                                    {layoutItems.map((item) => (
                                        <SortableItem key={item.id} id={item.id} title={item.title} />
                                    ))}
                                </div>
                            </SortableContext>

                            <DragOverlay dropAnimation={{
                                sideEffects: defaultDropAnimationSideEffects({
                                    styles: {
                                        active: { opacity: '0.5' },
                                    },
                                }),
                            }}>
                                {activeId ? <SortableItem id={activeId} title={layoutItems.find(i => i.id === activeId)?.title || ''} /> : null}
                            </DragOverlay>
                        </DndContext>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit sticky top-20">
                        <h3 className="font-semibold text-gray-900 mb-4">Available Widgets</h3>
                        <div className="space-y-2">
                            {['Hero Carousel', 'Latest News List', 'Category Grid', 'Newsletter Signup', 'Advertisement Banner'].map((widget, i) => (
                                <div key={i} className="p-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 cursor-grab bg-white">
                                    {widget}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}

