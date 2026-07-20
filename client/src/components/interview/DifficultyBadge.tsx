import Badge from '../common/Badge';

interface DifficultyBadgeProps {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  className?: string;
}

/**
 * DifficultyBadge renders color-coded chips for interview difficulty levels.
 */
export default function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const mappings = {
    EASY: { label: 'Easy', variant: 'success' as const },
    MEDIUM: { label: 'Medium', variant: 'warning' as const },
    HARD: { label: 'Hard', variant: 'destructive' as const },
  };

  const current = mappings[difficulty] || { label: difficulty, variant: 'default' as const };

  return (
    <Badge variant={current.variant} className={className}>
      {current.label}
    </Badge>
  );
}
