import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { PageHeader } from '../components/common/PageHeader';
import { Mail, User as UserIcon, Shield, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            await api.auth.updateProfile({ email });
            await refreshUser();
            setStatus({ type: 'success', message: 'Profile updated successfully.' });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }

        setIsLoading(true);
        setStatus(null);

        try {
            await api.auth.updateProfile({ currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setStatus({ type: 'success', message: 'Password changed successfully.' });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to change password. Please check your current password.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <PageHeader
                title="Account Settings"
                description="Manage your profile information and security preferences"
            />

            {status && (
                <div className={cn(
                    "p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300",
                    status.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                )}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-bold">{status.message}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Overview Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardContent className="p-6 text-center">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-black text-3xl mx-auto mb-4 shadow-xl shadow-primary-500/20">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">{user?.username}</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">User Identity</p>

                        <div className="mt-6 pt-6 border-t border-gray-50 space-y-4">
                            <div className="flex items-center gap-3 text-left">
                                <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                                    <p className="text-xs font-bold text-gray-700 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-left">
                                <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</p>
                                    <p className="text-xs font-bold text-emerald-600">Active</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Forms */}
                <div className="md:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                                    <UserIcon size={20} />
                                </div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Basic Information</h3>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username (Read-only)</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input
                                            disabled
                                            type="text"
                                            value={user?.username}
                                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-400 outline-none cursor-not-allowed"
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
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" disabled={isLoading || email === user?.email} className="rounded-xl font-black uppercase tracking-widest text-xs px-8">
                                        {isLoading ? 'Saving...' : 'Update Email'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Security Info */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                                    <Shield size={20} />
                                </div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Security & Password</h3>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                                        <input
                                            required
                                            type="password"
                                            value={currentPassword}
                                            onChange={e => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                        <div className="relative group">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                                            <input
                                                required
                                                type="password"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <div className="relative group">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                                            <input
                                                required
                                                type="password"
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-rose-500/20 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" disabled={isLoading || !currentPassword || !newPassword} variant="outline" className="rounded-xl font-black uppercase tracking-widest text-xs px-8 border-rose-200 text-rose-600 hover:bg-rose-50">
                                        {isLoading ? 'Updating...' : 'Change Password'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
