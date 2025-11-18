import React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = (variant = 'default', size = 'default') => {
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-2)]',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  return cn(baseStyles, variants[variant], sizes[size]);
};

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      className={cn(buttonVariants(variant, size), className)}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = 'Button';

export { Button, buttonVariants };
