import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-secondary',
  secondary: 'bg-muted text-foreground hover:bg-muted/80',
  success: 'bg-accent text-accent-foreground hover:bg-accent/90',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
}

export function Button({ asChild, className, variant = 'primary', ...props }: ButtonProps) {
  const classes = cn(
    'inline-flex h-11 items-center justify-center rounded-[12px] px-5 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100',
    variants[variant],
    className,
  );

  if (asChild && React.isValidElement(props.children)) {
    const child = props.children as React.ReactElement<{ className?: string }>;

    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
    } as Partial<React.HTMLAttributes<HTMLElement>>);
  }

  return <button className={classes} {...props} />;
}
