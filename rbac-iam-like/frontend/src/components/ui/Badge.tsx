import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary-500 text-white hover:bg-primary-600',
                secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
                success: 'border-transparent bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
                warning: 'border-transparent bg-amber-500/10 text-amber-500 border border-amber-500/20',
                danger: 'border-transparent bg-rose-500/10 text-rose-500 border border-rose-500/20',
                outline: 'text-gray-900 border border-gray-200 hover:bg-gray-50',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
