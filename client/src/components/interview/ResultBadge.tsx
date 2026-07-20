import Badge from '../common/Badge';

interface ResultBadgeProps {
  outcome: 'SELECTED' | 'REJECTED' | 'PENDING';
  className?: string;
}

/**
 * ResultBadge renders color-coded indicators for interview selection outcomes.
 */
export default function ResultBadge({ outcome, className }: ResultBadgeProps) {
  const mappings = {
    SELECTED: { label: 'Selected / Offered', variant: 'success' as const },
    REJECTED: { label: 'Rejected', variant: 'destructive' as const },
    PENDING: { label: 'Pending / In-Process', variant: 'info' as const },
  };

  const current = mappings[outcome] || { label: outcome, variant: 'default' as const };

  return (
    <Badge variant={current.variant} className={className}>
      {current.label}
    </Badge>
  );
}
