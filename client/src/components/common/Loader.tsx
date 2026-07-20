import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

/**
 * Reusable Loader component displaying a rotating loading spinner.
 * Supports inline loaders and full-screen overlay blockers.
 */
export default function Loader({ className, size = 'md', fullScreen = false, message }: LoaderProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const loaderElement = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-slate-900', sizes[size])} />
      {message && <p className="text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {loaderElement}
      </div>
    );
  }

  return loaderElement;
}
