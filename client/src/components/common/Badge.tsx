import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
}

/**
 * Reusable Badge status chip component.
 * Used for outcome statuses, difficulty levels, and metadata tags.
 */
export default function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-800 hover:bg-slate-200/80',
    success: 'bg-green-50 text-green-700 border border-green-200/50 hover:bg-green-100/50',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/50 hover:bg-amber-100/50',
    destructive: 'bg-red-50 text-red-700 border border-red-200/50 hover:bg-red-100/50',
    info: 'bg-blue-50 text-blue-700 border border-blue-200/50 hover:bg-blue-100/50',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold select-none transition-colors border border-transparent',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
