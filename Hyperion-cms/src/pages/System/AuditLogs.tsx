import { useState } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { Shield, User, FileText, FolderTree, Clock, Search, Filter, Loader2, Eye, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { auditLogApi, type AuditLog } from '../../api/auditLogs';
import { cn } from '../../utils/cn';

const ACTION_COLORS = {
    CREATE: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    UPDATE: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    DELETE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    LOGIN: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
} as const;

const ENTITY_ICONS = {
    article: FileText,
    user: User,
    category: FolderTree,
    default: Shield,
};

export function AuditLogs() {
    const [entityTypeFilter, setEntityTypeFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: logs, isLoading } = useQuery({
        queryKey: ['audit-logs', entityTypeFilter],
        queryFn: () => auditLogApi.list({ entityType: entityTypeFilter || undefined })
    });

    const { data: stats } = useQuery({
        queryKey: ['audit-stats'],
        queryFn: auditLogApi.getStats
    });

    const filteredLogs = logs?.filter(log => {
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        return (
            log.actorEmail?.toLowerCase().includes(search) ||
            log.actionType?.toLowerCase().includes(search) ||
            log.entityType?.toLowerCase().includes(search)
        );
    });

    const getActionColor = (action: string) => {
        const upperAction = action.toUpperCase();
        if (upperAction.includes('CREATE')) return ACTION_COLORS.CREATE;
        if (upperAction.includes('UPDATE') || upperAction.includes('EDIT')) return ACTION_COLORS.UPDATE;
        if (upperAction.includes('DELETE')) return ACTION_COLORS.DELETE;
        if (upperAction.includes('LOGIN')) return ACTION_COLORS.LOGIN;
        return ACTION_COLORS.UPDATE;
    };

    return (
        <PageShell
            title="Audit Logs"
            description="System activity tracking and security monitoring"
        >
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="text-3xl font-black text-blue-900">{stats?.total || 0}</span>
                        </div>
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total Events</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100">
                        <div className="flex items-center justify-between mb-2">
                            <FileText className="h-8 w-8 text-green-600" />
                            <span className="text-3xl font-black text-green-900">{stats?.articles || 0}</span>
                        </div>
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Article Events</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                            <User className="h-8 w-8 text-purple-600" />
                            <span className="text-3xl font-black text-purple-900">{stats?.users || 0}</span>
                        </div>
                        <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">User Events</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-100">
                        <div className="flex items-center justify-between mb-2">
                            <FolderTree className="h-8 w-8 text-orange-600" />
                            <span className="text-3xl font-black text-orange-900">{stats?.categories || 0}</span>
                        </div>
                        <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Category Events</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by actor, action, or entity..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none"
                                value={entityTypeFilter}
                                onChange={e => setEntityTypeFilter(e.target.value)}
                            >
                                <option value="">All Entity Types</option>
                                <option value="article">Articles</option>
                                <option value="user">Users</option>
                                <option value="category">Categories</option>
                                <option value="tag">Tags</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actor</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entity</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">IP Address</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 opacity-20" />
                                            <p className="text-xs font-medium uppercase tracking-widest">Loading audit logs...</p>
                                        </td>
                                    </tr>
                                ) : filteredLogs?.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                                            <Shield className="h-16 w-16 mx-auto mb-4 opacity-10" />
                                            <p className="text-lg font-medium text-gray-900 mb-1">No audit logs found</p>
                                            <p className="text-sm">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs?.map(log => {
                                        const actionColor = getActionColor(log.actionType);
                                        const EntityIcon = ENTITY_ICONS[log.entityType as keyof typeof ENTITY_ICONS] || ENTITY_ICONS.default;

                                        return (
                                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span className="font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <User className="h-4 w-4 text-gray-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">{log.actorEmail || 'System'}</div>
                                                            {log.actorUserId && <div className="text-xs text-gray-500 font-mono">{log.actorUserId.substring(0, 8)}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border-2",
                                                        actionColor.bg, actionColor.text, actionColor.border
                                                    )}>
                                                        {log.actionType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <EntityIcon className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-700 capitalize">{log.entityType || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-mono text-gray-600">{log.ipAddress || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
