import { useState } from 'react';
import { useAdminVerificationsQuery } from '../../hooks/useAdmin';
import ReviewDialog from '../../components/admin/ReviewDialog';
import { Eye, Loader2, Calendar } from 'lucide-react';
import { VerificationRequestData } from '../../api/admin.api';
import EmptyState from '../../components/common/EmptyState';

/**
 * AdminVerificationsPage renders the moderator verification queue.
 */
export default function AdminVerificationsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedStatus, setSelectedStatus] = useState<'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');

  const [activeRequest, setActiveRequest] = useState<VerificationRequestData | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const { data, isLoading, isPlaceholderData } = useAdminVerificationsQuery({
    page,
    limit,
    status: selectedStatus,
  });

  const handleOpenReview = (request: VerificationRequestData) => {
    setActiveRequest(request);
    setIsReviewOpen(true);
  };

  const handleStatusTabChange = (status: 'PENDING' | 'VERIFIED' | 'REJECTED') => {
    setSelectedStatus(status);
    setPage(1); // Reset page to 1
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">Verification Queue</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Approve or reject candidate proof of experience credentials.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        {(['PENDING', 'VERIFIED', 'REJECTED'] as const).map((status) => (
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
      ) : !data || data.verifications.length === 0 ? (
        <EmptyState
          title={`No ${selectedStatus.toLowerCase()} verifications`}
          description="Everything is caught up in this queue!"
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Experience</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {data.verifications.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.interview.author.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">@{item.interview.author.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{item.interview.role}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                          {item.interview.company.name} • {item.interview.type}
                        </div>
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
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenReview(item)}
                          className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white font-bold text-slate-700 hover:text-slate-900 transition-colors shadow-sm text-[10px] md:text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Review
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

      {/* Verification review dialog portal */}
      <ReviewDialog
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        verification={activeRequest}
      />
    </div>
  );
}
