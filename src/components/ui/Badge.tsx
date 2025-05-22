import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-success text-success-foreground hover:bg-success/80',
        warning: 'border-transparent bg-warning text-warning-foreground hover:bg-warning/80',
      },
      status: {
        pending: 'bg-warning/20 border-warning/50 text-warning-foreground',
        approved: 'bg-success/20 border-success/50 text-success-foreground',
        rejected: 'bg-destructive/20 border-destructive/50 text-destructive-foreground',
      }
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, status, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, status, className }))}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };