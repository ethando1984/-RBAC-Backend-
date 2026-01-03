import React, { useState } from 'react';
import { royaltyApi } from '../api/royaltyApi';
import { RoyaltyAmount } from '../components/RoyaltyAmount';
import {
    Package,
    Download,
    CheckCircle2,
    Calendar,
    ArrowRight,
    Search
} from 'lucide-react';
import { format } from 'date-fns';

const RoyaltyBatches: React.FC = () => {
    const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

    // In a real app we'd fetch all batches, here we mock a list or fetch specific
    // Note: getBatches API wasn't explicitly in the java controller but create and export were.
    // I'll assume we can list them or at least show the "Generate" workflow.

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Package className="w-6 h-6 mr-2 text-indigo-600" /> Payment Batches
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage monthly payroll and bank exports</p>
                </div>

                <div className="flex space-x-3">
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="border border-zinc-200 rounded-md px-3 py-2 text-sm"
                    />
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all hover:translate-y-[-1px]">
                        Generate Payroll for {month}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {[
                    { id: 'batch-2026-01', month: '2026-01', total: 145000000, items: 42, status: 'PAID', paidAt: '2026-02-05' },
                    { id: 'batch-2025-12', month: '2025-12', total: 120000000, items: 38, status: 'PAID', paidAt: '2026-01-05' },
                    { id: 'batch-2025-11', month: '2025-11', total: 132000000, items: 40, status: 'PAID', paidAt: '2025-12-05' },
                ].map(batch => (
                    <div key={batch.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-6">
                            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                <Calendar className="text-zinc-400" size={24} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">{format(new Date(batch.month), 'MMMM yyyy')}</div>
                                <div className="text-xs text-gray-400 font-mono mt-0.5">{batch.id}</div>
                            </div>
                            <div className="h-8 w-px bg-gray-100"></div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Volume</div>
                                <div className="text-sm font-medium text-gray-700">{batch.items} articles</div>
                            </div>
                            <div className="h-8 w-px bg-gray-100"></div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Payout</div>
                                <RoyaltyAmount amount={batch.total} className="text-gray-900" />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center text-green-600 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                <CheckCircle2 size={12} className="mr-1" /> {batch.status}
                            </div>

                            <a
                                href={royaltyApi.exportBatchCsvUrl(batch.id)}
                                download
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Download CSV"
                            >
                                <Download size={20} />
                            </a>

                            <button className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                Details <ArrowRight size={16} className="ml-1" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-zinc-50/50 flex flex-col items-center text-center">
                <Search size={40} className="text-gray-300 mb-4" />
                <h3 className="text-gray-900 font-bold">Audit & Transparency</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1">Every payment batch is locked after generation. Changes to individual records require a new supplementary batch.</p>
            </div>
        </div>
    );
};

export default RoyaltyBatches;
