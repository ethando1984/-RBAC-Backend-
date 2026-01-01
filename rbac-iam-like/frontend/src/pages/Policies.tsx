import { FileKey, Plus, Trash2, Edit, Fingerprint, Type, ShieldCheck, Box, Activity, Settings2, Link, AlertTriangle, Lock, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '../lib/utils';
import { useViewParams } from '../hooks/useViewParams';
import { PageHeader } from '../components/common/PageHeader';
import { ViewToolbar } from '../components/common/ViewToolbar';
import { PaginationFooter } from '../components/common/PaginationFooter';

export default function Policies() {
    const queryClient = useQueryClient();
    const { page, pageSize, viewMode, search, setPage, setPageSize, setViewMode, setSearch } = useViewParams();

    // Custom filters
    const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
    const [usageFilter, setUsageFilter] = useState<'all' | 'bound' | 'unbound'>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<any>(null);
    const [formData, setFormData] = useState({ permissionName: '', permissionKey: '', description: '' });
    const [sealResult, setSealResult] = useState<any>(null);
    const [isSealModalOpen, setIsSealModalOpen] = useState(false);

    const { data: policies, isLoading } = useQuery({
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

    const { data: currentScope } = useQuery({
        queryKey: ['resource-access', editingPolicy?.permissionId],
        queryFn: () => api.permissions.getResourceAccess(editingPolicy?.permissionId),
        enabled: !!editingPolicy && isScopeModalOpen
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.permissions.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.permissions.update(data.permissionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.permissions.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
    });

    const assignScopeMutation = useMutation({
        mutationFn: (data: any) => api.assignments.assignResourceAccess(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-access', editingPolicy?.permissionId] });
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
    });

    const revokeScopeMutation = useMutation({
        mutationFn: (data: any) => api.assignments.revokeResourceAccess(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-access', editingPolicy?.permissionId] });
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
    });

    const sealPolicyMutation = useMutation({
        mutationFn: ({ permissionId, scopeMatrix }: { permissionId: string, scopeMatrix: any }) =>
            api.policies.seal(permissionId, scopeMatrix),
        onSuccess: (data) => {
            setSealResult(data);
            setIsSealModalOpen(true);
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
    });

    const openModal = (policy?: any) => {
        if (policy) {
            setEditingPolicy(policy);
            setFormData({
                permissionName: policy.permissionName,
                permissionKey: policy.permissionKey,
                description: policy.description || ''
            });
        } else {
            setEditingPolicy(null);
            setFormData({ permissionName: '', permissionKey: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const openScopeModal = (policy: any) => {
        setEditingPolicy(policy);
        setIsScopeModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsScopeModalOpen(false);
        setEditingPolicy(null);
        setFormData({ permissionName: '', permissionKey: '', description: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPolicy) {
            updateMutation.mutate({ ...formData, permissionId: editingPolicy.permissionId });
        } else {
            createMutation.mutate(formData);
        }
    };

    const toggleScope = (namespaceId: string, actionTypeId: string, isAssigned: boolean) => {
        const data = {
            permissionId: editingPolicy.permissionId,
            namespaceId,
            actionTypeId
        };
        if (isAssigned) {
            revokeScopeMutation.mutate(data);
        } else {
            assignScopeMutation.mutate(data);
        }
    };

    const handleSealPolicy = () => {
        if (!editingPolicy || !currentScope) return;

        // Build the scope matrix from currentScope
        // Format: {  namespace_key: { action_key: true/false } }
        const scopeMatrix: any = {};

        namespaces?.forEach((ns: any) => {
            const nsKey = ns.namespaceKey;
            scopeMatrix[nsKey] = {};

            actionTypes?.forEach((at: any) => {
                const isAssigned = currentScope.some(
                    (s: any) => s.namespaceId === ns.namespaceId && s.actionTypeId === at.actionTypeId
                );
                scopeMatrix[nsKey][at.actionKey] = isAssigned;
            });
        });

        sealPolicyMutation.mutate({
            permissionId: editingPolicy.permissionId,
            scopeMatrix
        });
    };

    const filteredPolicies = (policies || []).filter((p: any) => {
        const matchesSearch = (p.permissionName?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (p.permissionKey?.toLowerCase() || '').includes(search.toLowerCase());

        const matchesNamespace = selectedNamespace === 'all' || (p.permissionKey?.toLowerCase() || '').startsWith(selectedNamespace.toLowerCase().split(':')[0]);
        // Note: The above is a heuristic since we don't have many-to-many filter on list yet.

        const matchesUsage = usageFilter === 'all' ||
            (usageFilter === 'bound' && p.resourceAccessCount > 0) ||
            (usageFilter === 'unbound' && p.resourceAccessCount === 0);

        return matchesSearch && matchesNamespace && matchesUsage;
    });

    const totalItems = filteredPolicies.length;
    const paginatedPolicies = filteredPolicies.slice((page - 1) * pageSize, page * pageSize);

    const PolicyActionMenu = ({ policy }: { policy: any }) => (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-white transition-all outline-none">
                <Settings2 size={20} />
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
                <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-1.5 z-10 outline-none">
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => openScopeModal(policy)}
                                className={cn(
                                    "flex items-center w-full px-3 py-2.5 text-xs font-bold rounded-xl transition-all gap-3 uppercase tracking-wider text-primary-600",
                                    active ? "bg-primary-50" : ""
                                )}
                            >
                                <ShieldCheck size={16} /> Edit Resource Scope
                            </button>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => openModal(policy)}
                                className={cn(
                                    "flex items-center w-full px-3 py-2.5 text-xs font-bold rounded-xl transition-all gap-3 uppercase tracking-wider",
                                    active ? "bg-gray-50 text-gray-900" : "text-gray-600"
                                )}
                            >
                                <Edit size={16} /> Edit Metadata
                            </button>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => { if (confirm('Delete this policy definition permanently?')) deleteMutation.mutate(policy.permissionId) }}
                                className={cn(
                                    "flex items-center w-full px-3 py-2.5 text-xs font-bold rounded-xl transition-all gap-3 uppercase tracking-wider text-rose-500",
                                    active ? "bg-rose-50" : ""
                                )}
                            >
                                <Trash2 size={16} /> Purge Policy
                            </button>
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Policies"
                description="Fine-grained access control definitions"
                action={
                    <Button className="gap-2" onClick={() => openModal()}>
                        <Plus size={18} /> Create Policy
                    </Button>
                }
            />

            <div className="space-y-4">
                <ViewToolbar
                    search={search}
                    onSearchChange={setSearch}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                    placeholder="Filter definitions by name or key..."
                />

                {/* Extended Filters */}
                <Card className="px-4 py-3 bg-gray-50/50 border-gray-100">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Usage:</span>
                            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-100">
                                {(['all', 'bound', 'unbound'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setUsageFilter(type)}
                                        className={cn(
                                            "px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all",
                                            usageFilter === type ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Domain:</span>
                            <select
                                value={selectedNamespace}
                                onChange={e => setSelectedNamespace(e.target.value)}
                                className="bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-600 focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer min-w-[120px]"
                            >
                                <option value="all">Every Domain</option>
                                {namespaces?.map((ns: any) => (
                                    <option key={ns.namespaceId} value={ns.namespaceKey}>{ns.namespaceKey}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' ? (
                            <Card className="overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-50 bg-gray-50/30">
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Policy Name</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Key</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {paginatedPolicies.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">
                                                        No policies found matching your criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedPolicies.map((p: any) => (
                                                    <tr key={p.permissionId} className="group hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2.5 rounded-xl bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                                                    <FileKey size={18} />
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm font-bold text-gray-900 tracking-tight block">{p.permissionName}</span>
                                                                    <span className="text-[10px] text-gray-400 font-medium line-clamp-1 max-w-[200px]">{p.description || 'No description'}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <code className="text-[10px] text-primary-600 font-black tracking-widest uppercase bg-primary-50 px-2 py-1 rounded-lg border border-primary-100">
                                                                {p.permissionKey}
                                                            </code>
                                                        </td>
                                                        <td className="px-6 py-4 hidden md:table-cell">
                                                            <div className="flex items-center gap-2">
                                                                {p.resourceAccessCount > 0 && (
                                                                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                                                        <Activity size={10} strokeWidth={3} /> {p.resourceAccessCount} Scopes
                                                                    </span>
                                                                )}
                                                                {p.attachedRoleCount > 0 ? (
                                                                    <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                                                                        <Link size={10} strokeWidth={3} /> {p.attachedRoleCount} {p.attachedRoleCount === 1 ? 'Role' : 'Roles'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-lg italic">
                                                                        Unbound
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <PolicyActionMenu policy={p} />
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        ) : (
                            // Card View (Similar to previous implementation)
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedPolicies.map((p: any) => (
                                    <Card key={p.permissionId} className="hover:shadow-xl transition-all duration-300 group">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all shadow-sm">
                                                    <FileKey size={22} />
                                                </div>
                                                <PolicyActionMenu policy={p} />
                                            </div>

                                            <div className="mb-4">
                                                <h3 className="text-sm font-extrabold text-gray-900 tracking-tight mb-1">{p.permissionName}</h3>
                                                <p className="text-[11px] text-gray-400 font-medium line-clamp-1">{p.description || 'No formal description provided.'}</p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Key</span>
                                                    <code className="text-[9px] text-primary-600 font-black tracking-widest uppercase bg-primary-50 px-2 py-0.5 rounded-md">
                                                        {p.permissionKey}
                                                    </code>
                                                </div>
                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                                    {p.resourceAccessCount > 0 && (
                                                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                                                            <Activity size={10} strokeWidth={3} /> {p.resourceAccessCount} Scopes
                                                        </span>
                                                    )}
                                                    {p.attachedRoleCount > 0 ? (
                                                        <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                                                            <Link size={10} strokeWidth={3} /> {p.attachedRoleCount} Roles
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded-md italic">
                                                            Unbound
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <PaginationFooter
                            currentPage={page}
                            pageSize={pageSize}
                            totalItems={totalItems}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </div>

            {/* Policy Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingPolicy ? "Modify Definition" : "Construct Access Policy"}
                description={editingPolicy ? "Update the functional naming and key identifier for this policy." : "Define a new granular access rule for system resources."}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-primary-500/80">Policy Label</label>
                        <div className="relative group">
                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                required
                                type="text"
                                value={formData.permissionName}
                                onChange={e => setFormData({ ...formData, permissionName: e.target.value })}
                                placeholder="e.g. User Management Read"
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-primary-500/80">Internal Identification Key</label>
                        <div className="relative group">
                            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                required
                                type="text"
                                value={formData.permissionKey}
                                onChange={e => setFormData({ ...formData, permissionKey: e.target.value })}
                                placeholder="e.g. users:READ"
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-primary-600 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none uppercase tracking-wider"
                            />
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold px-1 italic">Format typically: namespace:ACTION_TYPE</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-primary-500/80">Functional Narrative</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detail the exact purpose and constraints of this policy..."
                            rows={3}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none resize-none"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={closeModal}>Dismiss</Button>
                        <Button
                            type="submit"
                            className="flex-1 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingPolicy ? "Apply Definition" : "Commit Policy"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Scope Management Modal */}
            <Modal
                isOpen={isScopeModalOpen}
                onClose={closeModal}
                title="Resource Scope Configuration"
                description={`Define which functional domains and action types are governed by the '${editingPolicy?.permissionName}' policy.`}
                className="max-w-4xl"
            >
                <div className="space-y-6">
                    <div className="overflow-x-auto custom-scrollbar border border-gray-100 rounded-[2.5rem]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">System Namespace</th>
                                    {actionTypes?.map((at: any) => (
                                        <th key={at.actionTypeId} className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center min-w-[80px]">
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
                                            const isAssigned = (currentScope || []).some(
                                                (s: any) => s.namespaceId === ns.namespaceId && s.actionTypeId === at.actionTypeId
                                            );
                                            return (
                                                <td key={at.actionTypeId} className="px-4 py-5 text-center">
                                                    <button
                                                        onClick={() => toggleScope(ns.namespaceId, at.actionTypeId, isAssigned)}
                                                        className={cn(
                                                            "w-10 h-10 rounded-2xl border-2 flex items-center justify-center mx-auto transition-all",
                                                            isAssigned
                                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                                : "bg-white border-gray-100 text-gray-300 hover:border-gray-200"
                                                        )}
                                                    >
                                                        {isAssigned ? <Plus size={20} className="rotate-45" /> : <Box size={16} className="opacity-40" />}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100/50 p-6 rounded-3xl flex gap-4">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl h-fit">
                            <AlertTriangle size={18} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Least Privilege Enforcement</h4>
                            <p className="text-[11px] text-amber-700/80 font-medium leading-relaxed italic">
                                Changes to this matrix will immediately impact the effective authority of all users inheriting this policy via assigned roles.
                                Ensure minimal necessary permissions are granted to prevent unauthorized lateral movement.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-xs"
                            onClick={closeModal}
                        >
                            Close
                        </Button>
                        <Button
                            className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20 gap-2"
                            onClick={handleSealPolicy}
                            disabled={sealPolicyMutation.isPending}
                        >
                            <Lock size={16} />
                            {sealPolicyMutation.isPending ? 'Sealing...' : 'Seal Policy'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Seal Success Modal */}
            <Modal
                isOpen={isSealModalOpen}
                onClose={() => { setIsSealModalOpen(false); setSealResult(null); }}
                title="Policy Sealed Successfully"
                description="The resource scope configuration has been converted to an AWS IAM-style policy document."
                className="max-w-4xl"
            >
                {sealResult && (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl flex items-start gap-4">
                            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                                <CheckCircle2 size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Configuration Sealed</h3>
                                <p className="text-xs text-emerald-700 font-medium mt-1">
                                    {sealResult.message}
                                </p>
                                {sealResult.affectedRoles > 0 && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                            {sealResult.affectedRoles} {sealResult.affectedRoles === 1 ? 'Role' : 'Roles'} Affected
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Generated Policy Document</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 text-xs"
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(sealResult.policyDocument, null, 2));
                                        alert('Policy JSON copied to clipboard!');
                                    }}
                                >
                                    <Copy size={14} /> Copy JSON
                                </Button>
                            </div>
                            <div className="bg-gray-900 text-gray-100 p-6 rounded-2xl overflow-auto max-h-96 custom-scrollbar">
                                <pre className="text-xs font-mono leading-relaxed">
                                    {JSON.stringify(sealResult.policyDocument, null, 2)}
                                </pre>
                            </div>
                        </div>

                        <div className="bg-amber-50/50 border border-amber-100/50 p-5 rounded-3xl">
                            <div className="flex gap-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl h-fit">
                                    <AlertTriangle size={16} />
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Policy Active</h5>
                                    <p className="text-[11px] text-amber-700/80 font-medium leading-relaxed mt-1">
                                        This policy is now active and will be evaluated immediately for all users with roles that have this permission assigned.
                                        All access decisions will follow AWS IAM evaluation logic: <strong>Explicit Deny &gt; Allow &gt; Default Deny</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20"
                            onClick={() => { setIsSealModalOpen(false); setSealResult(null); closeModal(); }}
                        >
                            Close & Return
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
