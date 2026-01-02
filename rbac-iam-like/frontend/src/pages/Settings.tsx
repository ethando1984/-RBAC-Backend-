import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/common/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { User, Mail, Shield, Key, Bell, Globe, Palette, Lock, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { cn } from '../lib/utils';

export default function Settings() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Form states
    const [email, setEmail] = useState(user?.email || '');
    const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

    // Preferences state
    const [prefs, setPrefs] = useState(() => {
        try {
            return user?.preferences ? JSON.parse(user.preferences) : {
                notifications: { email: true, security: true, policy: false, weekly: false },
                language: 'English (US)',
                timezone: 'UTC-7 (Pacific Time)',
                dateFormat: 'MM/DD/YYYY'
            };
        } catch (e) {
            return {
                notifications: { email: true, security: true, policy: false, weekly: false },
                language: 'English (US)',
                timezone: 'UTC-7 (Pacific Time)',
                dateFormat: 'MM/DD/YYYY'
            };
        }
    });

    useEffect(() => {
        if (user) {
            setEmail(user.email || '');
            if (user.preferences) {
                try { setPrefs(JSON.parse(user.preferences)); } catch (e) { }
            }
        }
    }, [user]);

    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            logout();
            navigate('/login');
        }
    };

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

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.next !== passwords.confirm) {
            setStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }
        setIsLoading(true);
        setStatus(null);
        try {
            await api.auth.updateProfile({ currentPassword: passwords.current, newPassword: passwords.next });
            setPasswords({ current: '', next: '', confirm: '' });
            setStatus({ type: 'success', message: 'Password updated successfully.' });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Verification failed. Check your current password.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePreferences = async () => {
        setIsLoading(true);
        setStatus(null);
        try {
            await api.auth.updateProfile({ preferences: JSON.stringify(prefs) });
            await refreshUser();
            setStatus({ type: 'success', message: 'Preferences saved.' });
        } catch (error: any) {
            setStatus({ type: 'error', message: 'Failed to save preferences.' });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleNotify = (key: string) => {
        setPrefs({
            ...prefs,
            notifications: { ...prefs.notifications, [key]: !prefs.notifications[key] }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Settings"
                description="Manage your account settings and preferences"
                action={
                    <Button
                        variant="outline"
                        className="gap-2 text-rose-600 hover:bg-rose-50 border-rose-200"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </Button>
                }
            />

            {status && (
                <div className={cn(
                    "p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300",
                    status.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                )}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-bold">{status.message}</p>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="h-auto p-1.5 bg-gray-50 rounded-2xl gap-2">
                    <TabsTrigger value="profile" className="px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest gap-2 data-[state=active]:shadow-sm">
                        <User size={16} /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest gap-2 data-[state=active]:shadow-sm">
                        <Shield size={16} /> Security
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest gap-2 data-[state=active]:shadow-sm">
                        <Palette size={16} /> Preferences
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-primary-100 rounded-2xl">
                                        <User size={32} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Profile Information</h2>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">Update your personal details</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={user?.username || ''}
                                                disabled
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 font-bold outline-none cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium ml-1">Username cannot be changed for security reasons</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="your.email@company.com"
                                                className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-primary-500/20 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 font-bold outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button type="submit" disabled={isLoading || email === user?.email} className="rounded-2xl font-black uppercase tracking-widest text-xs">
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Account Status Card */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Account Status</h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle size={20} className="text-emerald-500" />
                                        <div>
                                            <div className="text-xs font-black text-emerald-900 uppercase">Active</div>
                                            <div className="text-[10px] text-emerald-600 font-medium">Account enabled</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 font-medium">User ID</span>
                                        <code className="text-gray-600 font-mono text-[10px] bg-gray-100 px-2 py-1 rounded">{user?.userId?.substring(0, 8)}...</code>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 font-medium">Account Status</span>
                                        <span className="text-gray-900 font-bold">{user?.active ? 'Verified' : 'Pending'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-rose-100 rounded-2xl">
                                        <Key size={32} className="text-rose-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Change Password</h2>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">Update your login credentials</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handleUpdatePassword} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                                        <input
                                            required
                                            type="password"
                                            value={passwords.current}
                                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-primary-500/20 rounded-2xl py-3.5 px-4 text-gray-900 font-bold outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                        <input
                                            required
                                            type="password"
                                            value={passwords.next}
                                            onChange={e => setPasswords({ ...passwords, next: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-primary-500/20 rounded-2xl py-3.5 px-4 text-gray-900 font-bold outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <input
                                            required
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-primary-500/20 rounded-2xl py-3.5 px-4 text-gray-900 font-bold outline-none transition-all"
                                        />
                                    </div>

                                    <Button type="submit" disabled={isLoading} className="w-full rounded-2xl font-black uppercase tracking-widest text-xs gap-2">
                                        {isLoading ? 'Updating...' : <><Lock size={16} /> Update Password</>}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Security Settings</h2>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-gray-900 uppercase tracking-tight">Two-Factor Authentication</div>
                                        <div className="text-xs text-gray-500 font-medium mt-1">Add an extra layer of security</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Coming Soon</span>
                                    </div>
                                </div>

                                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-gray-900 uppercase tracking-tight">Active Sessions</div>
                                        <div className="text-xs text-gray-500 font-medium mt-1">Manage your active sessions</div>
                                    </div>
                                    <div className="text-xs font-bold text-primary-600">1 Session</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-indigo-100 rounded-2xl">
                                        <Bell size={32} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Notifications</h2>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">Manage your notification preferences</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { id: 'email', label: 'Email Notifications', desc: 'Receive email about important updates' },
                                    { id: 'security', label: 'Security Alerts', desc: 'Get notified about security events' },
                                    { id: 'policy', label: 'Policy Changes', desc: 'Notifications when policies are modified' },
                                    { id: 'weekly', label: 'Weekly Reports', desc: 'Receive weekly activity summaries' },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex-1">
                                            <div className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.label}</div>
                                            <div className="text-xs text-gray-500 font-medium mt-1">{item.desc}</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={prefs.notifications[item.id]}
                                                onChange={() => toggleNotify(item.id)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-purple-100 rounded-2xl">
                                        <Globe size={32} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Regional Settings</h2>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">Configure locale and timezone</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Language</label>
                                    <select
                                        value={prefs.language}
                                        onChange={e => setPrefs({ ...prefs, language: e.target.value })}
                                        className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-primary-500/20 rounded-2xl py-3.5 px-4 text-gray-900 font-bold outline-none transition-all cursor-pointer"
                                    >
                                        <option>English (US)</option>
                                        <option>English (UK)</option>
                                        <option>Español</option>
                                        <option>Français</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Timezone</label>
                                    <select
                                        value={prefs.timezone}
                                        onChange={e => setPrefs({ ...prefs, timezone: e.target.value })}
                                        className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-primary-500/20 rounded-2xl py-3.5 px-4 text-gray-900 font-bold outline-none transition-all cursor-pointer"
                                    >
                                        <option>UTC-7 (Pacific Time)</option>
                                        <option>UTC-5 (Eastern Time)</option>
                                        <option>UTC+0 (GMT)</option>
                                        <option>UTC+7 (Bangkok)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date Format</label>
                                    <select
                                        value={prefs.dateFormat}
                                        onChange={e => setPrefs({ ...prefs, dateFormat: e.target.value })}
                                        className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-primary-500/20 rounded-2xl py-3.5 px-4 text-gray-900 font-bold outline-none transition-all cursor-pointer"
                                    >
                                        <option>MM/DD/YYYY</option>
                                        <option>DD/MM/YYYY</option>
                                        <option>YYYY-MM-DD</option>
                                    </select>
                                </div>

                                <Button onClick={handleSavePreferences} disabled={isLoading} className="w-full rounded-2xl font-black uppercase tracking-widest text-xs">
                                    {isLoading ? 'Saving...' : 'Save Preferences'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Info Banner */}
            <div className="bg-primary-50 border border-primary-100 p-6 rounded-[2.5rem] flex items-start gap-4">
                <div className="p-3 bg-primary-500 text-white rounded-2xl">
                    <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-black text-primary-900 uppercase tracking-tight">Important Security Notice</h3>
                    <p className="text-xs text-primary-700 font-medium mt-2 leading-relaxed">
                        For security reasons, certain settings require administrator approval. Changes to your account will be logged for audit purposes.
                        If you suspect unauthorized access, please contact your system administrator immediately.
                    </p>
                </div>
            </div>
        </div>
    );
}
