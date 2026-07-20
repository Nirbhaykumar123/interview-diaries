interface SkillBadgeProps {
  skill: string;
  variant?: 'default' | 'outline';
}

/**
 * SkillBadge renders a single technical skill chip.
 * Used in profile cards and the profile editor.
 */
export default function SkillBadge({ skill, variant = 'default' }: SkillBadgeProps) {
  if (variant === 'outline') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold tracking-wide">
        {skill}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold tracking-wide">
      {skill}
    </span>
  );
}
