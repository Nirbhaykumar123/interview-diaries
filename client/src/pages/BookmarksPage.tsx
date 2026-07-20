import { Link } from 'react-router-dom';
import { Bookmark, ExternalLink, Building2 } from 'lucide-react';
import { useBookmarksQuery } from '../hooks/useUser';
import Loader from '../components/common/Loader';

export default function BookmarksPage() {
  const { data: bookmarks = [], isLoading, error } = useBookmarksQuery();

  return (
    <div className="space-y-6" data-testid="bookmarks-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bookmarks</h1>
        <p className="text-sm text-slate-500">Access saved interview diaries for quick preparation.</p>
      </div>

      {isLoading ? (
        <Loader message="Loading bookmarks..." />
      ) : error ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-sm text-red-500 font-semibold">
          Failed to load bookmarks.
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl space-y-3">
          <Bookmark className="h-8 w-8 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-900">No bookmarks yet</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Save interview diaries while browsing the feed and they'll appear here.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors"
            data-testid="browse-diaries-link"
          >
            Browse Diaries
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bookmarks.map((interview: any) => (
            <div
              key={interview.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">
                    {interview.company?.name ?? 'Unknown Company'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{interview.role}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {interview.overallExperience}
              </p>

              <div className="flex items-center justify-between pt-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    interview.outcome === 'SELECTED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : interview.outcome === 'REJECTED'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {interview.outcome}
                </span>
                <Link
                  to={`/interviews/${interview.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  View <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
