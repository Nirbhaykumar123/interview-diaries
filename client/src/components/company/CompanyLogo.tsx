import { getInitials, generateAvatarColor } from '../../utils';
import { cn } from '../../lib/utils';

interface CompanyLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * CompanyLogo renders a company image or falls back to stylized initials
 * using a deterministic background color based on name hash.
 */
export default function CompanyLogo({ name, logoUrl, size = 'md', className }: CompanyLogoProps) {
  const initials = getInitials(name);
  const avatarColor = generateAvatarColor(name);

  const sizes = {
    sm: 'h-10 w-10 text-xs rounded-lg',
    md: 'h-14 w-14 text-sm rounded-xl',
    lg: 'h-20 w-20 text-lg rounded-2xl',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center font-bold uppercase select-none border border-slate-200 bg-white shadow-sm overflow-hidden shrink-0',
        sizes[size],
        !logoUrl && avatarColor,
        className
      )}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`${name} Logo`}
          className="h-full w-full object-contain p-1"
          onError={(e) => {
            // Fallback to initials if image loading fails
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
