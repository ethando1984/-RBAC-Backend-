import React from 'react';
import { useRoyaltyRecords } from '../hooks/useRoyaltyRecords';
import { RoyaltyAmount } from '../components/RoyaltyAmount';
import {
    LayoutDashboard,
    Clock,
    FileCheck,
    Wallet,
    AlertCircle,
    TrendingUp,
    Users,
    Layers,
    Play
} from 'lucide-react';
import { format } from 'date-fns';
import type { RoyaltyRecord } from '../types/royalty';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { royaltyApi } from '../api/royaltyApi';

const RoyaltyDashboard: React.FC = () => {
    // We fetch a larger set of records to derive stats for the current month
    const currentMonth = format(new Date(), 'yyyy-MM');
    const queryClient = useQueryClient();
    const { data: records, isLoading } = useRoyaltyRecords({ month: currentMonth, pageSize: 100 });

    const bulkMutation = useMutation({
        mutationFn: () => royaltyApi.bulkCalculateRecords(),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['royalty-records'] });
            alert(`Success: ${data.message}`);
        },
        onError: (err: any) => {
            alert(`Error: ${err.message || 'Failed to bulk calculate'}`);
        }
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    const stats = {
        total: records?.reduce((acc: number, r: RoyaltyRecord) => acc + r.finalAmount, 0) || 0,
        pendingConfirm: records?.filter((r: RoyaltyRecord) => r.status === 'CALCULATED').length || 0,
        pendingManager: records?.filter((r: RoyaltyRecord) => r.status === 'EDITOR_CONFIRMED').length || 0,
        pendingFinance: records?.filter((r: RoyaltyRecord) => r.status === 'MANAGER_APPROVED').length || 0,
        paid: records?.filter((r: RoyaltyRecord) => r.status === 'PAID').reduce((acc: number, r: RoyaltyRecord) => acc + r.finalAmount, 0) || 0,
    };

    // Derived category breakdown
    const categoryMap: Record<string, number> = {};
    records?.forEach((r: RoyaltyRecord) => {
        const cat = r.categoryName || 'General';
        categoryMap[cat] = (categoryMap[cat] || 0) + r.finalAmount;
    });
    const categories = Object.entries(categoryMap).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).slice(0, 5);

    // Derived author list
    const authorMap: Record<string, { name: string; amount: number }> = {};
    records?.forEach((r: RoyaltyRecord) => {
        const author = r.authorDisplayName || r.authorEmail || r.authorId;
        if (!authorMap[author]) authorMap[author] = { name: author, amount: 0 };
        authorMap[author].amount += r.finalAmount;
    });
    const topAuthors = Object.values(authorMap).sort((a: { name: string; amount: number }, b: { name: string; amount: number }) => b.amount - a.amount).slice(0, 5);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <LayoutDashboard className="w-6 h-6 mr-2 text-indigo-600" /> Royalty Analytics
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Overview of royalty spending and workflow status for {format(new Date(), 'MMMM yyyy')}</p>
                </div>

                <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 flex items-center">
                    <TrendingUp className="w-4 h-4 text-indigo-600 mr-2" />
                    <span className="text-sm font-semibold text-indigo-900">Health: Normal</span>
                </div>

                <button
                    onClick={() => bulkMutation.mutate()}
                    disabled={bulkMutation.isPending}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50"
                >
                    <Play className="w-4 h-4 mr-2" />
                    {bulkMutation.isPending ? 'Processing...' : 'Bulk Generate Records'}
                </button>
            </div>

            {/* Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Wallet className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Budget</span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Total Current Month</div>
                    <div className="mt-1">
                        <RoyaltyAmount amount={stats.total} size="xl" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Workflow</span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Pending Approvals</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900">
                        {stats.pendingConfirm + stats.pendingManager + stats.pendingFinance}
                    </div>
                    <div className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest font-semibold flex space-x-2">
                        <span>{stats.pendingConfirm} Ed</span>
                        <span>•</span>
                        <span>{stats.pendingManager} Mgr</span>
                        <span>•</span>
                        <span>{stats.pendingFinance} Fin</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <FileCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Payout</span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Paid This Month</div>
                    <div className="mt-1">
                        <RoyaltyAmount amount={stats.paid} size="xl" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Rejected / Voided</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900">
                        {records?.filter((r: RoyaltyRecord) => r.status === 'REJECTED' || r.status === 'VOIDED').length || 0}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Layers size={18} className="mr-2 text-zinc-400" /> Royalty by Category
                    </h3>
                    <div className="space-y-6">
                        {categories.map(([name, amount], idx) => (
                            <div key={name}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium text-gray-700">{name}</span>
                                    <RoyaltyAmount amount={amount} size="sm" />
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${(amount / (stats.total || 1)) * 100}%`, transitionDelay: `${idx * 100}ms` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Authors */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Users size={18} className="mr-2 text-zinc-400" /> Top Contributors
                    </h3>
                    <div className="divide-y divide-gray-100">
                        {topAuthors.map((author, idx) => (
                            <div key={idx} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                                <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3
                                        ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-zinc-300' : idx === 2 ? 'bg-orange-300' : 'bg-zinc-100 text-zinc-400'}`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{author.name}</div>
                                        <div className="text-xs text-gray-400">Contributor</div>
                                    </div>
                                </div>
                                <RoyaltyAmount amount={author.amount} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoyaltyDashboard;
