import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { User as UserIcon, Mail, Shield, ChevronDown, ChevronUp, Plus, X, Key } from 'lucide-react';
import { Switch, Disclosure } from '@headlessui/react';
import { cn } from '../lib/utils';
import type { EffectiveAccess } from '../types';

export default function UserDetail() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [selectedRole, setSelectedRole] = useState('');
    const [editData, setEditData] = useState({ username: '', email: '', active: true });

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['user', id],
        queryFn: () => api.users.get(id!)
    });

    const { data: accessList, isLoading: isAccessLoading } = useQuery({
        queryKey: ['access', id],
        queryFn: () => api.users.getAccess(id!)
    });

    const { data: allRoles } = useQuery({
        queryKey: ['roles'],
        queryFn: () => api.roles.list()
    });

    useEffect(() => {
        if (user) {
            setEditData({ username: user.username, email: user.email, active: user.active });
        }
    }, [user]);

    const updateProfileMut = useMutation({
        mutationFn: (data: any) => api.users.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            // Ideally use a toast here
            alert('Profile updated successfully');
        }
    });

    const assignRoleMut = useMutation({
        mutationFn: (roleId: string) => api.users.assignRole(id!, roleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            queryClient.invalidateQueries({ queryKey: ['access', id] });
            setSelectedRole('');
        }
    });

    const revokeRoleMut = useMutation({
        mutationFn: (roleId: string) => api.users.removeRole(id!, roleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            queryClient.invalidateQueries({ queryKey: ['access', id] });
        }
    });

    const access: EffectiveAccess | undefined = accessList?.[0];
    const assignedRoleIds = new Set(user?.roles?.map(r => r.roleId) || []);

    const handleAssign = () => {
        if (selectedRole) assignRoleMut.mutate(selectedRole);
    };

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMut.mutate(editData);
    };

    if (isUserLoading || isAccessLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="User Management"
                description={`Manage profile and access levels for ${user?.username || 'user'}`}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                                    <UserIcon size={20} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Profile Details</h3>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Username</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            value={editData.username}
                                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                                        <input
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-xs font-bold text-gray-700">Account Active</span>
                                    <Switch
                                        checked={editData.active}
                                        onChange={(checked: boolean) => setEditData({ ...editData, active: checked })}
                                        className={cn(
                                            editData.active ? 'bg-emerald-500' : 'bg-gray-200',
                                            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'
                                        )}
                                    >
                                        <span className="sr-only">Use setting</span>
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                editData.active ? 'translate-x-5' : 'translate-x-0',
                                                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out'
                                            )}
                                        />
                                    </Switch>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full gap-2 font-bold"
                                    disabled={updateProfileMut.isPending}
                                >
                                    {updateProfileMut.isPending ? 'Updating...' : 'Save Changes'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Shield size={20} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Assigned Roles</h3>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2 min-h-[40px]">
                                    {user?.roles?.map(role => (
                                        <Badge
                                            key={role.roleId}
                                            variant="secondary"
                                            className="pl-3 pr-1 py-1 flex items-center gap-2 bg-indigo-50/50 text-indigo-700 border-indigo-100 hover:bg-indigo-100/50 transition-all group"
                                        >
                                            <span className="text-xs font-bold tracking-tight">{role.roleName}</span>
                                            <button
                                                onClick={() => revokeRoleMut.mutate(role.roleId)}
                                                className="p-1 hover:bg-indigo-200/50 text-indigo-400 hover:text-indigo-600 rounded-full transition-all"
                                                title="Revoke Role"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </Badge>
                                    ))}
                                    {(user?.roles?.length === 0 || !user?.roles) && (
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider py-4 flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                                            <Shield size={16} className="mb-2 opacity-20" />
                                            No roles assigned
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100 space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Assign New Role</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select
                                                value={selectedRole}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                className="w-full bg-gray-50 border-none rounded-xl py-2.5 px-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Role...</option>
                                                {allRoles?.filter((r: any) => !assignedRoleIds.has(r.roleId)).map((r: any) => (
                                                    <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                        <Button
                                            onClick={handleAssign}
                                            disabled={!selectedRole || assignRoleMut.isPending}
                                            className="px-3"
                                        >
                                            <Plus size={20} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Effective Access Visualizer */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                        <Key size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Effective Permission Matrix</h3>
                                        <p className="text-[10px] text-gray-400 font-medium">Derived from assigned roles</p>
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    {access?.roles.length || 0} Sources
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {access?.roles.map((role) => (
                                    <Disclosure key={role.roleId} defaultOpen={false}>
                                        {({ open }) => (
                                            <div className={cn(
                                                "border rounded-2xl transition-all duration-300 group",
                                                open ? "border-primary-200 bg-primary-50/30 shadow-md shadow-primary-500/5" : "border-gray-100 hover:border-gray-300 bg-white hover:shadow-sm"
                                            )}>
                                                <Disclosure.Button className="flex w-full items-center justify-between px-5 py-4 text-left outline-none hover:bg-white/40 transition-colors rounded-t-2xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "p-2 rounded-lg transition-colors",
                                                            open ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"
                                                        )}>
                                                            <Shield size={16} />
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold text-gray-900">{role.roleName}</span>
                                                            <p className="text-[10px] text-gray-400 font-medium">{role.permissions.length} Permissions</p>
                                                        </div>
                                                    </div>
                                                    <ChevronUp
                                                        size={16}
                                                        className={cn("text-gray-400 transition-transform duration-200", !open && "rotate-180")}
                                                    />
                                                </Disclosure.Button>
                                                <Disclosure.Panel className="px-5 pb-5 pt-0">
                                                    <div className="h-px w-full bg-primary-100/50 mb-4" />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {role.permissions.map((perm, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl hover:border-primary-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                                            >
                                                                <span className="text-xs font-semibold text-gray-700">{perm.permissionName}</span>
                                                                <code className="text-[9px] font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-md uppercase tracking-wider">
                                                                    {perm.namespaceKey}:{perm.actionKey}
                                                                </code>
                                                            </div>
                                                        ))}
                                                        {role.permissions.length === 0 && (
                                                            <div className="col-span-2 text-center py-2 text-xs text-gray-400 italic">
                                                                No specific permissions defined for this role.
                                                            </div>
                                                        )}
                                                    </div>
                                                </Disclosure.Panel>
                                            </div>
                                        )}
                                    </Disclosure>
                                ))}

                                {access?.roles.length === 0 && (
                                    <div className="py-20 flex flex-col items-center justify-center text-center">
                                        <div className="p-4 bg-gray-50 rounded-full text-gray-300 mb-4">
                                            <Shield size={32} />
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900">No Effective Access</h4>
                                        <p className="text-xs text-gray-500 mt-1 max-w-xs">
                                            This user has no assigned roles and thus cannot access any protected resources.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
