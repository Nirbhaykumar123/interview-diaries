import { Link } from 'react-router-dom';
import {
  FileText, Bookmark, ThumbsUp, Trophy, User, ArrowRight, Plus, Star,
} from 'lucide-react';
import { useMeQuery, useStatsQuery } from '../hooks/useUser';
import Loader from '../components/common/Loader';
import ProfileCard from '../components/profile/ProfileCard';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useMeQuery();
  const { data: stats, isLoading: statsLoading } = useStatsQuery();

  if (userLoading || statsLoading) {
    return <Loader message="Loading your dashboard..." />;
  }

  const firstName = user?.fullName?.split(' ')[0] || 'Student';
  const completion = stats?.profileCompletion ?? 0;

  return (
    <div className="space-y-8">
      {/* Greeting header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's an overview of your Interview Diaries activity.
          </p>
        </div>
        <Link
          to="/dashboard/interviews/create"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" /> Share New Experience
        </Link>
      </div>

      {/* Compact profile summary card */}
      {user && (
        <ProfileCard
          compact
          fullName={user.fullName}
          username={user.username}
          avatarUrl={user.profile?.avatarUrl}
          currentRole={user.profile?.currentRole}
          currentCompany={user.profile?.currentCompany}
        />
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Interviews Shared"
          value={stats?.totalInterviews ?? 0}
          icon={FileText}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Offers Received"
          value={stats?.offersReceived ?? 0}
          icon={Trophy}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Helpful Votes"
          value={stats?.helpfulVotesReceived ?? 0}
          icon={ThumbsUp}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Saved Diaries"
          value={stats?.bookmarksCount ?? 0}
          icon={Bookmark}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Profile completeness + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile completion card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Profile Completion</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                A complete profile helps others trust your experiences.
              </p>
            </div>
            <span className="text-2xl font-bold text-slate-900">{completion}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>

          {/* Completion hints */}
          <div className="space-y-2 pt-1">
            {[
              { label: 'Add your college & branch', done: !!(user?.college && user?.branch) },
              { label: 'Write a short bio', done: !!(user?.profile?.bio) },
              { label: 'Upload a profile picture', done: !!(user?.profile?.avatarUrl) },
              { label: 'Add your LinkedIn or GitHub', done: !!(user?.profile?.linkedinUrl || user?.profile?.githubUrl) },
              { label: 'List your skills', done: (user?.profile?.skills?.length ?? 0) > 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-xs">
                <div
                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    item.done
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {item.done && <Star className="h-2.5 w-2.5 text-white" />}
                </div>
                <span className={item.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/dashboard/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Complete your profile <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Quick links panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Quick Actions</h3>
          {[
            { label: 'My Interviews', desc: 'Manage posts & drafts', to: '/dashboard/interviews', icon: FileText },
            { label: 'Bookmarks', desc: 'Access saved diaries', to: '/dashboard/bookmarks', icon: Bookmark },
            { label: 'Edit Profile', desc: 'Update bio and skills', to: '/dashboard/profile', icon: User },
          ].map(({ label, desc, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
            >
              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-slate-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">{label}</p>
                <p className="text-xs text-slate-500 truncate">{desc}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
