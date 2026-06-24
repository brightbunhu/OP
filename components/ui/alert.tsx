import { cn } from '@/lib/utils';

export function Alert({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'destructive' | 'success' }) {
  return (
    <div
      className={cn(
        'rounded-md border px-4 py-3 text-sm',
        variant === 'destructive' && 'border-destructive/30 bg-destructive/10 text-destructive',
        variant === 'success' && 'border-primary/30 bg-primary/10 text-primary',
        variant === 'default' && 'bg-muted text-foreground',
        className,
      )}
      {...props}
    />
  );
}
