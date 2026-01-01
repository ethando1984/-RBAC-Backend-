import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Activity, Shield, User, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { useViewParams } from '../hooks/useViewParams';

export default function AuditLogs() {
    const { page, pageSize } = useViewParams();

    const { data: logs } = useQuery({
        queryKey: ['audit-logs', page, pageSize],
        queryFn: () => api.audit.list({ page, size: pageSize })
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Audit Logs</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium italic">Track all security-critical events</p>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-50 p-6 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest">
                        <Activity size={16} /> Activity Stream
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-4">Actor</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Entity</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {(logs || []).map((log: any) => (
                                    <tr key={log.logId} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-900">{log.actorEmail || 'System'}</div>
                                                    <div className="text-[9px] text-gray-400 font-mono">{log.ipAddress}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight",
                                                log.actionType.includes("DELETE") ? "bg-rose-50 text-rose-600" :
                                                    log.actionType.includes("SEAL") ? "bg-emerald-50 text-emerald-600" :
                                                        "bg-blue-50 text-blue-600"
                                            )}>
                                                {log.actionType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Shield size={12} className="text-gray-300" />
                                                <span className="text-xs font-medium text-gray-700">{log.entityType}</span>
                                                <code className="text-[9px] bg-gray-100 px-1 rounded text-gray-500">{log.entityId}</code>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.affectedRolesCount > 0 && (
                                                <div className="text-[10px] text-gray-500">
                                                    Affected Roles: <span className="font-bold text-gray-900">{log.affectedRolesCount}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-gray-400">
                                                <Calendar size={12} />
                                                <span className="text-[10px] font-medium">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
