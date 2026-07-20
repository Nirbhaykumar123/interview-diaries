import { FileText, Trophy, ThumbsUp, BarChart2, Star, CheckCircle } from 'lucide-react';
import { useMeQuery, useStatsQuery } from '../hooks/useUser';
import StatsCard from '../components/profile/StatsCard';
import Loader from '../components/common/Loader';
import { Link } from 'react-router-dom';

/**
 * DashboardStatsPage shows a detailed personal performance breakdown.
 * Explains how each metric is calculated for full transparency.
 */
export default function DashboardStatsPage() {
  const { data: user, isLoading: userLoading } = useMeQuery();
  const { data: stats, isLoading: statsLoading } = useStatsQuery();

  if (userLoading || statsLoading) {
    return <Loader message="Loading your statistics..." />;
  }

  const completion = stats?.profileCompletion ?? 0;

  const completionItems = [
    { label: 'Full name provided', done: !!(user?.fullName), points: 10 },
    { label: 'College / university added', done: !!(user?.college), points: 15 },
    { label: 'Branch / major added', done: !!(user?.branch), points: 15 },
    { label: 'Graduation year set', done: !!(user?.graduationYear), points: 10 },
    { label: 'Bio written', done: !!(user?.profile?.bio), points: 20 },
    { label: 'Profile picture uploaded', done: !!(user?.profile?.avatarUrl), points: 10 },
    { label: 'LinkedIn or GitHub added', done: !!(user?.profile?.linkedinUrl || user?.profile?.githubUrl), points: 10 },
    { label: 'At least one skill listed', done: (user?.profile?.skills?.length ?? 0) > 0, points: 10 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Statistics</h1>
        <p className="text-sm text-slate-500">
          Your activity summary across Interview Diaries.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatsCard
          label="Interviews Shared"
          value={stats?.totalInterviews ?? 0}
          icon={FileText}
          color="bg-blue-50 text-blue-600"
        />
        <StatsCard
          label="Offers Received"
          value={stats?.offersReceived ?? 0}
          icon={Trophy}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatsCard
          label="Helpful Votes Received"
          value={stats?.helpfulVotesReceived ?? 0}
          icon={ThumbsUp}
          color="bg-violet-50 text-violet-600"
        />
        <StatsCard
          label="Profile Completion"
          value={`${completion}%`}
          icon={BarChart2}
          color="bg-slate-100 text-slate-600"
        />
        {(stats?.totalInterviews ?? 0) > 0 && (
          <StatsCard
            label="Offer Rate"
            value={`${Math.round(((stats?.offersReceived ?? 0) / (stats?.totalInterviews ?? 1)) * 100)}%`}
            icon={Star}
            color="bg-rose-50 text-rose-600"
          />
        )}
      </div>

      {/* How stats are calculated */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          How These Numbers Are Calculated
        </h3>
        <div className="space-y-3 text-xs text-slate-600">
          <p><span className="font-bold text-slate-900">Interviews Shared:</span> Total count of all interview diaries you've created, including both published and draft posts.</p>
          <p><span className="font-bold text-slate-900">Offers Received:</span> Count of your diaries where you marked the outcome as "Selected / Offered".</p>
          <p><span className="font-bold text-slate-900">Helpful Votes:</span> Sum of all helpful upvotes received across all your published interview diaries.</p>
          <p><span className="font-bold text-slate-900">Offer Rate:</span> (Offers ÷ Total Interviews) × 100. Reflects your success ratio.</p>
          <p><span className="font-bold text-slate-900">Profile Completion:</span> Weighted score across 8 profile attributes (see breakdown below).</p>
        </div>
      </div>

      {/* Profile completeness breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Profile Completeness Breakdown</h3>
          <span className="text-lg font-bold text-slate-900">{completion}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-700"
            style={{ width: `${completion}%` }}
          />
        </div>

        <div className="space-y-2.5">
          {completionItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle
                  className={`h-4 w-4 shrink-0 ${
                    item.done ? 'text-emerald-500' : 'text-slate-300'
                  }`}
                />
                <span className={`text-xs font-semibold ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {item.label}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500 shrink-0">+{item.points}%</span>
            </div>
          ))}
        </div>

        {completion < 100 && (
          <Link
            to="/dashboard/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Complete Your Profile
          </Link>
        )}
      </div>
    </div>
  );
}
