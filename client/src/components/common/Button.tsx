import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

/**
 * Reusable Button component with multiple visual variants and sizing options.
 * Supports loading states and respects native HTML button behaviors.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    // Styling dictionaries mapping variants
    const variants = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-950 active:bg-slate-950',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-200 active:bg-slate-300',
      outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-200',
      ghost: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-200',
      link: 'text-slate-900 underline-offset-4 hover:underline focus-visible:ring-slate-900 p-0',
      destructive: 'bg-red-600 text-white hover:bg-red-50 hover:bg-red-700 focus-visible:ring-red-600',
    };

    // Styling dictionaries mapping sizes
    const sizes = {
      sm: 'h-9 rounded-lg px-3 text-xs',
      md: 'h-10 rounded-lg px-4 py-2 text-sm',
      lg: 'h-11 rounded-lg px-8 text-base',
      icon: 'h-10 w-10 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base button layout rules
          'inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
