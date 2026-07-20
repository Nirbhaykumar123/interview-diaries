import { Briefcase, MapPin } from 'lucide-react';

interface CompanyStatsProps {
  interviewCount: number;
  location?: string | null;
}

/**
 * CompanyStats renders structured card elements displaying company performance metrics.
 */
export default function CompanyStats({ interviewCount, location }: CompanyStatsProps) {
  const stats = [
    {
      label: 'Shared Experiences',
      value: interviewCount,
      subtext: `${interviewCount === 1 ? 'review' : 'reviews'} shared by students`,
      icon: Briefcase,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Location',
      value: location || 'Multiple',
      subtext: 'Primary office / headquarters',
      icon: MapPin,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
