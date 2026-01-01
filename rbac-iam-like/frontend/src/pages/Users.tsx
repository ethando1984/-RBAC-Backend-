import { Plus, Search, MoreHorizontal, Edit, Trash2, ShieldCheck, Mail, User as UserIcon, ToggleLeft, ToggleRight, Key } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '../lib/utils';

export default function Users() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', active: true });

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: api.users.list
    });

    const { data: allRoles } = useQuery({
        queryKey: ['roles'],
        queryFn: api.roles.list,
        enabled: isRolesModalOpen
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.users.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.users.update(data.userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (userId: string) => api.users.delete(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    const { data: userAccessData } = useQuery({
        queryKey: ['user-access', editingUser?.userId],
        queryFn: () => api.users.getAccess(editingUser?.userId),
        enabled: !!editingUser && isRolesModalOpen
    });

    const currentUserRoles = userAccessData?.[0]?.roles || [];

    const assignRoleMutation = useMutation({
        mutationFn: ({ userId, roleId }: { userId: string, roleId: string }) => api.assignments.assignRole(userId, roleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user-access', editingUser?.userId] });
        },
        onError: (error) => {
            console.error('Failed to assign role:', error);
            alert('Security breach or network error: Failed to assign role authority.');
        }
    });

    const revokeRoleMutation = useMutation({
        mutationFn: ({ userId, roleId }: { userId: string, roleId: string }) => api.assignments.revokeRole(userId, roleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user-access', editingUser?.userId] });
        },
        onError: (error) => {
            console.error('Failed to revoke role:', error);
            alert('Security breach or network error: Failed to revoke role authority.');
        }
    });

    const openModal = (user?: any) => {
        if (user) {
            setEditingUser(user);
            setFormData({ username: user.username, email: user.email || '', password: '', active: user.active });
        } else {
            setEditingUser(null);
            setFormData({ username: '', email: '', password: '', active: true });
        }
        setIsModalOpen(true);
    };

    const openRolesModal = (user: any) => {
        setEditingUser(user);
        setIsRolesModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsRolesModalOpen(false);
        setEditingUser(null);
        setFormData({ username: '', email: '', password: '', active: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            updateMutation.mutate({ ...formData, userId: editingUser.userId });
        } else {
            createMutation.mutate(formData);
        }
    };

    const toggleRole = (roleId: string, currentIsAssigned: boolean) => {
        if (currentIsAssigned) {
            revokeRoleMutation.mutate({ userId: editingUser.userId, roleId });
        } else {
            assignRoleMutation.mutate({ userId: editingUser.userId, roleId });
        }
    };

    const filteredUsers = (users || []).filter((u: any) =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Users</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Manage system access and authentication</p>
                </div>
                <Button className="gap-2" onClick={() => openModal()}>
                    <Plus size={18} /> Create User
                </Button>
            </div>

            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold" size={16} />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-20 flex justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">Roles</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.map((user: any) => (
                                        <tr key={user.userId} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-primary-100/50 text-primary-600 flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                                                        {user.username.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-gray-900 tracking-tight block">{user.username}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">{user.email || 'No email'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 hidden md:table-cell">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles?.length > 0 ? (
                                                        user.roles.map((r: any) => (
                                                            <span key={r.roleId} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                                                {r.roleName}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-gray-300 italic">No roles assigned</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant={user.active ? 'success' : 'secondary'} className="rounded-lg h-7 px-2.5">
                                                    {user.active ? 'ACTIVE' : 'INACTIVE'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Menu as="div" className="relative inline-block text-left">
                                                    <Menu.Button className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-white transition-all outline-none">
                                                        <MoreHorizontal size={20} />
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
                                                        <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-1.5 z-10 outline-none">
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => openRolesModal(user)}
                                                                        className={cn(
                                                                            "flex items-center w-full px-3 py-2 text-xs font-bold rounded-xl transition-all gap-3 uppercase tracking-wider",
                                                                            active ? "bg-primary-50 text-primary-600" : "text-gray-600"
                                                                        )}
                                                                    >
                                                                        <Key size={16} /> Manage Roles
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => openModal(user)}
                                                                        className={cn(
                                                                            "flex items-center w-full px-3 py-2 text-xs font-bold rounded-xl transition-all gap-3 uppercase tracking-wider",
                                                                            active ? "bg-gray-50 text-gray-900" : "text-gray-600"
                                                                        )}
                                                                    >
                                                                        <Edit size={16} /> Edit User
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => { if (confirm('Permanently delete this user identity?')) deleteMutation.mutate(user.userId) }}
                                                                        className={cn(
                                                                            "flex items-center w-full px-3 py-2 text-xs font-bold rounded-xl transition-all gap-3 uppercase tracking-wider text-rose-500",
                                                                            active ? "bg-rose-50" : ""
                                                                        )}
                                                                    >
                                                                        <Trash2 size={16} /> Delete Identity
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
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* User Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingUser ? "Edit User Authority" : "Register New Identity"}
                description={editingUser ? "Update system access credentials and status." : "Grant new credentials to access system resources."}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Username</label>
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                required
                                type="text"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                placeholder="e.g. jdoe_admin"
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="user@organization.com"
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {!editingUser && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Password</label>
                            <div className="relative group">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                <input
                                    required
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div>
                            <p className="text-sm font-bold text-gray-900">Active Status</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Toggle system accessibility</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, active: !formData.active })}
                            className={cn(
                                "transition-colors outline-none",
                                formData.active ? "text-primary-500" : "text-gray-300"
                            )}
                        >
                            {formData.active ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                        </button>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={closeModal}>Cancel</Button>
                        <Button
                            type="submit"
                            className="flex-1 rounded-2xl font-black uppercase tracking-widest text-xs"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingUser ? "Update Identity" : "Commit Identity"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Roles Management Modal */}
            <Modal
                isOpen={isRolesModalOpen}
                onClose={closeModal}
                title="Manage User Roles"
                description={`Assign or revoke administrative authorities for ${editingUser?.username}.`}
            >
                <div className="space-y-4">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                        {allRoles?.map((role: any) => {
                            const isAssigned = currentUserRoles.some((r: any) => r.roleId === role.roleId);
                            return (
                                <button
                                    key={role.roleId}
                                    onClick={() => toggleRole(role.roleId, isAssigned)}
                                    disabled={assignRoleMutation.isPending || revokeRoleMutation.isPending}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group text-left",
                                        isAssigned
                                            ? "bg-primary-50 border-primary-200 ring-2 ring-primary-500/5"
                                            : "bg-white border-gray-100 hover:border-gray-200",
                                        (assignRoleMutation.isPending || revokeRoleMutation.isPending) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-xl transition-colors",
                                            isAssigned ? "bg-primary-500 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                                        )}>
                                            <Key size={18} />
                                        </div>
                                        <div>
                                            <p className={cn("text-xs font-black uppercase tracking-widest", isAssigned ? "text-primary-600" : "text-gray-900")}>
                                                {role.roleName}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{role.description || 'No description available.'}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                        isAssigned ? "bg-primary-500 border-primary-500" : "border-gray-200 group-hover:border-gray-300"
                                    )}>
                                        {isAssigned && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="pt-4">
                        <Button variant="outline" className="w-full rounded-2xl" onClick={closeModal}>Done</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
