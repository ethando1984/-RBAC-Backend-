import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Layers, Image, FolderTree, Users,
    BookOpen, Hash, Bot, Search, ClipboardList, Settings,
    LogOut, CheckSquare
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Articles', href: '/articles', icon: FileText },
    { name: 'Workflow Queue', href: '/workflow', icon: Layers },
    { name: 'Media Library', href: '/media', icon: Image },
    { name: 'Categories', href: '/categories', icon: FolderTree },
    { name: 'Authors', href: '/authors', icon: Users },
    { name: 'Storylines', href: '/storylines', icon: BookOpen },
    { name: 'Tags', href: '/tags', icon: Hash },
    { name: 'Crawler', href: '/crawler', icon: Bot },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'SEO', href: '/seo', icon: Search },
    { name: 'Audit Logs', href: '/audit-logs', icon: ClipboardList },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Layouts', href: '/layouts', icon: LayoutDashboard },
    { name: 'Royalty Dashboard', href: '/royalties', icon: LayoutDashboard },
    { name: 'Royalty Records', href: '/royalties/records', icon: CheckSquare },
    { name: 'Royalty Rules', href: '/royalties/rules', icon: Settings },
];


export function Sidebar() {
    return (
        <div className="flex flex-col w-64 bg-gray-900 border-r border-gray-800 text-gray-300 h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="p-6 flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-white font-bold text-xl">H</span>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">Hyperion</span>
            </div>

            <nav className="flex-1 px-3 space-y-1 mt-4">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        end={item.href === '/royalties' || item.href === '/'}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group',
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            )
                        }
                    >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
