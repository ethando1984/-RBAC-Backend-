import React, { useState } from 'react';
import { useRoyaltyRecords } from '../hooks/useRoyaltyRecords';
import { RoyaltyStatusBadge } from '../components/RoyaltyStatusBadge';
import { RoyaltyAmount } from '../components/RoyaltyAmount';
import { Link } from 'react-router-dom';
import { Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { RoyaltyRecord } from '../types/royalty';

const RoyaltyRecordList: React.FC = () => {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<string>('');
    const [month, setMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

    const { data: records, isLoading, isError } = useRoyaltyRecords({
        page,
        pageSize: 20,
        status: status || undefined,
        month: month || undefined
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading records...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Error loading records</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Royalty Records</h1>

                {/* Filters */}
                <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Filter:</span>
                    </div>

                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    />

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    >
                        <option value="">All Statuses</option>
                        <option value="CALCULATED">Calculated</option>
                        <option value="EDITOR_CONFIRMED">Editor Confirmed</option>
                        <option value="MANAGER_APPROVED">Manager Approved</option>
                        <option value="FINANCE_APPROVED">Finance Approved</option>
                        <option value="PAID">Paid</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">ARTICLE / DATE</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">AUTHOR</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">TYPE / STATS</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">AMOUNT</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">STATUS</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-widest">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {records?.map((record: RoyaltyRecord) => (
                            <tr key={record.id} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="text-sm font-semibold text-indigo-600 truncate max-w-md cursor-pointer hover:underline" title={record.articleTitle}>
                                        {record.articleTitle}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 font-medium">
                                        Published: {format(new Date(record.publishedAt), 'dd/MM/yyyy')}
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="text-sm text-gray-600 font-medium">{record.authorDisplayName || record.authorEmail || record.authorId}</div>
                                    <div className="text-xs text-gray-400 capitalize">{record.authorType?.toLowerCase() || 'Internal'}</div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="text-sm text-gray-700 font-bold tracking-tight">{record.articleType}</div>
                                    <div className="text-xs text-gray-400 font-medium">{record.wordCount} words</div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <RoyaltyAmount amount={record.finalAmount} className="text-gray-900 font-bold" />
                                        {record.overrideAmount && record.overrideAmount !== 0 && (
                                            <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tighter">(Overridden)</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <RoyaltyStatusBadge status={record.status} />
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        to={`/royalties/records/${record.id}`}
                                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center group transition-all"
                                    >
                                        <Eye className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                                        <span className="font-semibold">View</span>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!records || records.length === 0) && (
                    <div className="p-12 text-center text-gray-500">No records found for the selected criteria.</div>
                )}
            </div>

            {/* Simple Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </button>
                <span className="text-sm text-gray-700">Page {page}</span>
                <button
                    disabled={records && records.length < 20}
                    onClick={() => setPage(p => p + 1)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                </button>
            </div>
        </div>
    );
};

export default RoyaltyRecordList;
