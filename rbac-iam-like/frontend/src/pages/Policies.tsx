import { useState, useMemo, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { ViewToolbar } from '../components/common/ViewToolbar';
import { PaginationFooter } from '../components/common/PaginationFooter';
import { useViewParams } from '../hooks/useViewParams';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Shield, Box, History, MoreHorizontal, AlertTriangle, Lock, Check, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { PolicyVersionsModal } from '../components/PolicyVersionsModal';
import { buildRegistryFromCrossProduct } from '../lib/registry';
import { convertMatrixToPolicy, validatePolicy } from '../lib/policy-engine';
import type { PermissionMatrix } from '../lib/policy-types';
import { Menu, Transition } from '@headlessui/react';

export default function Policies() {
    const queryClient = useQueryClient();
    const {
        viewMode, setViewMode,
        page: currentPage, setPage,
        pageSize, setPageSize,
        search, setSearch
    } = useViewParams();

    // Filters state
    const [usageFilter, setUsageFilter] = useState<'ALL' | 'BOUND' | 'UNBOUND'>('ALL');
    const [domainFilter, setDomainFilter] = useState<string>('');

    // Modal state
    const [editingPolicy, setEditingPolicy] = useState<any>(null);
    const [historyPolicyId, setHistoryPolicyId] = useState<string | null>(null);
    const [confirmImpactOpen, setConfirmImpactOpen] = useState(false);
    const [impactData, setImpactData] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState<any>(null);
    const [newPolicy, setNewPolicy] = useState({ permissionName: '', permissionKey: '', description: '' });

    // Data Queries
    const { data: policiesData } = useQuery({
        queryKey: ['policies', currentPage, pageSize, search, usageFilter, domainFilter],
        queryFn: () => api.policies.search({
            page: currentPage, size: pageSize, search, usage: usageFilter, domain: domainFilter
        })
    });

    const { data: namespaces } = useQuery({ queryKey: ['namespaces'], queryFn: api.namespaces.list });
    const { data: actionTypes } = useQuery({ queryKey: ['actionTypes'], queryFn: api.actionTypes.list });
    const { data: currentScope } = useQuery({
        queryKey: ['resource-access-all'],
        queryFn: api.permissions.listAllResourceAccess
    });

    // Mutations
    const sealPolicyMutation = useMutation({
        mutationFn: (data: { matrix: any, confirmImpact: boolean }) =>
            api.policies.seal(editingPolicy.permissionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            setEditingPolicy(null);
            setConfirmImpactOpen(false);
        }
    });

    const assignScopeMutation = useMutation({
        mutationFn: (data: any) => api.assignments.assignResourceAccess(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resource-access-all'] })
    });

    const revokeScopeMutation = useMutation({
        mutationFn: (data: any) => api.assignments.revokeResourceAccess(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resource-access-all'] })
    });

    const createPolicyMutation = useMutation({
        mutationFn: (data: any) => api.policies.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            setIsCreateModalOpen(false);
            setNewPolicy({ permissionName: '', permissionKey: '', description: '' });
        }
    });

    const deletePolicyMutation = useMutation({
        mutationFn: (id: string) => api.policies.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            setPolicyToDelete(null);
        }
    });

    // --- Policy Engine Logic ---
    const registry = useMemo(() => {
        if (!namespaces || !actionTypes) return {};
        return buildRegistryFromCrossProduct(namespaces, actionTypes);
    }, [namespaces, actionTypes]);

    const currentMatrix = useMemo(() => {
        if (!currentScope || !namespaces || !actionTypes || !editingPolicy) return {};
        const matrix: PermissionMatrix = {};

        namespaces.forEach((ns: any) => {
            matrix[ns.namespaceKey] = {};
            actionTypes.forEach((at: any) => matrix[ns.namespaceKey][at.actionKey] = false);
        });

        // Populate from current DB state (filtered for current editing policy)
        currentScope.forEach((scope: any) => {
            if (scope.permissionId === editingPolicy.permissionId) {
                const ns = namespaces.find((n: any) => n.namespaceId === scope.namespaceId);
                const at = actionTypes.find((a: any) => a.actionTypeId === scope.actionTypeId);
                if (ns && at) {
                    matrix[ns.namespaceKey][at.actionKey] = true;
                }
            }
        });
        return matrix;
    }, [currentScope, namespaces, actionTypes, editingPolicy]);

    const policyPreview = useMemo(() => convertMatrixToPolicy(currentMatrix, registry), [currentMatrix, registry]);
    const validationResults = useMemo(() => validatePolicy(policyPreview, registry), [policyPreview, registry]);

    const handleSealClick = async () => {
        const impact = await api.policies.getImpact(editingPolicy.permissionId);
        if (impact.boundRolesCount > 0) {
            setImpactData(impact);
            setConfirmImpactOpen(true);
        } else {
            sealPolicyMutation.mutate({ matrix: currentMatrix, confirmImpact: false });
        }
    };

    const confirmSeal = () => {
        sealPolicyMutation.mutate({ matrix: currentMatrix, confirmImpact: true });
    };

    const handleDeleteClick = (policy: any) => {
        setPolicyToDelete(policy);
    };

    const confirmDelete = () => {
        if (policyToDelete) {
            deletePolicyMutation.mutate(policyToDelete.permissionId);
        }
    };

    const toggleScope = (namespaceId: string, actionTypeId: string, isAssigned: boolean) => {
        const data = { permissionId: editingPolicy.permissionId, namespaceId, actionTypeId };
        isAssigned ? revokeScopeMutation.mutate(data) : assignScopeMutation.mutate(data);
    };

    // --- Render ---

    const policies = policiesData?.content || [];
    const totalItems = policiesData?.totalElements || 0;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Policies</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium italic">Manage IAM policies and resource scopes.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Policies</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{totalItems}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Domains</div>
                        <div className="text-xl font-black text-gray-900 leading-none">{namespaces?.length || 0}</div>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl shadow-lg shadow-primary-500/20 px-6 font-black uppercase tracking-widest text-xs h-12 text-white bg-indigo-600 hover:bg-indigo-700 transition-all">
                        <Plus size={18} className="mr-2" />
                        Add Policy
                    </Button>
                </div>
            </div>

            <ViewToolbar
                search={search}
                onSearchChange={setSearch}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                placeholder="Search policies..."
                suffix={
                    <div className="flex gap-2">
                        <select
                            className="bg-white border border-gray-200 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-100"
                            value={usageFilter}
                            onChange={(e) => setUsageFilter(e.target.value as any)}
                        >
                            <option value="ALL">All Usage</option>
                            <option value="BOUND">Bound Only</option>
                            <option value="UNBOUND">Unbound Only</option>
                        </select>
                        <select
                            className="bg-white border border-gray-200 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-100"
                            value={domainFilter}
                            onChange={(e) => setDomainFilter(e.target.value)}
                        >
                            <option value="">All Domains</option>
                            {namespaces?.map((ns: any) => (
                                <option key={ns.namespaceId} value={ns.namespaceKey}>{ns.namespaceKey}</option>
                            ))}
                        </select>
                    </div>
                }
            />

            {viewMode === 'table' ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Policy Name</th>
                                <th className="px-6 py-4">Key</th>
                                <th className="px-6 py-4">Status & Usage</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {policies.map((policy: any) => (
                                <tr key={policy.permissionId} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                                <Shield size={16} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{policy.permissionName}</div>
                                                <div className="text-[10px] text-gray-400 line-clamp-1 max-w-[200px]">{policy.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono tracking-tight">
                                            {policy.permissionKey}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-lg font-bold">
                                                {policy.resourceAccessCount || 0} Scopes
                                            </span>
                                            <span className={cn(
                                                "text-[10px] px-2 py-1 rounded-lg font-bold",
                                                (policy.attachedRoleCount || 0) > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400"
                                            )}>
                                                {policy.attachedRoleCount || 0} Roles
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-white">
                                            <Button size="sm" variant="ghost" onClick={() => setHistoryPolicyId(policy.permissionId)}>
                                                <History size={14} className="text-gray-400 hover:text-gray-600" />
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-gray-600" onClick={() => setEditingPolicy(policy)}>
                                                Example Scope
                                            </Button>
                                            {(policy.resourceAccessCount || 0) === 0 && (policy.attachedRoleCount || 0) === 0 && (
                                                <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteClick(policy)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {policies.map((policy: any) => (
                        <Card key={policy.permissionId} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <Shield size={20} />
                                    </div>
                                    <Menu as="div" className="relative">
                                        <Menu.Button className="p-1 text-gray-300 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                                            <MoreHorizontal size={16} />
                                        </Menu.Button>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 focus:outline-none z-10 p-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button onClick={() => setHistoryPolicyId(policy.permissionId)} className={cn("flex w-full items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg", active ? "bg-gray-50" : "")}>
                                                            <History size={14} /> Version History
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                                {(policy.resourceAccessCount || 0) === 0 && (policy.attachedRoleCount || 0) === 0 && (
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button onClick={() => handleDeleteClick(policy)} className={cn("flex w-full items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-rose-600", active ? "bg-rose-50" : "")}>
                                                                <Trash2 size={14} /> Delete Policy
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                )}
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{policy.permissionName}</h3>
                                <p className="text-xs text-gray-400 line-clamp-2 h-8">{policy.description}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <Button size="sm" variant="secondary" className="w-full text-xs" onClick={() => setEditingPolicy(policy)}>
                                        Configure Scope
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <PaginationFooter
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setPage}
            />

            {/* Scope Modal */}
            <Modal
                isOpen={!!editingPolicy}
                onClose={() => setEditingPolicy(null)}
                title="Resource Scope Configuration"
                description={`Adjusting authority for '${editingPolicy?.permissionName}'. Changes will create a new Policy Version.`}
                className="max-w-6xl"
            >
                <div className="grid grid-cols-12 gap-8">
                    {/* Matrix */}
                    <div className="col-span-12 lg:col-span-8 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left text-[10px] uppercase font-black text-gray-400 pb-4">Namespace</th>
                                    {actionTypes?.map((at: any) => (
                                        <th key={at.actionTypeId} className="text-center text-[10px] uppercase font-black text-gray-400 pb-4">{at.actionKey}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {namespaces?.map((ns: any) => (
                                    <tr key={ns.namespaceId} className="hover:bg-gray-50/50">
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <Box size={14} className="text-gray-300" />
                                                <span className="text-xs font-bold text-gray-700">{ns.namespaceKey}</span>
                                            </div>
                                        </td>
                                        {actionTypes?.map((at: any) => {
                                            const isActive = currentMatrix[ns.namespaceKey]?.[at.actionKey];

                                            return (
                                                <td key={at.actionTypeId} className="text-center py-2">
                                                    <button
                                                        onClick={() => toggleScope(ns.namespaceId, at.actionTypeId, isActive)}
                                                        className={cn(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all mx-auto",
                                                            isActive ? "bg-primary-500 text-white shadow-md shadow-primary-500/20" : "bg-gray-50 text-gray-300 hover:bg-gray-100"
                                                        )}
                                                    >
                                                        {isActive && <Check size={14} strokeWidth={3} />}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Preview & Action */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col h-full bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Preview</h4>
                            {validationResults.length > 0 && <span className="text-[10px] font-bold text-amber-500">{validationResults.length} Issues</span>}
                        </div>

                        <div className="flex-1 bg-gray-900 rounded-2xl p-4 overflow-hidden mb-4 relative group">
                            <pre className="font-mono text-[9px] text-emerald-400 h-full overflow-auto custom-scrollbar">
                                {JSON.stringify(policyPreview, null, 2)}
                            </pre>
                        </div>

                        <Button
                            className="w-full text-xs uppercase font-black tracking-widest h-12 rounded-xl"
                            onClick={handleSealClick}
                            disabled={sealPolicyMutation.isPending}
                        >
                            <Lock size={14} className="mr-2" />
                            {sealPolicyMutation.isPending ? 'Sealing...' : 'Seal Scope Configuration'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Confirm Impact Modal */}
            <Modal
                isOpen={confirmImpactOpen}
                onClose={() => setConfirmImpactOpen(false)}
                title="Confirm Policy Update"
                description="This policy is currently in use. Sealing a new version will affect active users."
            >
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                        <div>
                            <h4 className="text-sm font-bold text-amber-900">Impact Analysis</h4>
                            <div className="mt-2 space-y-1 text-xs text-amber-800">
                                <div>• <b>{impactData?.boundRolesCount} roles</b> currently use this policy.</div>
                                <div>• <b>{impactData?.affectedUsersCount} users</b> will inherit these changes immediately.</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setConfirmImpactOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmSeal} disabled={sealPolicyMutation.isPending}>
                        {sealPolicyMutation.isPending ? 'Processing...' : 'Confirm & Seal'}
                    </Button>
                </div>
            </Modal>

            {/* History Modal */}
            <PolicyVersionsModal
                isOpen={!!historyPolicyId}
                onClose={() => setHistoryPolicyId(null)}
                policyId={historyPolicyId}
            />

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create Internal IAM Policy"
                description="Define a new logical permission structure."
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Friendly Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Sales Management"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            value={newPolicy.permissionName}
                            onChange={e => setNewPolicy({ ...newPolicy, permissionName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Unique Policy Key</label>
                        <input
                            type="text"
                            placeholder="e.g. SALES_MGMT"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-primary-100 outline-none transition-all uppercase"
                            value={newPolicy.permissionKey}
                            onChange={e => setNewPolicy({ ...newPolicy, permissionKey: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
                        />
                        <p className="mt-1 text-[9px] text-gray-400">Used for technical references in codebase and JSON documents.</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                        <textarea
                            placeholder="Describe what authority this policy governs..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-100 outline-none transition-all min-h-[100px]"
                            value={newPolicy.description}
                            onChange={e => setNewPolicy({ ...newPolicy, description: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button
                            className="flex-1 rounded-xl font-black uppercase tracking-widest text-xs"
                            onClick={() => createPolicyMutation.mutate(newPolicy)}
                            disabled={!newPolicy.permissionName || !newPolicy.permissionKey || createPolicyMutation.isPending}
                        >
                            {createPolicyMutation.isPending ? 'Propagating...' : 'Create Policy'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Permanent Deletion Modal */}
            <Modal
                isOpen={!!policyToDelete}
                onClose={() => setPolicyToDelete(null)}
                title="Confirm Policy Deletion"
                description={`This will permanently remove '${policyToDelete?.permissionName}' and all of its version history.`}
            >
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-rose-500">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <div className="text-sm font-black text-rose-900 uppercase tracking-widest">Danger Zone</div>
                            <div className="text-[10px] text-rose-600 font-bold">This operation is irreversible.</div>
                        </div>
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                        You are about to delete an IAM logical policy. Since it has <b>0 scopes</b> and <b>0 mapped roles</b>, it is safe to remove, but you will lose the historical configuration data associated with it.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setPolicyToDelete(null)}>Cancel</Button>
                    <Button
                        variant="destructive"
                        className="flex-1 rounded-xl font-black uppercase tracking-widest text-xs"
                        onClick={confirmDelete}
                        disabled={deletePolicyMutation.isPending}
                    >
                        {deletePolicyMutation.isPending ? 'Purging...' : 'Permanently Delete'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
