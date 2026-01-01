import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
    action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{title}</h1>
                <p className="text-gray-500 text-sm mt-1 font-bold">{description}</p>
            </div>
            {action && (
                <div className="flex-shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}
