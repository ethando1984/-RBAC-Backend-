import React from 'react';

interface PageShellProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({ title, description, actions, children }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
            <div className="min-h-[500px]">
                {children}
            </div>
        </div>
    );
};
