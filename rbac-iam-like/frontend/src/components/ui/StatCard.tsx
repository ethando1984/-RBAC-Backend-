import { Card, CardContent } from './Card';
import { cn } from '../../lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    className?: string;
}

export function StatCard({ title, value, description, icon, className }: StatCardProps) {
    return (
        <Card className={cn('overflow-hidden border-none', className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                        <div className="flex items-baseline space-x-2">
                            <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
                        </div>
                        {description && (
                            <p className="text-xs text-gray-400 font-medium">{description}</p>
                        )}
                    </div>
                    {icon && (
                        <div className="p-3 rounded-xl bg-primary-50 text-primary-500">
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
