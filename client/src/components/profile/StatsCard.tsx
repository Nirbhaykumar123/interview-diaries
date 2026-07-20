interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  /** Tailwind bg + text color class pair e.g. "bg-blue-50 text-blue-600" */
  color: string;
}

/**
 * StatsCard renders a single metric block with an icon badge.
 * Used in both the Dashboard overview and the public profile page.
 */
export default function StatsCard({ label, value, icon: Icon, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
        <p className="text-xs font-semibold text-slate-500 mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}
