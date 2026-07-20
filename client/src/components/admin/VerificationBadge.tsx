import { ShieldCheck } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified?: boolean;
  className?: string;
}

/**
 * VerificationBadge renders a premium trust checkmark icon.
 */
export default function VerificationBadge({ isVerified = false, className = '' }: VerificationBadgeProps) {
  if (!isVerified) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 shadow-sm select-none ${className}`}
      title="Verified Experience (Employer/Process validated)"
    >
      <ShieldCheck className="h-3.5 w-3.5 text-blue-500 fill-white" />
      <span>Verified</span>
    </span>
  );
}
