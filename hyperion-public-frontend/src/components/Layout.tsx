import { Home, Compass, Bookmark, Settings, Search, Bell, User, Newspaper, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';

import { PublicApi } from '@/lib/api';
import { Category } from '@/lib/types';

export async function Layout({ children }: { children: React.ReactNode }) {
    const categories = await PublicApi.getCategories().catch(() => []);

    // Build tree
    const tree: (Category & { children: Category[] })[] = [];
    const map = new Map();
    categories.forEach(c => map.set(c.id, { ...c, children: [] }));

    categories.forEach(c => {
        if (c.parentId && map.has(c.parentId)) {
            map.get(c.parentId).children.push(map.get(c.id));
        } else {
            tree.push(map.get(c.id));
        }
    });

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* Left Nav */}
            <nav className="fixed left-0 top-0 hidden h-screen w-20 flex-col items-center border-r border-white/10 py-8 lg:flex xl:w-64 xl:items-start xl:px-8 overflow-y-auto">
                <div className="mb-12 shrink-0">
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-indigo-500 xl:text-3xl">
                        HYPERION
                    </Link>
                </div>

                <div className="flex flex-col space-y-2 xl:w-full">
                    <NavItem icon={<Home />} label="Home" href="/" />
                    <NavItem icon={<Newspaper />} label="Articles" href="/articles" />
                    <NavItem icon={<BookOpen />} label="Storylines" href="/storylines" />

                    {tree.length > 0 && (
                        <div className="pt-6">
                            <h3 className="hidden xl:block text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4 px-4">Categories</h3>
                            <div className="space-y-1">
                                {tree.map(node => (
                                    <div key={node.id}>
                                        <NavItem
                                            icon={<Layers />} // Placeholder, will fallback if imported
                                            label={node.name}
                                            href={`/category/${node.slug}`}
                                            compact={node.children.length > 0}
                                        />
                                        {node.children.length > 0 && (
                                            <div className="hidden xl:block ml-12 space-y-1 border-l border-white/10 pl-4 mt-1">
                                                {node.children.map(child => (
                                                    <Link
                                                        key={child.id}
                                                        href={`/category/${child.slug}`}
                                                        className="block py-1 text-sm text-white/50 hover:text-white transition"
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-white/10 mt-6">
                        <NavItem icon={<Compass />} label="Explore" href="/explore" />
                        <NavItem icon={<Search />} label="Search" href="/search" />
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-20 xl:ml-64">
                <div className="flex flex-col xl:flex-row">
                    {/* Feed */}
                    <div className="min-h-screen flex-1 border-r border-white/10 p-4 md:p-8">
                        {children}
                    </div>

                    {/* Right Discovery Column */}
                    <aside className="hidden w-[350px] p-8 xl:block">
                        <div className="sticky top-8 space-y-12">
                            {/* Discovery content can be added here dynamically */}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, href, active = false, compact = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean, compact?: boolean }) {
    return (
        <Link
            href={href}
            className={`group flex items-center space-x-4 transition px-4 py-2 rounded-xl hover:bg-white/5 ${active ? 'text-white bg-white/5' : 'text-white/50 hover:text-white'}`}
        >
            <div className={`transition ${active ? 'text-indigo-500' : ''}`}>
                {icon}
            </div>
            <span className="hidden font-medium xl:block">{label}</span>
        </Link>
    );
}
