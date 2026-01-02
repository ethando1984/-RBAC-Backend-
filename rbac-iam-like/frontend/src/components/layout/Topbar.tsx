import { Bell, Search, Settings, User, LogOut } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export function Topbar() {
    const navigate = useNavigate();
    const { user, logout, effectiveAccess } = useAuth();
    const userEmail = user?.email || user?.username || "Guest";
    const initials = (user?.username || "G").substring(0, 2).toUpperCase();

    // Get the highest priority role name
    const roleName = effectiveAccess?.roles?.[0]?.roleName || "User";

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
            {/* Search Stub */}
            <div className="flex-1 max-w-md hidden md:block">
                <div className="relative group">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for resources..."
                        className="w-full h-10 bg-gray-50 border-none rounded-xl pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>

                <div className="h-6 w-px bg-gray-100 mx-2" />

                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-3 p-1 rounded-xl hover:bg-gray-50 transition-all outline-none">
                        <div className="hidden lg:block text-right">
                            <p className="text-sm font-semibold text-gray-900 leading-none mb-1">{userEmail}</p>
                            <p className="text-xs text-gray-400 font-medium">{roleName}</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-500/20">
                            {initials}
                        </div>
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
                        <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 p-2 outline-none">
                            <div className="px-3 py-2 border-b border-gray-50 mb-1 lg:hidden">
                                <p className="text-sm font-semibold truncate">{userEmail}</p>
                            </div>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors", active ? "bg-gray-50 text-gray-900" : "text-gray-600")}
                                    >
                                        <User size={18} /> Profile
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => navigate('/settings')}
                                        className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors", active ? "bg-gray-50 text-gray-900" : "text-gray-600")}
                                    >
                                        <Settings size={18} /> Settings
                                    </button>
                                )}
                            </Menu.Item>

                            <div className="my-1 border-t border-gray-50" />
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={logout}
                                        className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-rose-500", active ? "bg-rose-50" : "")}
                                    >
                                        <LogOut size={18} /> Logout
                                    </button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header>
    );
}
