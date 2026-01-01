import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Shield, Box, Activity, Check, Info, Settings2, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export default function PermissionMatrix() {
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<'resource' | 'role'>('resource');
    const [hoveredCell, setHoveredCell] = useState<{ pId: string, nsId: string, atId: string } | null>(null);
    const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<any>(null);

    const { data: policies, isLoading: isLoadingPolicies } = useQuery({
        queryKey: ['permissions'],
        queryFn: api.permissions.list
    });

    const { data: namespaces } = useQuery({
        queryKey: ['namespaces'],
        queryFn: api.namespaces.list
    });

    const { data: actionTypes } = useQuery({
        queryKey: ['actionTypes'],
        queryFn: api.actionTypes.list
    });

    const { data: allAccess, isLoading: isLoadingAccess } = useQuery({
        queryKey: ['resource-access-all'],
        queryFn: api.permissions.listAllResourceAccess
    });

    const { data: roles, isLoading: isLoadingRoles } = useQuery({
        queryKey: ['roles'],
        queryFn: api.roles.list
    });

    const { data: rolePermissions, isLoading: isLoadingRolePerms } = useQuery({
        queryKey: ['role-permissions-all'],
        queryFn: api.roles.listAllPermissions
    });

    const assignScopeMutation = useMutation({
        mutationFn: (data: any) => api.assignments.assignResourceAccess(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-access-all'] });
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
    });

    const revokeScopeMutation = useMutation({
        mutationFn: (data: any) => api.assignments.revokeResourceAccess(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-access-all'] });
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
    });

    const assignRolePermMutation = useMutation({
        mutationFn: (data: any) => api.assignments.assignPermission(data.roleId, data.permissionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['role-permissions-all'] });
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
    });

    const revokeRolePermMutation = useMutation({
        mutationFn: (data: any) => api.assignments.revokePermission(data.roleId, data.permissionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['role-permissions-all'] });
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
    });

    const toggleScope = (permissionId: string, namespaceId: string, actionTypeId: string, isAssigned: boolean) => {
        const data = { permissionId, namespaceId, actionTypeId };
        if (isAssigned) {
            revokeScopeMutation.mutate(data);
        } else {
            assignScopeMutation.mutate(data);
        }
    };

    const toggleRolePerm = (roleId: string, permissionId: string, isAssigned: boolean) => {
        const data = { roleId, permissionId };
        if (isAssigned) {
            revokeRolePermMutation.mutate(data);
        } else {
            assignRolePermMutation.mutate(data);
        }
    };

    const openScopeModal = (policy: any) => {
        setEditingPolicy(policy);
        setIsScopeModalOpen(true);
    };

    const closeScopeModal = () => {
        setIsScopeModalOpen(false);
        setEditingPolicy(null);
    };

    const isLoading = isLoadingPolicies || isLoadingAccess || isLoadingRoles || isLoadingRolePerms;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Security Matrix</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium italic">Global interactive Resource Scope Configuration matrix</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
                    <button
                        onClick={() => setViewMode('resource')}
                        className={cn(
                            "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                            viewMode === 'resource' ? "bg-white text-primary-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        Resource Scopes
                    </button>
                    <button
                        onClick={() => setViewMode('role')}
                        className={cn(
                            "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                            viewMode === 'role' ? "bg-white text-primary-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        Role Mapping
                    </button>
                </div>
            </div>

            <Card className="border-none shadow-2xl shadow-gray-200/50 overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-white border-b border-gray-50 p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-50 rounded-2xl text-primary-600 shadow-sm">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Authority Cross-Reference</h2>
                                <p className="text-xs text-gray-400 font-bold mt-0.5 tracking-wide uppercase italic">Direct Matrix Editing Enabled</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Rule</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200 shadow-sm" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Access</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="py-24 flex justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                                        <th className="sticky left-0 z-20 bg-gray-50/95 backdrop-blur px-8 py-6 min-w-[300px] border-r border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                            {viewMode === 'resource' ? 'Policy Definition' : 'Role Identity'}
                                        </th>
                                        {viewMode === 'resource' ? (
                                            namespaces?.map((ns: any) => (
                                                <th key={ns.namespaceId} className="px-6 py-6 border-r border-gray-100 text-center bg-gray-50/30">
                                                    <div className="flex items-center justify-center gap-2 mb-3 text-gray-900 border-b border-gray-200/50 pb-2">
                                                        <Box size={14} className="text-primary-500" />
                                                        <span className="tracking-tighter">{ns.namespaceKey}</span>
                                                    </div>
                                                    <div
                                                        className="grid gap-1 shrink-0 px-2 min-w-[200px]"
                                                        style={{ gridTemplateColumns: `repeat(${actionTypes?.length || 5}, minmax(0, 1fr))` }}
                                                    >
                                                        {actionTypes?.map((at: any) => (
                                                            <span key={at.actionTypeId} className="text-[9px] opacity-40 hover:opacity-100 transition-opacity truncate px-0.5" title={at.actionKey}>
                                                                {at.actionKey}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </th>
                                            ))
                                        ) : (
                                            policies?.map((p: any) => (
                                                <th key={p.permissionId} className="px-4 py-6 border-r border-gray-100 text-center bg-gray-50/30 min-w-[120px]">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Shield size={14} className="text-primary-500" />
                                                        <span className="text-[9px] text-gray-900 truncate w-24" title={p.permissionName}>{p.permissionName}</span>
                                                        <code className="text-[8px] text-primary-400 font-bold uppercase tracking-tighter">{p.permissionKey}</code>
                                                    </div>
                                                </th>
                                            ))
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {viewMode === 'resource' ? (
                                        policies?.map((policy: any) => (
                                            <tr key={policy.permissionId} className="hover:bg-gray-50/30 transition-all group">
                                                <td className="sticky left-0 z-20 bg-white group-hover:bg-white px-8 py-6 border-r border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                                            <div>
                                                                <div className="text-xs font-black text-gray-900 uppercase tracking-tight">{policy.permissionName}</div>
                                                                <code className="text-[9px] text-primary-500 font-bold bg-primary-50 px-1.5 py-0.5 rounded mt-1 inline-block uppercase tracking-widest leading-none">
                                                                    {policy.permissionKey}
                                                                </code>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openScopeModal(policy)}
                                                            className="opacity-0 group-hover:opacity-100 h-8 px-2 rounded-lg text-primary-600 hover:bg-primary-50"
                                                        >
                                                            <Settings2 size={14} />
                                                        </Button>
                                                    </div>
                                                </td>
                                                {namespaces?.map((ns: any) => (
                                                    <td key={ns.namespaceId} className="px-6 py-4 border-r border-gray-100">
                                                        <div
                                                            className="grid gap-1 px-2 items-center h-full min-w-[200px]"
                                                            style={{ gridTemplateColumns: `repeat(${actionTypes?.length || 5}, minmax(0, 1fr))` }}
                                                        >
                                                            {actionTypes?.map((at: any) => {
                                                                const isAssigned = (allAccess || []).some(
                                                                    (s: any) => s.permissionId?.toString().toLowerCase() === policy.permissionId?.toString().toLowerCase() &&
                                                                        s.namespaceId?.toString().toLowerCase() === ns.namespaceId?.toString().toLowerCase() &&
                                                                        s.actionTypeId?.toString().toLowerCase() === at.actionTypeId?.toString().toLowerCase()
                                                                );

                                                                const isPending = (assignScopeMutation.isPending || revokeScopeMutation.isPending);

                                                                return (
                                                                    <button
                                                                        key={at.actionTypeId}
                                                                        onClick={() => toggleScope(policy.permissionId, ns.namespaceId, at.actionTypeId, isAssigned)}
                                                                        onMouseEnter={() => setHoveredCell({ pId: policy.permissionId, nsId: ns.namespaceId, atId: at.actionTypeId })}
                                                                        onMouseLeave={() => setHoveredCell(null)}
                                                                        disabled={isPending}
                                                                        className={cn(
                                                                            "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-200 shadow-sm relative overflow-hidden group/cell",
                                                                            isAssigned
                                                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                                                : "bg-white border-gray-100 text-gray-200 hover:border-primary-200 hover:text-primary-300",
                                                                            isPending && "opacity-50 cursor-wait"
                                                                        )}
                                                                        title={`${policy.permissionName} » ${ns.namespaceKey}:${at.actionKey}`}
                                                                    >
                                                                        {isAssigned ? (
                                                                            <Check size={18} strokeWidth={3} className="animate-in zoom-in duration-300" />
                                                                        ) : (
                                                                            <Plus size={14} className="opacity-0 group-hover/cell:opacity-100 transition-opacity" />
                                                                        )}

                                                                        {/* Tooltip detail on hover */}
                                                                        {hoveredCell?.pId === policy.permissionId &&
                                                                            hoveredCell?.nsId === ns.namespaceId &&
                                                                            hoveredCell?.atId === at.actionTypeId && (
                                                                                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-2xl text-[10px] font-bold z-50 shadow-2xl pointer-events-none whitespace-nowrap animate-in slide-in-from-bottom-2">
                                                                                    <div className="flex items-center gap-2 uppercase tracking-widest text-primary-400 border-b border-white/10 pb-1 mb-1">
                                                                                        <Info size={12} /> Resource Authority Scope
                                                                                    </div>
                                                                                    <div>DOMAIN: {ns.namespaceKey}</div>
                                                                                    <div>ACTION: {at.actionKey}</div>
                                                                                    <div className={cn("mt-1 font-black", isAssigned ? "text-emerald-400" : "text-rose-400")}>
                                                                                        {isPending ? 'SYNCHRONIZING...' : `STATUS: ${isAssigned ? 'AUTHORIZED' : 'RESTRICTED'}`}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        roles?.map((role: any) => (
                                            <tr key={role.roleId} className="hover:bg-gray-50/30 transition-all group">
                                                <td className="sticky left-0 z-20 bg-white group-hover:bg-white px-8 py-6 border-r border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                            <Users size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-black text-gray-900 uppercase tracking-tight">{role.roleName}</div>
                                                            <div className="text-[10px] text-gray-400 font-medium line-clamp-1">{role.description}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {policies?.map((policy: any) => {
                                                    const isAssigned = (rolePermissions || []).some(
                                                        (rp: any) => rp.roleId?.toString().toLowerCase() === role.roleId?.toString().toLowerCase() &&
                                                            rp.permissionId?.toString().toLowerCase() === policy.permissionId?.toString().toLowerCase()
                                                    );
                                                    const isPending = assignRolePermMutation.isPending || revokeRolePermMutation.isPending;

                                                    return (
                                                        <td key={policy.permissionId} className="px-4 py-4 border-r border-gray-100 text-center">
                                                            <button
                                                                onClick={() => toggleRolePerm(role.roleId, policy.permissionId, isAssigned)}
                                                                disabled={isPending}
                                                                className={cn(
                                                                    "w-10 h-10 rounded-2xl border-2 flex items-center justify-center mx-auto transition-all duration-300",
                                                                    isAssigned
                                                                        ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                                                        : "bg-white border-gray-100 text-gray-200 hover:border-indigo-100 hover:text-indigo-300",
                                                                    isPending && "opacity-50 cursor-wait"
                                                                )}
                                                            >
                                                                {isAssigned ? (
                                                                    <Shield size={20} className="animate-in zoom-in duration-300" />
                                                                ) : (
                                                                    <Box size={16} className="opacity-20" />
                                                                )}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-emerald-50 border border-emerald-100 px-8 py-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Activity size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-emerald-900 tracking-tight uppercase">Operational Insight</h3>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5 whitespace-pre-line">
                        This matrix allows for <b>direct administrative overrides</b>.
                        {viewMode === 'resource'
                            ? " Clicking any cell will immediately link or unlink the policy to the specific system resource."
                            : " Clicking any cell will immediately assign or revoke the policy from the specific role."}
                        Ensure you follow organizational security protocols before altering functional scopes.
                    </p>
                </div>
                <div className="ml-auto hidden md:block">
                    <Button variant="ghost" className="text-emerald-600 hover:bg-emerald-100 rounded-xl uppercase font-black text-xs tracking-widest">
                        Export Audit Log
                    </Button>
                </div>
            </div>

            {/* Focused Scope Management Modal */}
            <Modal
                isOpen={isScopeModalOpen}
                onClose={closeScopeModal}
                title="Focused Scope Configuration"
                description={`Adjusting functional authority for policy: '${editingPolicy?.permissionName}'`}
                className="max-w-4xl"
            >
                <div className="space-y-6">
                    <div className="overflow-x-auto custom-scrollbar border border-gray-100 rounded-[2.5rem]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">System Namespace</th>
                                    {actionTypes?.map((at: any) => (
                                        <th key={at.actionTypeId} className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                                            {at.actionKey}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {namespaces?.map((ns: any) => (
                                    <tr key={ns.namespaceId} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <Box className="text-gray-300" size={16} />
                                                <span className="text-xs font-black text-gray-900 uppercase tracking-tighter">{ns.namespaceKey}</span>
                                            </div>
                                        </td>
                                        {actionTypes?.map((at: any) => {
                                            const isAssigned = (allAccess || []).some(
                                                (s: any) => s.permissionId?.toString().toLowerCase() === editingPolicy?.permissionId?.toString().toLowerCase() &&
                                                    s.namespaceId?.toString().toLowerCase() === ns.namespaceId?.toString().toLowerCase() &&
                                                    s.actionTypeId?.toString().toLowerCase() === at.actionTypeId?.toString().toLowerCase()
                                            );
                                            return (
                                                <td key={at.actionTypeId} className="px-4 py-5 text-center">
                                                    <button
                                                        onClick={() => toggleScope(editingPolicy?.permissionId, ns.namespaceId, at.actionTypeId, isAssigned)}
                                                        disabled={assignScopeMutation.isPending || revokeScopeMutation.isPending}
                                                        className={cn(
                                                            "w-10 h-10 rounded-2xl border-2 flex items-center justify-center mx-auto transition-all",
                                                            isAssigned
                                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                                : "bg-white border-gray-100 text-gray-300 hover:border-gray-200"
                                                        )}
                                                    >
                                                        {isAssigned ? (
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-45"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                                        ) : (
                                                            <Box size={16} className="opacity-40" />
                                                        )}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Button
                        className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-xs"
                        onClick={closeScopeModal}
                    >
                        Commit & Close Configuration
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

const Plus = ({ size, className }: { size: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
