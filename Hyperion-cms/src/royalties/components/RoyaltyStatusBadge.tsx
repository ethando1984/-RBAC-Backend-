import React from 'react';
import { RoyaltyStatus } from '../types/royalty';
import { twMerge } from 'tailwind-merge';

interface Props {
    status: RoyaltyStatus | string;
    className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
    CALCULATED: { label: 'Calculated', style: 'bg-gray-100 text-gray-700 border-gray-200' },
    EDITOR_CONFIRMED: { label: 'Editor Confirmed', style: 'bg-blue-50 text-blue-700 border-blue-200' },
    MANAGER_APPROVED: { label: 'Manager Approved', style: 'bg-purple-50 text-purple-700 border-purple-200' },
    FINANCE_APPROVED: { label: 'Finance Approved', style: 'bg-orange-50 text-orange-700 border-orange-200' },
    PAID: { label: 'Paid', style: 'bg-green-50 text-green-700 border-green-200' },
    REJECTED: { label: 'Rejected', style: 'bg-red-50 text-red-700 border-red-200' },
    VOIDED: { label: 'Voided', style: 'bg-zinc-100 text-zinc-500 border-zinc-200 strike-through' },
};

export const RoyaltyStatusBadge: React.FC<Props> = ({ status, className }) => {
    const config = STATUS_CONFIG[status] || { label: status, style: 'bg-gray-100 text-gray-500' };

    return (
        <span className={twMerge('px-2.5 py-0.5 rounded-full text-xs font-medium border', config.style, className)}>
            {config.label}
        </span>
    );
};
