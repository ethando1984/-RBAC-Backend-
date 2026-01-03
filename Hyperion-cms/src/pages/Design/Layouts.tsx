import { useState, useEffect } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import {
    Layout as LayoutIcon,
    Plus,
    Save,
    Trash2,
    Monitor,
    Home,
    Folder,
    FileText,
    Loader2,
    Code
} from 'lucide-react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hemeraApi } from '../../api/client';
import { cn } from '../../utils/cn';

// --- Types ---
type LayoutType = 'STANDALONE' | 'HOMEPAGE' | 'CATEGORY' | 'ARTICLE' | 'EMBED';

interface Layout {
    id?: string;
    name: string;
    slug?: string;
    type: LayoutType;
    targetId?: string;
    configJson: string;
    isDefault: boolean;
    isActive: boolean;
}

const DEFAULT_CONFIG = {
    widgets: [],
    settings: {
        maxWidth: '1200px',
        padding: '2rem'
    }
};

export function Layouts() {
    const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
    const [configObject, setConfigObject] = useState<any>(DEFAULT_CONFIG);
    const [jsonMode, setJsonMode] = useState(false);
    const queryClient = useQueryClient();

    const { data: layouts, isLoading } = useQuery({
        queryKey: ['layouts'],
        queryFn: async () => {
            const response = await hemeraApi.get('/layouts');
            return response.data;
        }
    });

    useEffect(() => {
        if (selectedLayout) {
            try {
                if (selectedLayout.configJson) {
                    setConfigObject(JSON.parse(selectedLayout.configJson));
                } else {
                    setConfigObject(DEFAULT_CONFIG);
                }
            } catch (e) {
                setConfigObject({});
            }
        }
    }, [selectedLayout?.id]);

    const createMutation = useMutation({
        mutationFn: (data: Layout) => hemeraApi.post('/layouts', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['layouts'] });
            setSelectedLayout(null);
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: Layout) => hemeraApi.put(`/layouts/${data.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['layouts'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => hemeraApi.delete(`/layouts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['layouts'] });
            setSelectedLayout(null);
        }
    });

    const handleCreate = (type: LayoutType) => {
        const newLayout: Layout = {
            name: `New ${type.toLowerCase()} layout`,
            type: type,
            configJson: JSON.stringify(DEFAULT_CONFIG, null, 2),
            isDefault: false,
            isActive: true,
            slug: type === 'STANDALONE' ? 'new-page' : undefined
        };
        setSelectedLayout(newLayout);
        setConfigObject(DEFAULT_CONFIG);
    };

    const handleSave = () => {
        if (!selectedLayout) return;
        const toSave = {
            ...selectedLayout,
            configJson: JSON.stringify(configObject, null, 2)
        };
        if (toSave.id) {
            updateMutation.mutate(toSave as Layout);
        } else {
            createMutation.mutate(toSave as Layout);
        }
    };

    const getGroupedLayouts = () => {
        if (!layouts) return {};
        const groups: Record<string, Layout[]> = {
            HOMEPAGE: [],
            STANDALONE: [],
            CATEGORY: [],
            ARTICLE: [],
            EMBED: []
        };
        layouts.forEach((l: Layout) => {
            if (groups[l.type]) groups[l.type].push(l);
        });
        return groups;
    };

    const grouped = getGroupedLayouts();

    const TypeIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'HOMEPAGE': return <Home className="h-4 w-4" />;
            case 'STANDALONE': return <Monitor className="h-4 w-4" />;
            case 'CATEGORY': return <Folder className="h-4 w-4" />;
            case 'ARTICLE': return <FileText className="h-4 w-4" />;
            default: return <LayoutIcon className="h-4 w-4" />;
        }
    };

    return (
        <PageShell title="Layouts & Pages" description="Manage site blocks, templates, and standalone pages">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
                {/* Sidebar */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Explorer</span>
                        <div className="flex gap-1">
                            {/* Quick Add Dropdown could go here */}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
                        ) : Object.entries(grouped).map(([type, items]) => (
                            <div key={type}>
                                <div className="flex items-center justify-between px-3 py-1 mb-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <TypeIcon type={type} /> {type}
                                    </span>
                                    <button
                                        onClick={() => handleCreate(type as LayoutType)}
                                        className="p-1 hover:bg-blue-50 text-blue-600 rounded" title={`Add ${type}`}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="space-y-0.5">
                                    {items.length === 0 && <div className="px-3 text-xs text-gray-300 italic">None</div>}
                                    {items.map((l) => (
                                        <div
                                            key={l.id}
                                            onClick={() => setSelectedLayout(l)}
                                            className={cn(
                                                "px-3 py-2 rounded-md text-sm cursor-pointer flex items-center justify-between group transition-colors",
                                                selectedLayout?.id === l.id || selectedLayout?.name === l.name // loose check for new items
                                                    ? "bg-blue-50 text-blue-700 font-medium"
                                                    : "text-gray-600 hover:bg-gray-50"
                                            )}
                                        >
                                            <span className="truncate">{l.name}</span>
                                            {l.isDefault && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">Def</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Editor */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 flex flex-col shadow-sm overflow-hidden">
                    {selectedLayout ? (
                        <>
                            {/* Toolbar */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3 w-full max-w-2xl">
                                    <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                                        <TypeIcon type={selectedLayout.type} />
                                    </div>
                                    <div className="grid gap-1 w-full">
                                        <input
                                            type="text"
                                            value={selectedLayout.name}
                                            onChange={(e) => setSelectedLayout({ ...selectedLayout, name: e.target.value })}
                                            className="font-semibold text-gray-900 bg-transparent border-none p-0 focus:ring-0 text-lg w-full"
                                            placeholder="Layout Name"
                                        />
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            {selectedLayout.type === 'STANDALONE' && (
                                                <div className="flex items-center gap-1">
                                                    <span>/</span>
                                                    <input
                                                        value={selectedLayout.slug || ''}
                                                        onChange={(e) => setSelectedLayout({ ...selectedLayout, slug: e.target.value })}
                                                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:ring-0 p-0 text-xs w-32"
                                                        placeholder="url-slug"
                                                    />
                                                </div>
                                            )}
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLayout.isActive}
                                                    onChange={(e) => setSelectedLayout({ ...selectedLayout, isActive: e.target.checked })}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                Active
                                            </label>
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLayout.isDefault}
                                                    onChange={(e) => setSelectedLayout({ ...selectedLayout, isDefault: e.target.checked })}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                Default
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setJsonMode(!jsonMode)}
                                        className={cn("p-2 rounded text-gray-500 transition-colors", jsonMode ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100")}
                                        title="Toggle JSON Mode"
                                    >
                                        <Code className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => window.confirm('Delete?') && selectedLayout.id && deleteMutation.mutate(selectedLayout.id)}
                                        className="p-2 hover:bg-red-50 text-red-400 hover:text-red-500 rounded transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
                                    >
                                        {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Save
                                    </button>
                                </div>
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 overflow-hidden flex">
                                {jsonMode ? (
                                    <div className="flex-1 p-0">
                                        <textarea
                                            value={JSON.stringify(configObject, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    setConfigObject(JSON.parse(e.target.value));
                                                } catch (err) {
                                                    // ignore
                                                }
                                            }}
                                            className="w-full h-full font-mono text-xs p-4 bg-gray-50 resize-none focus:outline-none"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1 p-8 overflow-y-auto bg-gray-100/50 flex flex-col items-center">
                                        <div className="w-full max-w-4xl bg-white min-h-[500px] shadow-sm border border-gray-200 rounded-lg p-8">
                                            {/* Visual Placeholder */}
                                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400 flex flex-col items-center justify-center h-48 mb-4 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                                                <Plus className="h-8 w-8 mb-2" />
                                                <span className="text-sm font-medium">Add Header / Hero Section</span>
                                            </div>

                                            {/* Render Widgets List */}
                                            {configObject?.widgets?.map((widget: any, idx: number) => (
                                                <div key={idx} className="mb-4 p-4 border border-gray-200 rounded bg-gray-50 flex justify-between items-center">
                                                    <span className="font-mono text-sm">{widget.type || 'Unknown Widget'}</span>
                                                    <span className="text-xs text-gray-400">JSON Configured</span>
                                                </div>
                                            ))}

                                            {(!configObject.widgets || configObject.widgets.length === 0) && (
                                                <div className="text-center text-gray-500 text-sm py-10">
                                                    No widgets configured. Switch to JSON mode to paste a config or use the visual builder placeholders.
                                                </div>
                                            )}

                                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400 flex flex-col items-center justify-center h-32 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                                                <Plus className="h-6 w-6 mb-2" />
                                                <span className="text-sm font-medium">Add Content Block</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
                            <LayoutIcon className="h-16 w-16 text-gray-200 mb-4" />
                            <p className="text-lg font-medium text-gray-600">Select or create a layout</p>
                            <p className="max-w-xs text-center text-sm mt-2">
                                Configure visual templates for the homepage, categories, articles, or create standalone landing pages.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </PageShell>
    );
}
