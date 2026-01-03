import React from 'react';

interface Props {
    amount: number;
    currency?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const RoyaltyAmount: React.FC<Props> = ({ amount, currency = 'VND', size = 'md', className }) => {
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    const sizeClass = {
        sm: 'text-sm',
        md: 'text-base font-medium',
        lg: 'text-lg font-semibold',
        xl: 'text-2xl font-bold'
    }[size];

    return (
        <span className={`${sizeClass} ${className || ''} text-zinc-900`}>
            {formatter.format(amount)}
        </span>
    );
};
