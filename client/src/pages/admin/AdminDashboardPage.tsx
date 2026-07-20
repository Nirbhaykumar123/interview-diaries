import { useAdminStatsQuery } from '../../hooks/useAdmin';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckSquare, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * AdminDashboardPage displays high-impact statistics cards and action quicklinks.
 */
export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminStatsQuery();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-950">Trust & Safety Moderation Hub</h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1 font-semibold">
          Monitor verification requests, resolve reported guideline violations, and review audit trails.
        </p>
      </div>

      {/* Statistics counters grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Verifications */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pending Verifications</span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : data?.stats.pendingVerifications ?? 0}
            </h3>
            <Link to="/admin/verifications" className="text-[10px] text-blue-600 hover:text-blue-700 font-bold block pt-1">
              Go to queue →
            </Link>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Reports */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Flags</span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : data?.stats.pendingReports ?? 0}
            </h3>
            <Link to="/admin/reports" className="text-[10px] text-amber-600 hover:text-amber-700 font-bold block pt-1">
              Go to queue →
            </Link>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Resolved Today */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Actions Logged (Today)</span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : data?.stats.resolvedCount ?? 0}
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold block pt-1">
              System performance metrics
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
            <CheckSquare className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Moderator Operations Guidance */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 space-y-4 shadow-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-blue-400" />
          <h3 className="text-sm md:text-base font-bold text-slate-100">Moderator Code of Conduct</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-medium">
          As a member of the Trust & Safety team, you hold responsibility for maintaining platform integrity. 
          When reviewing evidence, verify that names, company titles, and timeline dates match the candidate's post. 
          All action logs (Hide, Approve, Reject, Warn) are logged into the system audit trail and cannot be undone or erased.
        </p>
      </div>
    </div>
  );
}
