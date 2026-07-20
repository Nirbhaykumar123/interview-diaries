interface UserAvatarProps {
  avatarUrl?: string | null;
  fullName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

/**
 * UserAvatar renders a profile image or a fallback initials badge.
 * Initials are derived from the user's full name (first 2 words).
 */
export default function UserAvatar({ avatarUrl, fullName, size = 'md', className = '' }: UserAvatarProps) {
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  const sizeClass = sizeMap[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${fullName} profile picture`}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white shadow-sm ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-slate-900 text-white font-bold flex items-center justify-center ring-2 ring-white shadow-sm select-none ${className}`}
      aria-label={`${fullName} avatar`}
    >
      {initials || '?'}
    </div>
  );
}
