import { ShieldCheck, Plus, ExternalLink, Settings2, Trash2, Edit, FileText, Info, FileKey, CheckSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
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

export default function Roles() {
    const queryClient = useQueryClient();
    const { page, pageSize, viewMode, search, setPage, setPageSize, setViewMode, setSearch } = useViewParams();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [formData, setFormData] = useState({ roleName: '', description: '' });

    const { data: rolesData, isLoading } = useQuery({
        queryKey: ['roles', page, pageSize, search],
        queryFn: () => api.roles.list({ page, size: pageSize, search })
    });

    const { data: allPermissions } = useQuery({
        queryKey: ['permissions'],
        queryFn: api.permissions.list,
        enabled: isPermissionsModalOpen
    });

    const { data: currentRolePermissions } = useQuery({
        queryKey: ['role-permissions', editingRole?.roleId],
        queryFn: () => api.roles.listPermissions(editingRole?.roleId),
        enabled: !!editingRole && isPermissionsModalOpen
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.roles.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.roles.update(data.roleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (roleId: string) => api.roles.delete(roleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        }
    });

    const assignPermissionMutation = useMutation({
        mutationFn: ({ roleId, permissionId }: { roleId: string, permissionId: string }) => api.assignments.assignPermission(roleId, permissionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['role-permissions', editingRole?.roleId] });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        }
    });

    const revokePermissionMutation = useMutation({
        mutationFn: ({ roleId, permissionId }: { roleId: string, permissionId: string }) => api.assignments.revokePermission(roleId, permissionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['role-permissions', editingRole?.roleId] });
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        }
    });

    const openModal = (role?: any) => {
        if (role) {
            setEditingRole(role);
            setFormData({ roleName: role.roleName, description: role.description || '' });
        } else {
            setEditingRole(null);
            setFormData({ roleName: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const openPermissionsModal = (role: any) => {
        setEditingRole(role);
        setIsPermissionsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsPermissionsModalOpen(false);
        setEditingRole(null);
        setFormData({ roleName: '', description: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRole) {
            updateMutation.mutate({ ...formData, roleId: editingRole.roleId });
        } else {
            createMutation.mutate(formData);
        }
    };

    const togglePermission = (permissionId: string, isAssigned: boolean) => {
        if (isAssigned) {
            revokePermissionMutation.mutate({ roleId: editingRole.roleId, permissionId });
        } else {
            assignPermissionMutation.mutate({ roleId: editingRole.roleId, permissionId });
        }
    };

    const isServerSide = rolesData && !Array.isArray(rolesData) && 'content' in rolesData;
    const rawRoles = isServerSide ? rolesData.content : (Array.isArray(rolesData) ? rolesData : []);
    const rawTotal = isServerSide ? rolesData.totalElements : rawRoles.length;

    let paginatedRoles = rawRoles;
    let totalItems = rawTotal;

    if (!isServerSide) {
        const filtered = rawRoles.filter((r: any) =>
            r.roleName.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase())
        );
        totalItems = filtered.length;
        paginatedRoles = filtered.slice((page - 1) * pageSize, page * pageSize);
    }

    const RoleActionMenu = ({ role }: { role: any }) => (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-white transition-all outline-none">
                <Settings2 size={18} />
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
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-1.5 z-10 outline-none">
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => openModal(role)}
                                className={cn(
                                    "flex items-center w-full px-3 py-2.5 text-xs font-bold rounded-xl transition-all gap-3 uppercase tracking-wider",
                                    active ? "bg-primary-50 text-primary-600" : "text-gray-600"
                                )}
                            >
                                <Edit size={16} /> Edit Profile
                            </button>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => openPermissionsModal(role)}
                                className={cn(
                                    "flex items-center w-full px-3 py-2.5 text-xs font-bold rounded-xl transition-all gap-3 uppercase tracking-wider",
                                    active ? "bg-primary-50 text-primary-600" : "text-gray-600"
                                )}
                            >
                                <FileKey size={16} /> Manage Policies
                            </button>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => { if (confirm('Are you sure you want to delete this role authority?')) deleteMutation.mutate(role.roleId) }}
                                className={cn(
                                    "flex items-center w-full px-3 py-2.5 text-xs font-bold rounded-xl transition-all gap-3 uppercase tracking-wider text-rose-500",
                                    active ? "bg-rose-50" : ""
                                )}
                            >
                                <Trash2 size={16} /> Remove Authority
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
                title="Roles"
                description="Define and assign permission sets"
                action={
                    <Button className="gap-2" onClick={() => openModal()}>
                        <Plus size={18} /> Create Role
                    </Button>
                }
            />

            <ViewToolbar
                search={search}
                onSearchChange={setSearch}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                placeholder="Search roles by name or description..."
            />

            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="py-24 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' ? (
                            <Card className="overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-50 bg-gray-50/30">
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Role Name</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Policies</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">Description</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {paginatedRoles.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">
                                                        No roles found matching your criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedRoles.map((role: any) => (
                                                    <tr key={role.roleId} className="group hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                                                                    <ShieldCheck size={18} />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-bold text-gray-900 tracking-tight">{role.roleName}</span>
                                                                        <Badge variant={role.roleName.includes('Admin') ? 'default' : 'secondary'} className="rounded py-0 px-1.5 text-[8px] uppercase">
                                                                            {role.roleName.includes('Admin') ? 'Sys' : 'Def'}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {role.permissions?.length > 0 ? (
                                                                    role.permissions.slice(0, 2).map((p: any) => (
                                                                        <span key={p.permissionId} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                                                                            {p.permissionName}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-[10px] text-gray-300 italic font-medium">No policies</span>
                                                                )}
                                                                {role.permissions?.length > 2 && (
                                                                    <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-[10px] font-bold">+{role.permissions.length - 2}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 hidden md:table-cell">
                                                            <p className="text-xs text-gray-500 font-medium truncate max-w-xs">{role.description || '-'}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <RoleActionMenu role={role} />
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        ) : (
                            // Card View (Original Layout Adapted)
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedRoles.map((role: any) => (
                                    <Card key={role.roleId} className="hover:border-primary-200 transition-colors group relative flex flex-col hover:shadow-lg duration-300">
                                        <CardHeader className="flex-row items-start justify-between pb-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <ShieldCheck size={18} className="text-primary-500" />
                                                    <CardTitle className="text-lg">{role.roleName}</CardTitle>
                                                </div>
                                                <Badge variant={role.roleName.includes('Admin') ? 'default' : 'secondary'} className="rounded-lg text-[10px] h-5 px-3 font-black tracking-widest uppercase">
                                                    {role.roleName.includes('Admin') ? 'System Authority' : 'Custom Definition'}
                                                </Badge>
                                            </div>
                                            <RoleActionMenu role={role} />
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col">
                                            <p className="text-sm text-gray-500 mb-6 min-h-[48px] leading-relaxed font-medium">
                                                {role.description || <span className="text-gray-300 italic">This authority set has no official documentation.</span>}
                                            </p>
                                            <div className="mt-auto space-y-4">
                                                <div className="flex flex-wrap gap-1.5 h-16 overflow-hidden content-start">
                                                    {role.permissions?.length > 0 ? (
                                                        role.permissions.map((p: any) => (
                                                            <span key={p.permissionId} className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-[9px] font-black uppercase tracking-widest border border-primary-100">
                                                                {p.permissionName}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-gray-300 italic">No policies attached.</span>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => openPermissionsModal(role)}
                                                    className="w-full gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary-600 h-11 shadow-sm"
                                                >
                                                    Policies & Permissions <ExternalLink size={14} />
                                                </Button>
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

            {/* Role Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingRole ? "Reconfigure Authority" : "Define New Authority Set"}
                description={editingRole ? "Modify the metadata for this existing system role." : "Initialize a new collection of system permissions."}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Authority Name</label>
                        <div className="relative group">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                required
                                type="text"
                                value={formData.roleName}
                                onChange={e => setFormData({ ...formData, roleName: e.target.value })}
                                placeholder="e.g. INFRASTRUCTURE_MANAGER"
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Functional Description</label>
                        <div className="relative group">
                            <Info className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Briefly explain the scope of this authority set..."
                                className="w-full bg-gray-50 border-none rounded-3xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none resize-none"
                            />
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold px-1">This helps administrators understand the role's purpose.</p>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={closeModal}>Discard</Button>
                        <Button
                            type="submit"
                            className="flex-1 rounded-2xl font-black uppercase tracking-widest text-xs"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingRole ? "Apply Changes" : "Commit Role"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Permissions Management Modal */}
            <Modal
                isOpen={isPermissionsModalOpen}
                onClose={closeModal}
                title="Policy Enforcement"
                description={`Attach or detach specific resource policies for the '${editingRole?.roleName}' authority.`}
                className="max-w-2xl"
            >
                <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="bg-primary-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-1">Active Policies</p>
                            <p className="text-2xl font-black text-primary-600 leading-none">{currentRolePermissions?.length || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Available Scope</p>
                            <p className="text-2xl font-black text-gray-600 leading-none">{allPermissions?.length || 0}</p>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-1.5 pr-2">
                        {allPermissions?.map((perm: any) => {
                            const isAssigned = (currentRolePermissions || []).some((p: any) => p.permissionId === perm.permissionId);
                            return (
                                <button
                                    key={perm.permissionId}
                                    onClick={() => togglePermission(perm.permissionId, isAssigned)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 group border text-left",
                                        isAssigned
                                            ? "bg-primary-50 border-primary-100 shadow-sm"
                                            : "bg-white border-transparent hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-2.5 rounded-xl transition-all shadow-sm",
                                            isAssigned ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-400 group-hover:text-gray-600"
                                        )}>
                                            <FileKey size={18} />
                                        </div>
                                        <div>
                                            <p className={cn("text-[11px] font-black uppercase tracking-widest", isAssigned ? "text-primary-600" : "text-gray-900")}>
                                                {perm.permissionName}
                                            </p>
                                            <code className="text-[9px] text-gray-400 font-bold opacity-80 uppercase tracking-tighter">{perm.permissionKey}</code>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all",
                                        isAssigned ? "bg-primary-500 border-primary-500 scale-100" : "border-gray-200 group-hover:border-gray-300 scale-95"
                                    )}>
                                        {isAssigned && <CheckSquare size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="pt-4 flex gap-3">
                        <Button variant="default" className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-xs" onClick={closeModal}>Synchronize Changes</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
