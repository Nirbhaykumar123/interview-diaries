import { useState } from 'react';
import { useAdminAuditLogsQuery } from '../../hooks/useAdmin';
import { Loader2, Calendar, User } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

/**
 * Renders changes safely, avoiding JSON parse error crashes.
 */
function FormatStateChange({ stateString }: { stateString: string | null }) {
  if (!stateString) return <span className="text-slate-400 font-semibold italic">None</span>;

  try {
    const parsed = JSON.parse(stateString);
    return (
      <pre className="text-[10px] bg-slate-50 border border-slate-100 p-2 rounded-lg text-slate-600 font-mono whitespace-pre-wrap max-w-xs max-h-[80px] overflow-y-auto">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  } catch (err) {
    return <span className="font-mono text-slate-500">{stateString}</span>;
  }
}

/**
 * AdminAuditLogsPage displays immutable chronological records (Admin only).
 */
export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading, isPlaceholderData } = useAdminAuditLogsQuery({
    page,
    limit,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-950">System Audit Trail</h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Immutable record of all verification reviews and moderation choices.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl min-h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : !data || data.logs.length === 0 ? (
        <EmptyState
          title="No audit logs recorded"
          description="Actions will automatically appear here once moderators verify or flag content."
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Moderator / Actor</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Target (Type & ID)</th>
                    <th className="px-6 py-4">Previous State</th>
                    <th className="px-6 py-4">New State</th>
                    <th className="px-6 py-4">Explanation / Reason</th>
                    <th className="px-6 py-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] md:text-xs text-slate-700">
                  {data.logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors align-top">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {log.actor.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">{log.actor.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-700 uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">{log.targetType}</div>
                        <div className="text-[10px] text-slate-400 font-semibold font-mono truncate max-w-[100px]" title={log.targetId}>
                          {log.targetId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <FormatStateChange stateString={log.previousState} />
                      </td>
                      <td className="px-6 py-4">
                        <FormatStateChange stateString={log.newState} />
                      </td>
                      <td className="px-6 py-4 max-w-xs whitespace-normal leading-relaxed text-slate-600 font-medium">
                        {log.reason || <span className="italic text-slate-300">None logged</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-semibold">
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
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
    </div>
  );
}
