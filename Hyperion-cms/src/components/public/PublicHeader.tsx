import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Edit, User, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PublicHeader: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchValue.trim()) {
            navigate(`/p/search?q=${encodeURIComponent(searchValue)}`);
        }
    };

    return (
        <header className={cn(
            "sticky top-0 z-50 w-full transition-all duration-300 border-b",
            isScrolled ? "bg-white/80 backdrop-blur-md h-14 border-gray-200" : "bg-white h-16 border-transparent"
        )}>
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 bg-black rounded flex items-center justify-center text-white font-bold text-xl group-hover:bg-blue-600 transition-colors">
                            H
                        </div>
                        <span className="text-xl font-bold tracking-tight hidden sm:block">Hyperion</span>
                    </Link>
                </div>

                {/* Search */}
                <div className="hidden md:flex flex-1 max-w-sm relative">
                    <form onSubmit={handleSearch} className="w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Hyperion..."
                            className="w-full pl-10 pr-4 py-1.5 bg-gray-50 border border-transparent rounded-full text-sm outline-none focus:bg-white focus:border-gray-200 transition-all"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </form>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 sm:gap-6">
                    <button className="md:hidden p-2 text-gray-500">
                        <Search className="h-5 w-5" />
                    </button>

                    <Link to="/write" className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm font-medium">
                        <Edit className="h-4 w-4" />
                        Write
                    </Link>

                    <button className="text-gray-500 hover:text-black transition-colors">
                        <Bell className="h-5 w-5" />
                    </button>

                    <Link to="/p/profile" className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                        <User className="h-5 w-5" />
                    </Link>

                    <button
                        className="p-2 md:hidden text-gray-500"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                        {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 md:hidden animate-in slide-in-from-top duration-300">
                    <nav className="flex flex-col p-4 space-y-4">
                        <Link to="/" className="text-gray-900 font-medium py-2">Home</Link>
                        <Link to="/p/categories" className="text-gray-900 font-medium py-2">Categories</Link>
                        <Link to="/p/storylines" className="text-gray-900 font-medium py-2">Storylines</Link>
                        <Link to="/p/trending" className="text-gray-900 font-medium py-2">Trending</Link>
                    </nav>
                </div>
            )}
        </header>
    );
};
