import { Search, LayoutList, LayoutGrid } from 'lucide-react';
import { Card } from '../ui/Card';
import type { ViewMode } from '../../hooks/useViewParams';

interface ViewToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    placeholder?: string;
    suffix?: React.ReactNode;
}

export function ViewToolbar({
    search,
    onSearchChange,
    viewMode,
    onViewModeChange,
    pageSize,
    onPageSizeChange,
    placeholder = 'Search...',
    suffix
}: ViewToolbarProps) {
    return (
        <Card className="p-1">
            <div className="flex flex-col sm:flex-row items-center justify-between p-2 gap-4">
                {/* Search Input */}
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold" size={16} />
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
                    {/* Extra Filters/Actions (Suffix) */}
                    {suffix}

                    <div className="h-6 w-px bg-gray-100 hidden sm:block" />

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:inline">Show</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="bg-gray-50 border-none rounded-lg text-xs font-bold py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer appearance-none"
                            style={{ backgroundImage: 'none' }}
                        >
                            {[10, 20, 50, 100].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-6 w-px bg-gray-100 hidden sm:block" />

                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-50 rounded-lg p-1 gap-1 flex-shrink-0">
                        <button
                            onClick={() => onViewModeChange('table')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'table'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                            title="Table View"
                        >
                            <LayoutList size={16} />
                        </button>
                        <button
                            onClick={() => onViewModeChange('card')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'card'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                            title="Card View"
                        >
                            <LayoutGrid size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
