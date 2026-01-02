import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useState, Fragment } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Box, Activity, Plus, Edit, Trash2, Info, MoreHorizontal } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '../../lib/utils';

export function NamespaceActionManager() {
    const queryClient = useQueryClient();
    const [isNamespaceModalOpen, setIsNamespaceModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [nsForm, setNsForm] = useState({ namespaceKey: '', description: '' });
    const [atForm, setAtForm] = useState({ actionKey: '', description: '' });

    // Queries
    const { data: namespaces, isLoading: isLoadingNS } = useQuery({
        queryKey: ['namespaces'],
        queryFn: api.namespaces.list
    });

    const { data: actionTypes, isLoading: isLoadingAT } = useQuery({
        queryKey: ['actionTypes'],
        queryFn: api.actionTypes.list
    });

    // Namespace Mutations
    const nsMutation = useMutation({
        mutationFn: (data: any) => editingItem ? api.namespaces.update(editingItem.namespaceId, data) : api.namespaces.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['namespaces'] });
            closeModals();
        }
    });

    const deleteNSMutation = useMutation({
        mutationFn: (id: string) => api.namespaces.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['namespaces'] })
    });

    const atMutation = useMutation({
        mutationFn: (data: any) => editingItem ? api.actionTypes.update(editingItem.actionTypeId, data) : api.actionTypes.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actionTypes'] });
            closeModals();
        }
    });

    const deleteATMutation = useMutation({
        mutationFn: (id: string) => api.actionTypes.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actionTypes'] })
    });

    const openNSModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setNsForm({ namespaceKey: item.namespaceKey, description: item.description || '' });
        } else {
            setEditingItem(null);
            setNsForm({ namespaceKey: '', description: '' });
        }
        setIsNamespaceModalOpen(true);
    };

    const openATModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setAtForm({ actionKey: item.actionKey, description: item.description || '' });
        } else {
            setEditingItem(null);
            setAtForm({ actionKey: '', description: '' });
        }
        setIsActionModalOpen(true);
    };

    const closeModals = () => {
        setIsNamespaceModalOpen(false);
        setIsActionModalOpen(false);
        setEditingItem(null);
    };

    const handleNSSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        nsMutation.mutate(nsForm);
    };

    const handleATSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        atMutation.mutate(atForm);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Namespaces Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                                <Box size={20} />
                            </div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Resource Namespaces</h2>
                        </div>
                        <Button size="sm" variant="outline" className="gap-2 rounded-xl" onClick={() => openNSModal()}>
                            <Plus size={16} /> Add Domain
                        </Button>
                    </div>

                    <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-0">
                            {isLoadingNS ? (
                                <div className="py-12 flex justify-center"><Activity className="animate-spin text-primary-500" /></div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Namespace Key</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {namespaces?.map((ns: any) => (
                                            <tr key={ns.namespaceId} className="group hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">{ns.namespaceKey}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{ns.description || 'No description'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Menu as="div" className="relative inline-block text-left">
                                                        <Menu.Button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
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
                                                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 focus:outline-none z-10 p-1.5 overflow-hidden">
                                                                <Menu.Item>
                                                                    {({ active }) => (
                                                                        <button
                                                                            onClick={() => openNSModal(ns)}
                                                                            className={cn(
                                                                                "flex w-full items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-colors",
                                                                                active ? "bg-primary-50 text-primary-700" : "text-gray-600"
                                                                            )}
                                                                        >
                                                                            <Edit size={14} /> Edit Domain
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                                <div className="h-px bg-gray-50 my-1" />
                                                                <Menu.Item>
                                                                    {({ active }) => (
                                                                        <button
                                                                            onClick={() => { if (confirm('Delete domain?')) deleteNSMutation.mutate(ns.namespaceId) }}
                                                                            className={cn(
                                                                                "flex w-full items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-colors",
                                                                                active ? "bg-rose-50 text-rose-700" : "text-rose-600"
                                                                            )}
                                                                        >
                                                                            <Trash2 size={14} /> Delete Domain
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                            </Menu.Items>
                                                        </Transition>
                                                    </Menu>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Action Types Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Activity size={20} />
                            </div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Action Types</h2>
                        </div>
                        <Button size="sm" variant="outline" className="gap-2 rounded-xl" onClick={() => openATModal()}>
                            <Plus size={16} /> Add Action
                        </Button>
                    </div>

                    <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-0">
                            {isLoadingAT ? (
                                <div className="py-12 flex justify-center"><Activity className="animate-spin text-indigo-500" /></div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action Key</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {actionTypes?.map((at: any) => (
                                            <tr key={at.actionTypeId} className="group hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">{at.actionKey}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{at.description || 'No description'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Menu as="div" className="relative inline-block text-left">
                                                        <Menu.Button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
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
                                                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 focus:outline-none z-10 p-1.5 overflow-hidden">
                                                                <Menu.Item>
                                                                    {({ active }) => (
                                                                        <button
                                                                            onClick={() => openATModal(at)}
                                                                            className={cn(
                                                                                "flex w-full items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-colors",
                                                                                active ? "bg-indigo-50 text-indigo-700" : "text-gray-600"
                                                                            )}
                                                                        >
                                                                            <Edit size={14} /> Edit Action
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                                <div className="h-px bg-gray-50 my-1" />
                                                                <Menu.Item>
                                                                    {({ active }) => (
                                                                        <button
                                                                            onClick={() => { if (confirm('Delete action?')) deleteATMutation.mutate(at.actionTypeId) }}
                                                                            className={cn(
                                                                                "flex w-full items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-colors",
                                                                                active ? "bg-rose-50 text-rose-700" : "text-rose-600"
                                                                            )}
                                                                        >
                                                                            <Trash2 size={14} /> Delete Action
                                                                        </button>
                                                                    )}
                                                                </Menu.Item>
                                                            </Menu.Items>
                                                        </Transition>
                                                    </Menu>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2.5rem] flex items-start gap-4">
                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                    <Info size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">System Core Warning</h3>
                    <p className="text-xs text-amber-700 font-medium mt-2 leading-relaxed">
                        Namespaces and Action Types are the foundation of your Security Policy language.
                        Modifying or deleting these values will impact <b>every</b> policy that references them.
                        Exercise extreme caution when making changes to established keys.
                    </p>
                </div>
            </div>

            {/* Namespace Modal */}
            <Modal
                isOpen={isNamespaceModalOpen}
                onClose={closeModals}
                title={editingItem ? "Edit Namespace Domain" : "Register Resource Domain"}
                description="Define the logical boundary for resource access control."
            >
                <form onSubmit={handleNSSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Domain Key</label>
                        <input
                            required
                            type="text"
                            value={nsForm.namespaceKey}
                            onChange={e => setNsForm({ ...nsForm, namespaceKey: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                            placeholder="e.g. inventory_service"
                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Friendly Description</label>
                        <textarea
                            value={nsForm.description}
                            onChange={e => setNsForm({ ...nsForm, description: e.target.value })}
                            placeholder="Describe what resources this namespace protects..."
                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none h-24 resize-none"
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={closeModals}>Cancel</Button>
                        <Button type="submit" className="flex-1 rounded-xl font-black uppercase tracking-widest text-xs" disabled={nsMutation.isPending}>
                            {nsMutation.isPending ? 'Syncing...' : (editingItem ? 'Update Domain' : 'Register Domain')}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Action Type Modal */}
            <Modal
                isOpen={isActionModalOpen}
                onClose={closeModals}
                title={editingItem ? "Edit Functional Action" : "Register Functional Action"}
                description="Define a reusable operator for resource interactions (e.g. READ, WRITE, EXEC)."
            >
                <form onSubmit={handleATSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Action Key</label>
                        <input
                            required
                            type="text"
                            value={atForm.actionKey}
                            onChange={e => setAtForm({ ...atForm, actionKey: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })}
                            placeholder="e.g. DELETE"
                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Description</label>
                        <textarea
                            value={atForm.description}
                            onChange={e => setAtForm({ ...atForm, description: e.target.value })}
                            placeholder="Describe what high-level operation this action represents..."
                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none h-24 resize-none"
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={closeModals}>Cancel</Button>
                        <Button type="submit" className="flex-1 rounded-xl font-black uppercase tracking-widest text-xs" disabled={atMutation.isPending}>
                            {atMutation.isPending ? 'Syncing...' : (editingItem ? 'Update Action' : 'Register Action')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
