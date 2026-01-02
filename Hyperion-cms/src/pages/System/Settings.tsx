import { useState } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { Save, User, Bell, Globe, Shield, Palette, Loader2, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Settings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [profileData, setProfileData] = useState({
        name: 'Admin User',
        email: 'admin@hemera.com',
        role: 'Administrator',
        timezone: 'UTC+7',
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        articlePublished: true,
        taskAssigned: true,
        commentReceived: false,
        weeklyDigest: true,
    });

    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: 'light',
        compactMode: false,
        sidebarCollapsed: false,
    });

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'regional', label: 'Regional', icon: Globe },
    ];

    return (
        <PageShell
            title="Settings"
            description="Manage your account preferences and system configuration"
            actions={
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={cn(
                        "flex items-center px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50",
                        saved ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <Check className="h-4 w-4 mr-2" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-2 space-y-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                                        activeTab === tab.id
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-8">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 mb-1">Profile Information</h3>
                                    <p className="text-sm text-gray-500">Update your personal details and contact information</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                            value={profileData.name}
                                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                            value={profileData.email}
                                            onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Role</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-sm font-semibold text-gray-500 cursor-not-allowed"
                                            value={profileData.role}
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Timezone</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                            value={profileData.timezone}
                                            onChange={e => setProfileData({ ...profileData, timezone: e.target.value })}
                                        >
                                            <option value="UTC+7">UTC+7 (Bangkok)</option>
                                            <option value="UTC+0">UTC+0 (London)</option>
                                            <option value="UTC-5">UTC-5 (New York)</option>
                                            <option value="UTC-8">UTC-8 (Los Angeles)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 mb-1">Notification Preferences</h3>
                                    <p className="text-sm text-gray-500">Choose what updates you want to receive</p>
                                </div>

                                <div className="space-y-4">
                                    {Object.entries({
                                        emailNotifications: 'Email Notifications',
                                        articlePublished: 'Article Published',
                                        taskAssigned: 'Task Assigned to Me',
                                        commentReceived: 'Comment Received',
                                        weeklyDigest: 'Weekly Digest',
                                    }).map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <span className="text-sm font-semibold text-gray-900">{label}</span>
                                            <button
                                                onClick={() => setNotificationSettings({
                                                    ...notificationSettings,
                                                    [key]: !notificationSettings[key as keyof typeof notificationSettings]
                                                })}
                                                className={cn(
                                                    "h-6 w-11 rounded-full relative transition-colors duration-300",
                                                    notificationSettings[key as keyof typeof notificationSettings] ? "bg-blue-600" : "bg-gray-300"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform duration-300 shadow-sm",
                                                    notificationSettings[key as keyof typeof notificationSettings] ? "translate-x-5" : ""
                                                )}></div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 mb-1">Appearance Settings</h3>
                                    <p className="text-sm text-gray-500">Customize how the CMS looks and feels</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Theme</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['light', 'dark'].map(theme => (
                                                <button
                                                    key={theme}
                                                    onClick={() => setAppearanceSettings({ ...appearanceSettings, theme })}
                                                    className={cn(
                                                        "p-6 rounded-xl border-2 transition-all capitalize font-semibold",
                                                        appearanceSettings.theme === theme
                                                            ? "border-blue-600 bg-blue-50 text-blue-900"
                                                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                                    )}
                                                >
                                                    {theme} Mode
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <span className="text-sm font-semibold text-gray-900">Compact Mode</span>
                                        <button
                                            onClick={() => setAppearanceSettings({ ...appearanceSettings, compactMode: !appearanceSettings.compactMode })}
                                            className={cn(
                                                "h-6 w-11 rounded-full relative transition-colors duration-300",
                                                appearanceSettings.compactMode ? "bg-blue-600" : "bg-gray-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform duration-300 shadow-sm",
                                                appearanceSettings.compactMode ? "translate-x-5" : ""
                                            )}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 mb-1">Security Settings</h3>
                                    <p className="text-sm text-gray-500">Manage your password and security preferences</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'regional' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 mb-1">Regional Settings</h3>
                                    <p className="text-sm text-gray-500">Configure language, date format, and regional preferences</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Language</label>
                                        <select className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all">
                                            <option>English (US)</option>
                                            <option>English (UK)</option>
                                            <option>Thai</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Date Format</label>
                                        <select className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all">
                                            <option>MM/DD/YYYY</option>
                                            <option>DD/MM/YYYY</option>
                                            <option>YYYY-MM-DD</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
