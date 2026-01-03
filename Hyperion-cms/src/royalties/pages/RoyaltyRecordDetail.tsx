import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoyaltyRecord, useRoyaltyHistory, useRoyaltyActions } from '../hooks/useRoyaltyRecords';
import { usePermissions } from '../hooks/usePermissions';
import { RoyaltyStatusBadge } from '../components/RoyaltyStatusBadge';
import { RoyaltyAmount } from '../components/RoyaltyAmount';
import { ApprovalTimeline } from '../components/ApprovalTimeline';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { OverrideModal } from '../components/OverrideModal';
import {
    FileText,
    User,
    Calculator,
    History,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Edit3,
    CreditCard,
    AlertTriangle,
    Info
} from 'lucide-react';
import { format } from 'date-fns';

const RoyaltyRecordDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: string; title: string; message: string } | null>(null);
    const [isOverrideOpen, setIsOverrideOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const { data: record, isLoading: isRecordLoading, isError: isRecordError } = useRoyaltyRecord(id!);
    const { data: history, isLoading: isHistoryLoading } = useRoyaltyHistory(id!);
    const { confirm, approveManager, approveFinance, markPaid, reject, override } = useRoyaltyActions();

    if (isRecordLoading) return <div className="p-8 text-center text-gray-500">Loading record details...</div>;
    if (isRecordError || !record) return <div className="p-8 text-center text-red-500">Error loading record or record not found</div>;

    const handleAction = async () => {
        if (!confirmModal) return;

        try {
            switch (confirmModal.action) {
                case 'CONFIRM':
                    await confirm.mutateAsync(record.id);
                    break;
                case 'APPROVE_MANAGER':
                    await approveManager.mutateAsync(record.id);
                    break;
                case 'APPROVE_FINANCE':
                    await approveFinance.mutateAsync(record.id);
                    break;
                case 'MARK_PAID':
                    await markPaid.mutateAsync({
                        id: record.id,
                        paymentRef: 'AUTO-GENERATED',
                        paidAt: new Date().toISOString()
                    });
                    break;
                case 'REJECT':
                    await reject.mutateAsync({ id: record.id, reason: rejectReason });
                    break;
            }
            setConfirmModal(null);
            setShowRejectInput(false);
            setRejectReason('');
        } catch (err) {
            console.error("Action failed", err);
        }
    };

    const handleOverride = async (amount: number, note: string) => {
        try {
            await override.mutateAsync({ id: record.id, amount, note });
            setIsOverrideOpen(false);
        } catch (err) {
            console.error("Override failed", err);
        }
    };

    // Workflow helper visibility
    const canConfirm = record.status === 'CALCULATED' && hasPermission('royalties:editor_confirm');
    const canApproveManager = record.status === 'EDITOR_CONFIRMED' && hasPermission('royalties:manager_approve');
    const canApproveFinance = record.status === 'MANAGER_APPROVED' && hasPermission('royalties:finance_approve');
    const canMarkPaid = record.status === 'FINANCE_APPROVED' && hasPermission('royalties:mark_paid');
    const canReject = ['CALCULATED', 'EDITOR_CONFIRMED', 'MANAGER_APPROVED', 'FINANCE_APPROVED'].includes(record.status) && hasPermission('royalties:editor_confirm');
    const canOverride = ['CALCULATED', 'EDITOR_CONFIRMED', 'MANAGER_APPROVED'].includes(record.status) && hasPermission('royalties:editor_confirm');

    // Parse snapshot if available
    let snapshot: any = null;
    if (record.calcSnapshotJson) {
        try {
            snapshot = JSON.parse(record.calcSnapshotJson);
        } catch (e) {
            console.warn("Failed to parse calc snapshot", e);
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Records
            </button>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{record.articleTitle}</h1>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono">ID: {record.id.split('-')[0]}</span>
                        <RoyaltyStatusBadge status={record.status} />
                    </div>
                </div>

                <div className="flex space-x-3">
                    {canOverride && (
                        <button
                            onClick={() => setIsOverrideOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Edit3 className="w-4 h-4 mr-2" /> Override
                        </button>
                    )}
                    {canReject && (
                        <button
                            onClick={() => setShowRejectInput(true)}
                            className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                        </button>
                    )}
                    {canConfirm && (
                        <button
                            onClick={() => setConfirmModal({ isOpen: true, action: 'CONFIRM', title: 'Confirm Royalty', message: 'Are you sure you want to confirm this royalty calculation? This moves it to Manager Approval.' })}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Editor Confirm
                        </button>
                    )}
                    {canApproveManager && (
                        <button
                            onClick={() => setConfirmModal({ isOpen: true, action: 'APPROVE_MANAGER', title: 'Approve as Manager', message: 'Are you sure you want to approve this royalty? This moves it to Finance Review.' })}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Manager Approve
                        </button>
                    )}
                    {canApproveFinance && (
                        <button
                            onClick={() => setConfirmModal({ isOpen: true, action: 'APPROVE_FINANCE', title: 'Approve as Finance', message: 'Are you sure you want to finalize this for payment?' })}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Finance Approve
                        </button>
                    )}
                    {canMarkPaid && (
                        <button
                            onClick={() => setConfirmModal({ isOpen: true, action: 'MARK_PAID', title: 'Mark as Paid', message: 'This will finalize the record as PAID. Ensure payment has been sent.' })}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                            <CreditCard className="w-4 h-4 mr-2" /> Mark Paid
                        </button>
                    )}
                </div>
            </div>

            {showRejectInput && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 animate-in slide-in-from-top duration-300">
                    <label className="block text-sm font-medium text-red-800 mb-2">Reason for rejection (Required)</label>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full border border-red-200 rounded p-2 text-sm focus:ring-red-500 focus:border-red-500 mb-3"
                        placeholder="Explain why this royalty is being rejected..."
                        rows={3}
                    />
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => setShowRejectInput(false)} className="text-gray-500 text-sm hover:underline">Cancel</button>
                        <button
                            disabled={!rejectReason.trim()}
                            onClick={() => setConfirmModal({ isOpen: true, action: 'REJECT', title: 'Confirm Rejection', message: 'Rejection will stop the workflow. You must provide a valid reason.' })}
                            className="bg-red-600 text-white px-4 py-1.5 rounded text-sm font-medium disabled:opacity-50"
                        >
                            Submit Rejection
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Info & Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Article & Author Info */}
                    <div className="bg-white shadow rounded-lg border border-gray-200 divide-y divide-gray-100">
                        <div className="p-5">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                                <FileText className="w-5 h-5 mr-2 text-gray-400" /> Article & Author Information
                            </h2>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Title</span>
                                    <span className="text-sm text-gray-900 font-medium">{record.articleTitle}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Published At</span>
                                    <span className="text-sm text-gray-900">{format(new Date(record.publishedAt), 'PPPP p')}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Category</span>
                                    <span className="text-sm text-gray-900">{record.categoryName || 'General'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Article Type</span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                                        {record.articleType}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Author</span>
                                    <div className="flex items-center mt-1">
                                        <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] text-zinc-600 mr-2">
                                            <User size={12} />
                                        </div>
                                        <span className="text-sm text-gray-900">{record.authorDisplayName || record.authorEmail}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</span>
                                    <span className="text-sm text-gray-900">{record.wordCount} words</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calculation Breakdown */}
                    <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-5 bg-zinc-50 border-b border-zinc-100">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Calculator className="w-5 h-5 mr-2 text-gray-400" /> Calculation Summary
                            </h2>
                        </div>
                        <div className="p-5">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Base Rate ({record.articleType})</span>
                                    <RoyaltyAmount amount={record.baseAmount} />
                                </div>

                                <div className="space-y-2">
                                    <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Multipliers Applied</span>
                                    {snapshot?.appliedMultipliers && Object.keys(snapshot.appliedMultipliers).length > 0 ? (
                                        Object.entries(snapshot.appliedMultipliers).map(([key, factor]: [string, any]) => (
                                            <div key={key} className="flex justify-between items-center text-sm pl-4">
                                                <span className="text-gray-600 inline-flex items-center">
                                                    <span className="w-1 h-1 bg-zinc-300 rounded-full mr-2"></span>
                                                    {key.charAt(0) + key.slice(1).toLowerCase()}
                                                </span>
                                                <span className="text-zinc-500 font-mono text-xs">x{factor}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-xs text-gray-400 italic pl-4">No multipliers applied</div>
                                    )}
                                    <div className="flex justify-between items-center text-sm font-medium pt-1 border-t border-zinc-50">
                                        <span className="text-gray-700 font-semibold">Multiplier Factor</span>
                                        <span className="text-indigo-600">x{record.multiplierFactor}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Media Fees</span>
                                    {snapshot?.mediaBreakdown && Object.keys(snapshot.mediaBreakdown).length > 0 ? (
                                        Object.entries(snapshot.mediaBreakdown).map(([key, data]: [string, any]) => (
                                            <div key={key} className="flex justify-between items-center text-sm pl-4">
                                                <span className="text-gray-600 inline-flex items-center">
                                                    <span className="w-1 h-1 bg-zinc-300 rounded-full mr-2"></span>
                                                    {key} ({data.count})
                                                </span>
                                                <RoyaltyAmount amount={data.amount} size="sm" className="text-gray-500" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-xs text-gray-400 italic pl-4">No media fees</div>
                                    )}
                                    <div className="flex justify-between items-center text-sm pt-1 border-t border-zinc-50">
                                        <span className="text-gray-700 font-semibold">Media Total</span>
                                        <RoyaltyAmount amount={record.mediaFeeTotal} />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-zinc-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-500 text-sm">Gross Auto-Calculated Amount</span>
                                        <RoyaltyAmount amount={record.grossAmount} size="lg" />
                                    </div>

                                    {record.overrideAmount && record.overrideAmount !== 0 && (
                                        <div className="flex justify-between items-center mb-2 p-2 bg-orange-50 rounded border border-orange-100">
                                            <div className="flex items-center text-orange-700 text-sm italic">
                                                <AlertTriangle size={14} className="mr-1" /> Override Adjustment
                                            </div>
                                            <span className={`text-sm font-medium ${record.overrideAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {record.overrideAmount > 0 ? '+' : ''}<RoyaltyAmount amount={record.overrideAmount} size="sm" className="text-current" />
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-gray-900 font-bold text-lg uppercase tracking-tight">Final Payable Amount</span>
                                        <RoyaltyAmount amount={record.finalAmount} size="xl" className="text-indigo-700" />
                                    </div>

                                    {record.note && (
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md flex items-start">
                                            <Info size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                                            <p className="text-xs text-blue-700 italic">"{record.note}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Timeline & Notes */}
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg border border-gray-200 p-5">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
                            <History className="w-5 h-5 mr-2 text-gray-400" /> Approval History
                        </h2>
                        {isHistoryLoading ? (
                            <div className="text-center py-4 text-gray-400 text-sm">Loading timeline...</div>
                        ) : (
                            <ApprovalTimeline history={history || []} />
                        )}
                    </div>

                    {/* Instructions Box */}
                    <div className="bg-zinc-900 text-zinc-400 p-5 rounded-lg border border-zinc-800 shadow-lg">
                        <h3 className="text-zinc-100 font-medium mb-3 flex items-center text-sm">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                            Workflow Rules
                        </h3>
                        <ul className="text-xs space-y-2 leading-relaxed">
                            <li>• Calculations are automatically generated upon article publication.</li>
                            <li>• Editors verify the word count and content quality.</li>
                            <li>• Managing Editors approve high-value or investigative pieces.</li>
                            <li>• Finance verifies payment data and issues funds.</li>
                            <li>• Overrides require a mandatory explanation for audit trail.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <ConfirmActionModal
                isOpen={!!confirmModal}
                onClose={() => setConfirmModal(null)}
                onConfirm={handleAction}
                title={confirmModal?.title || ''}
                message={confirmModal?.message || ''}
                isDestructive={confirmModal?.action === 'REJECT'}
            />

            <OverrideModal
                isOpen={isOverrideOpen}
                onClose={() => setIsOverrideOpen(false)}
                currentAmount={record.finalAmount}
                onSubmit={handleOverride}
            />
        </div>
    );
};

export default RoyaltyRecordDetail;
