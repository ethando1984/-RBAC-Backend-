import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Guard } from './Guard';
import { type ReactNode } from 'react';
import {
    Dashboard as DashboardIcon,
    People,
    Security,
    Policy,
    Logout,
    ChevronLeft,
    Menu as MenuIcon,
    ShoppingCart,
    Inventory as InventoryIcon
} from '@mui/icons-material';
import { useState } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/', guard: null },
        { text: 'Users', icon: <People fontSize="small" />, path: '/users', guard: { role: 'Super Administrator' } },
        { text: 'Roles', icon: <Security fontSize="small" />, path: '/roles', guard: { role: 'Super Administrator' } },
        { text: 'Policies', icon: <Policy fontSize="small" />, path: '/policies', guard: { role: 'Super Administrator' } },
        { text: 'Orders', icon: <ShoppingCart fontSize="small" />, path: '/orders', guard: { ns: 'orders', act: 'READ' } },
        { text: 'Inventory', icon: <InventoryIcon fontSize="small" />, path: '/inventory', guard: { ns: 'inventory', act: 'READ' } },
    ];

    return (
        <div className="flex h-screen bg-[#0d1117] text-gray-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className={`bg-[#161b22] border-r border-gray-800 transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 shrink-0">
                    <span className={`font-bold text-xl text-blue-400 overflow-hidden whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                        IAM Center
                    </span>
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-800 rounded text-gray-400">
                        {isSidebarOpen ? <ChevronLeft /> : <MenuIcon />}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        const NavItem = (
                            <button
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all group relative ${isActive
                                        ? 'bg-blue-600/20 text-blue-400'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                    }`}
                            >
                                <div className={`${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                    {item.icon}
                                </div>
                                <span className={`ml-3 font-medium transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                                    {item.text}
                                </span>
                                {!isSidebarOpen && (
                                    <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {item.text}
                                    </div>
                                )}
                            </button>
                        );

                        if (item.guard) {
                            return (
                                <Guard
                                    key={item.text}
                                    role={(item.guard as any).role}
                                    namespace={(item.guard as any).ns}
                                    action={(item.guard as any).act}
                                >
                                    {NavItem}
                                </Guard>
                            );
                        }
                        return NavItem;
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800 shrink-0">
                    <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                        {isSidebarOpen && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate">{user?.username}</span>
                                <span className="text-xs text-gray-500 truncate">{user?.email}</span>
                            </div>
                        )}
                        <button
                            onClick={logout}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <Logout fontSize="small" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-[#161b22]/50 backdrop-blur-md border-b border-gray-800 flex items-center px-8 shrink-0">
                    <h1 className="text-lg font-semibold capitalize">
                        {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).replace('/', ' / ')}
                    </h1>
                </header>
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
