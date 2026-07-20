import { useState } from 'react';
import { Search, SlidersHorizontal, Trash2, HelpCircle, X } from 'lucide-react';
import { useInterviewsQuery } from '../hooks';
import InterviewCard from '../components/interview/InterviewCard';
import Button from '../components/common/Button';
import useDebounce from '../hooks/useDebounce';
import Pagination from '../components/common/Pagination';

export default function SearchFeedPage() {
  // Query Filter States
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [type, setType] = useState<'INTERNSHIP' | 'PLACEMENT' | 'ALL'>('ALL');
  const [outcome, setOutcome] = useState<'SELECTED' | 'REJECTED' | 'PENDING' | 'ALL'>('ALL');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Mobil overlay control
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Construct API params object (skip filter keys if 'ALL' is selected)
  const queryParams = {
    page,
    limit: 6,
    search: debouncedSearch || undefined,
    type: type !== 'ALL' ? type : undefined,
    outcome: outcome !== 'ALL' ? outcome : undefined,
    difficulty: difficulty !== 'ALL' ? difficulty : undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, error } = useInterviewsQuery(queryParams);

  const interviews = data?.interviews || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalItems: 0, hasNextPage: false, hasPreviousPage: false };

  const handleClearFilters = () => {
    setSearch('');
    setType('ALL');
    setOutcome('ALL');
    setDifficulty('ALL');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const isFiltered =
    search !== '' || type !== 'ALL' || outcome !== 'ALL' || difficulty !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Title banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interview Feed</h1>
          <p className="text-sm text-slate-500">Learn from actual questions, rounds, and tips shared by peers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Desktop Filter Sidebar */}
        <div className="hidden lg:block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6 self-start">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              <span>Filters</span>
            </h3>
            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-red-600 font-semibold flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {/* Filter 1: Interview Type */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Interview Type</p>
            <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
              {['ALL', 'PLACEMENT', 'INTERNSHIP'].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={type === t}
                    onChange={() => { setType(t as any); setPage(1); }}
                    className="h-4 w-4 border-slate-300 text-slate-950 focus:ring-slate-950"
                  />
                  <span>{t === 'ALL' ? 'All Experiences' : t === 'PLACEMENT' ? 'Placement (FT)' : 'Internship'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter 2: Verdict Outcome */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Verdict Status</p>
            <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
              {['ALL', 'SELECTED', 'REJECTED', 'PENDING'].map((o) => (
                <label key={o} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="outcome"
                    checked={outcome === o}
                    onChange={() => { setOutcome(o as any); setPage(1); }}
                    className="h-4 w-4 border-slate-300 text-slate-950 focus:ring-slate-950"
                  />
                  <span>{o === 'ALL' ? 'All Outcoms' : o === 'SELECTED' ? 'Offered' : o === 'REJECTED' ? 'Rejected' : 'Pending'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter 3: Difficulty */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Difficulty</p>
            <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
              {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((d) => (
                <label key={d} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    checked={difficulty === d}
                    onChange={() => { setDifficulty(d as any); setPage(1); }}
                    className="h-4 w-4 border-slate-300 text-slate-950 focus:ring-slate-950"
                  />
                  <span>{d === 'ALL' ? 'All Levels' : d === 'EASY' ? 'Easy' : d === 'MEDIUM' ? 'Medium' : 'Hard'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Main Search & Feed Listing */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search bar and Sort settings */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search job roles, questions asked (e.g. SDE, Binary Tree)..."
                className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:border-slate-900 focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="lg:hidden flex gap-1.5 h-10 items-center justify-center text-xs font-bold text-slate-600 shrink-0"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </Button>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as any);
                  setPage(1);
                }}
                className="h-10 border border-slate-200 bg-white rounded-lg px-3 text-xs font-semibold focus:border-slate-900 focus:outline-none"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="helpfulCount-desc">Most Helpful</option>
              </select>
            </div>
          </div>

          {/* Active Chips row */}
          {isFiltered && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span>Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-1 rounded-md border border-slate-200">
                  Search: {search}
                  <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => setSearch('')} />
                </span>
              )}
              {type !== 'ALL' && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-1 rounded-md border border-slate-200">
                  Type: {type}
                  <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => setType('ALL')} />
                </span>
              )}
              {outcome !== 'ALL' && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-1 rounded-md border border-slate-200">
                  Outcome: {outcome}
                  <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => setOutcome('ALL')} />
                </span>
              )}
              {difficulty !== 'ALL' && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-1 rounded-md border border-slate-200">
                  Difficulty: {difficulty}
                  <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => setDifficulty('ALL')} />
                </span>
              )}
            </div>
          )}

          {/* Grid listing */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-44 w-full bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm text-sm text-red-500 font-semibold">
              Failed to fetch search results. Verify network link.
            </div>
          ) : interviews.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <HelpCircle className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-base font-bold text-slate-900">No diaries found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No interview experiences match your keywords. Try clearing search filters or checking for typos.
              </p>
              <Button size="sm" variant="outline" onClick={handleClearFilters}>
                Reset Filter Settings
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviews.map((post) => (
                  <InterviewCard key={post.id} interview={post} />
                ))}
              </div>

              {/* Offset Pagination Controls footer */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center pt-4">
                  <Pagination
                    currentPage={page}
                    totalPages={pagination.totalPages}
                    onPageChange={(p) => setPage(p)}
                    hasNextPage={pagination.hasNextPage}
                    hasPreviousPage={pagination.hasPreviousPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar overlay Drawer panel */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-end">
          <div className="bg-white w-80 h-full p-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <p className="text-sm font-bold text-slate-900">Filter Criteria</p>
                <X className="h-5 w-5 cursor-pointer text-slate-500" onClick={() => setShowMobileFilters(false)} />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Interview Type</p>
                <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                  {['ALL', 'PLACEMENT', 'INTERNSHIP'].map((t) => (
                    <label key={t} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mob-type"
                        checked={type === t}
                        onChange={() => { setType(t as any); setPage(1); }}
                      />
                      <span>{t === 'ALL' ? 'All' : t === 'PLACEMENT' ? 'Full-Time' : 'Internship'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Outcome</p>
                <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                  {['ALL', 'SELECTED', 'REJECTED', 'PENDING'].map((o) => (
                    <label key={o} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mob-outcome"
                        checked={outcome === o}
                        onChange={() => { setOutcome(o as any); setPage(1); }}
                      />
                      <span>{o === 'ALL' ? 'All' : o === 'SELECTED' ? 'Offered' : 'Rejected'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="primary" className="w-full h-10" onClick={() => setShowMobileFilters(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
