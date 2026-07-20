import { Inbox } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

/**
 * Reusable EmptyState component.
 * Rendered when queries return empty lists to guide user interaction.
 */
export default function EmptyState({
  title = 'No records found',
  description = 'There is no data to display in this list at the moment.',
  icon,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
      {/* Icon frame */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      
      {/* Description text */}
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
      
      {/* Action button */}
      {actionText && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} variant="outline" size="sm">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
