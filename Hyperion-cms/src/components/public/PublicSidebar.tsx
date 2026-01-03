import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Bookmark, Clock, User, Hash, FolderTree, Star } from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Discover', href: '/p/discover' },
    { icon: Star, label: 'Featured', href: '/p/featured' },
    { icon: Bookmark, label: 'Bookmarks', href: '/p/bookmarks' },
];

const topics = [
    'Technology',
    'Design',
    'Journalism',
    'Sustainability',
    'Politics',
];

export const PublicSidebar: React.FC = () => {
    const location = useLocation();

    return (
        <aside className="w-64 hidden lg:flex flex-col sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-r border-gray-100 p-6 space-y-8 bg-white">
            {/* Primary Nav */}
            <nav className="space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.href}
                        className={cn(
                            "flex items-center gap-4 px-3 py-2 rounded-lg transition-all",
                            location.pathname === item.href
                                ? "bg-black text-white"
                                : "text-gray-600 hover:bg-gray-100"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Topics */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    Recommended Topics
                </h3>
                <nav className="space-y-1">
                    {topics.map((topic) => (
                        <Link
                            key={topic}
                            to={`/p/topic/${topic.toLowerCase()}`}
                            className="flex items-center gap-4 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                        >
                            <span className="text-sm font-medium">{topic}</span>
                        </Link>
                    ))}
                    <Link to="/p/discover" className="text-sm text-blue-600 hover:underline px-3 py-2 block">
                        See more topics
                    </Link>
                </nav>
            </div>

            {/* Footer Links */}
            <div className="mt-auto pt-8 border-t border-gray-100">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-gray-400 font-medium tracking-tight">
                    <Link to="/p/help" className="hover:text-gray-600">Help</Link>
                    <Link to="/p/status" className="hover:text-gray-600">Status</Link>
                    <Link to="/p/about" className="hover:text-gray-600">About</Link>
                    <Link to="/p/careers" className="hover:text-gray-600">Careers</Link>
                    <Link to="/p/privacy" className="hover:text-gray-600">Privacy</Link>
                    <Link to="/p/terms" className="hover:text-gray-600">Terms</Link>
                </div>
                <p className="mt-4 text-[10px] text-gray-300 font-medium">© 2026 Hyperion Platform</p>
            </div>
        </aside>
    );
};
