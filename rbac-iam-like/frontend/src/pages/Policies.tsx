import { FileKey, Plus, Search, Trash2, Edit, Fingerprint, Type, ShieldCheck, Box, Activity, Settings2, X, Link, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '../lib/utils';

export default function Policies() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
    const [usageFilter, setUsageFilter] = useState<'all' | 'bound' | 'unbound'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<any>(null);
    const [formData, setFormData] = useState({ permissionName: '', permissionKey: '', description: '' });

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

    const filteredPolicies = (policies || []).filter((p: any) => {
        const matchesSearch = (p.permissionName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (p.permissionKey?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesNamespace = selectedNamespace === 'all' || (p.permissionKey?.toLowerCase() || '').startsWith(selectedNamespace.toLowerCase().split(':')[0]);
        // Note: The above is a heuristic since we don't have many-to-many filter on list yet.

        const matchesUsage = usageFilter === 'all' ||
            (usageFilter === 'bound' && p.resourceAccessCount > 0) ||
            (usageFilter === 'unbound' && p.resourceAccessCount === 0);

        return matchesSearch && matchesNamespace && matchesUsage;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedNamespace('all');
        setUsageFilter('all');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Policies</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Fine-grained access control definitions</p>
                </div>
                <Button className="gap-2" onClick={() => openModal()}>
                    <Plus size={18} /> Create Policy
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-4 pt-6 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold" size={16} />
                            <input
                                type="text"
                                placeholder="Filter definitions by name or key..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
                            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
                                {(['all', 'bound', 'unbound'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setUsageFilter(type)}
                                        className={cn(
                                            "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                            usageFilter === type ? "bg-white text-primary-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <select
                                value={selectedNamespace}
                                onChange={e => setSelectedNamespace(e.target.value)}
                                className="bg-gray-50 border-none rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer min-w-[120px]"
                            >
                                <option value="all">Every Domain</option>
                                {namespaces?.map((ns: any) => (
                                    <option key={ns.namespaceId} value={ns.namespaceKey}>{ns.namespaceKey}</option>
                                ))}
                            </select>

                            {(searchTerm || selectedNamespace !== 'all' || usageFilter !== 'all') && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-rose-500 h-9 w-9 p-0 rounded-xl">
                                    <X size={16} />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    {isLoading ? (
                        <div className="py-20 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredPolicies.map((p: any) => (
                                <div key={p.permissionId} className="flex items-center justify-between px-6 py-5 hover:bg-gray-50/50 transition-colors group">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all shadow-sm">
                                            <FileKey size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">{p.permissionName}</h3>
                                            <p className="text-[11px] text-gray-400 font-medium mb-1 line-clamp-1">{p.description || 'No formal description provided.'}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <code className="text-[10px] text-primary-600 font-black tracking-widest uppercase bg-primary-50 px-2 py-0.5 rounded-md">
                                                    {p.permissionKey}
                                                </code>
                                                {p.resourceAccessCount > 0 && (
                                                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                                                        <Activity size={10} strokeWidth={3} /> {p.resourceAccessCount} Scopes
                                                    </span>
                                                )}
                                                {p.attachedRoleCount > 0 ? (
                                                    <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                                                        <Link size={10} strokeWidth={3} /> Bound to {p.attachedRoleCount} {p.attachedRoleCount === 1 ? 'Role' : 'Roles'}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded-md italic">
                                                        <Link size={10} strokeWidth={3} /> Unbound
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Menu as="div" className="relative">
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
                                                                onClick={() => openScopeModal(p)}
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
                                                                onClick={() => openModal(p)}
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
                                                                onClick={() => { if (confirm('Delete this policy definition permanently?')) deleteMutation.mutate(p.permissionId) }}
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
                                    </div>
                                </div>
                            ))}
                            {filteredPolicies.length === 0 && (
                                <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs italic">
                                    No policy definitions matching criteria
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

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

                    <Button className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20" onClick={closeModal}>
                        Seal Scope Configuration
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
