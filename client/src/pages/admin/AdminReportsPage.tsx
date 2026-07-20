import { useState } from 'react';
import { useAdminReportsQuery, useResolveReportMutation } from '../../hooks/useAdmin';
import { Eye, Loader2, Calendar, ShieldAlert, X } from 'lucide-react';
import { AdminReportData } from '../../api/admin.api';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

/**
 * ResolveReportDialog handles resolving individual flagged content reports.
 */
function ResolveReportDialog({
  isOpen,
  onClose,
  report,
}: {
  isOpen: boolean;
  onClose: () => void;
  report: AdminReportData | null;
}) {
  const [status, setStatus] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED');
  const [actionTaken, setActionTaken] = useState<'HIDE_CONTENT' | 'WARN_USER' | 'NONE'>('HIDE_CONTENT');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const resolveMutation = useResolveReportMutation();

  if (!isOpen || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (reason.trim().length < 5) {
      setErrorMsg('Please specify a detailed explanation of at least 5 characters.');
      return;
    }

    try {
      await resolveMutation.mutateAsync({
        reportId: report.id,
        payload: {
          status,
          actionTaken: status === 'RESOLVED' ? actionTaken : 'NONE',
          reason: reason.trim(),
        },
      });
      alert('Report resolved successfully.');
      setReason('');
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Action failed. Please try again.');
    }
  };

  const isSubmitting = resolveMutation.isPending;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] transform transition-all scale-100 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-amber-600">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="font-bold text-slate-950 text-sm md:text-base font-black">Resolve Report</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Details */}
          <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Report Category:</span>{' '}
              <span className="font-bold">{report.reason}</span>
            </div>
            {report.details && (
              <div className="mt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Reporter context:</span>
                <span className="italic">"{report.details}"</span>
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Reported content:</span>
              <p className="font-semibold text-slate-800 bg-white p-2 border border-slate-100 rounded-lg mt-1 whitespace-pre-wrap max-h-[120px] overflow-y-auto">
                {report.interview?.role
                  ? `Experience Post: ${report.interview.role} (${report.interview.company.name})`
                  : report.comment?.content || 'Deleted comment/post'}
              </p>
            </div>
          </div>

          {/* Action selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400">Resolution Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none"
            >
              <option value="RESOLVED">RESOLVED (Guidelines breached, take action)</option>
              <option value="DISMISSED">DISMISSED (Guidelines compliant, false flag)</option>
            </select>
          </div>

          {status === 'RESOLVED' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[10px] uppercase font-bold text-slate-400">Moderation Action</label>
              <select
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value as any)}
                className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none"
              >
                <option value="HIDE_CONTENT">Hide Content (Mark post hidden or delete comment)</option>
                <option value="WARN_USER">Warn User (Send guidelines warning notification)</option>
                <option value="NONE">None (Resolve report without metadata changes)</option>
              </select>
            </div>
          )}

          {/* Reason input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400">Moderator Resolution Explanation</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed explanation for this moderation choice. This will be logged in the system audit trail..."
              rows={3}
              required
              className="w-full text-xs md:text-sm p-3 border border-slate-200 focus:border-slate-950 focus:outline-none rounded-xl bg-white text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-4 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="h-9 px-5 text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 border-amber-600 hover:border-amber-700"
            >
              Confirm Resolution
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * AdminReportsPage lists flagged experience posts and comments.
 */
export default function AdminReportsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedStatus, setSelectedStatus] = useState<'PENDING' | 'RESOLVED' | 'DISMISSED'>('PENDING');

  const [activeReport, setActiveReport] = useState<AdminReportData | null>(null);
  const [isResolveOpen, setIsResolveOpen] = useState(false);

  const { data, isLoading, isPlaceholderData } = useAdminReportsQuery({
    page,
    limit,
    status: selectedStatus,
  });

  const handleOpenResolve = (report: AdminReportData) => {
    setActiveReport(report);
    setIsResolveOpen(true);
  };

  const handleStatusTabChange = (status: 'PENDING' | 'RESOLVED' | 'DISMISSED') => {
    setSelectedStatus(status);
    setPage(1); // Reset page
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'DISMISSED':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">Flagged Reports Queue</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Review user-submitted guideline violations and take content action.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        {(['PENDING', 'RESOLVED', 'DISMISSED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusTabChange(status)}
            className={`pb-2.5 px-4 text-xs font-bold transition-all relative border-b-2 ${
              selectedStatus === status
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl min-h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : !data || data.reports.length === 0 ? (
        <EmptyState
          title={`No ${selectedStatus.toLowerCase()} reports`}
          description="Everything is quiet in this queue!"
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Reporter</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Target Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {data.reports.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.reporter.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">@{item.reporter.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{item.reason}</div>
                        {item.details && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={item.details}>
                            "{item.details}"
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">
                        {item.interview ? 'Interview Diary' : 'Comment Reply'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenResolve(item)}
                          className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white font-bold text-slate-700 hover:text-slate-900 transition-colors shadow-sm text-[10px] md:text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination controls */}
          {data.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400 font-semibold">
                Page {page} of {data.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!data.pagination.hasPreviousPage || isPlaceholderData}
                  className="h-8 px-3 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-600 disabled:opacity-50 transition-colors bg-white shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, data.pagination.totalPages))}
                  disabled={!data.pagination.hasNextPage || isPlaceholderData}
                  className="h-8 px-3 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-600 disabled:opacity-50 transition-colors bg-white shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report resolution Dialog portal */}
      <ResolveReportDialog
        isOpen={isResolveOpen}
        onClose={() => setIsResolveOpen(false)}
        report={activeReport}
      />
    </div>
  );
}
