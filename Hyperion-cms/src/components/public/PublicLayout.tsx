import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicSidebar } from './PublicSidebar';
import { StaffPicks, RecommendedTopicsCards, WhoToFollow } from './DiscoveryWidgets';

export const PublicLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <PublicHeader />

            <div className="max-w-7xl mx-auto flex">
                {/* Left Sidebar - Persistent on Large Desktop */}
                <PublicSidebar />

                {/* Center Content Column */}
                <main className="flex-1 min-w-0 md:px-8 py-8 border-r border-gray-100 min-h-screen">
                    <div className="max-w-screen-md mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Right Discovery Column - Hidden on Mobile/Tablet */}
                <aside className="w-80 hidden xl:flex flex-col sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-8 space-y-10">
                    <StaffPicks />
                    <RecommendedTopicsCards />
                    <WhoToFollow />

                    <div className="pt-8 border-t border-gray-100">
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                            <a href="#" className="hover:underline">Help</a>
                            <a href="#" className="hover:underline">Status</a>
                            <a href="#" className="hover:underline">About</a>
                            <a href="#" className="hover:underline">Careers</a>
                            <a href="#" className="hover:underline">Privacy</a>
                            <a href="#" className="hover:underline">Terms</a>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};
