import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border-border bg-transparent text-foreground hover:bg-muted/70',
        accent: 'border-transparent bg-accent text-accent-foreground hover:bg-accent/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const Badge = ({ className, variant, ...props }) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};
