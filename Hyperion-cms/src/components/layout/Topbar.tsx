import { Search, Bell, Plus, LogOut, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserInfo, logout } from '../../api/auth';
import { useState } from 'react';

export function Topbar() {
    const user = getUserInfo();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-6 backdrop-blur-sm bg-white/90">
            <div className="flex items-center w-96">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        placeholder="Search articles, media..."
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <Link to="/articles/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 duration-100">
                    <Plus className="h-4 w-4 mr-2" />
                    New Article
                </Link>

                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                <div className="relative">
                    <div
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-3 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                            {user?.sub?.substring(0, 2).toUpperCase() || '??'}
                        </div>
                        <div className="text-sm hidden md:block">
                            <p className="font-bold text-gray-700">{user?.sub || 'Unknown User'}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user?.roles?.[0] || 'User'}</p>
                        </div>
                    </div>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                            </div>
                            <button className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                                My Profile
                            </button>
                            <button
                                onClick={logout}
                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="h-4 w-4 mr-3 text-red-400" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
