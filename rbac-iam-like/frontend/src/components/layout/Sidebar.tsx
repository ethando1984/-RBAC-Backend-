import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    FileKey,
    ShoppingCart,
    Package,
    ChevronLeft,
    Menu as MenuIcon,
    Grid3X3,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const MENU_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/', permission: null },
    { label: 'Users', icon: Users, path: '/users', permission: { namespace: 'users', action: 'READ' } },
    { label: 'Roles', icon: ShieldCheck, path: '/roles', permission: { namespace: 'roles', action: 'READ' } },
    { label: 'Policies', icon: FileKey, path: '/policies', permission: { namespace: 'policies', action: 'READ' } },
    { label: 'Security Matrix', icon: Grid3X3, path: '/matrix', permission: { namespace: 'policies', action: 'READ' } },

    { label: 'Orders', icon: ShoppingCart, path: '/orders', permission: { namespace: 'orders', action: 'READ' } },
    { label: 'Inventory', icon: Package, path: '/inventory', permission: { namespace: 'inventory', action: 'READ' } },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { can, hasRole } = useAuth();

    const isSuperAdmin = hasRole('Super Administrator');

    const visibleItems = MENU_ITEMS.filter(item => {
        if (isSuperAdmin) return true;
        if (!item.permission) return true;
        return can(item.permission.namespace, item.permission.action);
    });

    return (
        <aside
            className={cn(
                "flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-in-out h-screen fixed left-0 top-0 z-40 shadow-sm",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-gray-50 overflow-hidden shrink-0">
                <div className="bg-primary-500 p-2 rounded-xl text-white shrink-0">
                    <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <span className={cn(
                    "ml-3 font-extrabold text-xl text-gray-900 tracking-tight transition-all duration-300 whitespace-nowrap",
                    collapsed ? "opacity-0 w-0" : "opacity-100"
                )}>
                    IAM Center
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {visibleItems.map((item) => {
                    const isActive = item.path === '/'
                        ? location.pathname === '/'
                        : (location.pathname + location.search) === item.path ||
                        (location.pathname === item.path.split('?')[0] && (item.path.includes('?') ? (location.search === item.path.slice(item.path.indexOf('?'))) : location.pathname === item.path));

                    // Fallback for sub-routes if not an exact match with query
                    const isSubroute = !isActive && item.path !== '/' && location.pathname.startsWith(item.path.split('?')[0]);
                    const highlighted = isActive || isSubroute;

                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "w-full flex items-center px-3 py-2.5 rounded-xl transition-all group relative",
                                highlighted
                                    ? "bg-primary-50 text-primary-600"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon size={20} className={cn("shrink-0", highlighted ? "text-primary-600" : "text-gray-400 group-hover:text-gray-900")} />
                            <span className={cn(
                                "ml-3 font-semibold transition-all duration-300 whitespace-nowrap",
                                collapsed ? "opacity-0 w-0" : "opacity-100"
                            )}>
                                {item.label}
                            </span>

                            {highlighted && (
                                <div className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full" />
                            )}


                            {collapsed && (
                                <div className="absolute left-16 px-2 py-1 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer / Toggle */}
            <div className="p-4 border-t border-gray-50">
                <button
                    onClick={onToggle}
                    className="w-full h-10 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-xl transition-all duration-200"
                    title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {collapsed ? <MenuIcon size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </aside>
    );
}
