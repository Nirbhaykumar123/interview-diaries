import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

/**
 * NotFoundPage (404 Error Page)
 * Premium animated 404 — displayed when a route does not exist.
 */
export default function NotFoundPage() {
  return (
    <main
      className="flex min-h-[80vh] flex-col items-center justify-center text-center px-6"
      aria-labelledby="not-found-heading"
    >
      {/* Large decorative 404 */}
      <div className="relative select-none mb-6" aria-hidden="true">
        <span className="text-[9rem] font-black leading-none tracking-tighter text-slate-100 sm:text-[12rem]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-200">
            <span className="text-3xl">🔍</span>
          </div>
        </div>
      </div>

      <h1 id="not-found-heading" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        This page doesn't exist
      </h1>
      <p className="mt-3 max-w-md text-base text-slate-500 leading-relaxed">
        The link you followed may be broken, or the page may have been removed.
        Try browsing experiences or heading back home.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          id="not-found-home-btn"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-0.5"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          to="/search"
          id="not-found-browse-btn"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:-translate-y-0.5"
        >
          <Search className="h-4 w-4" />
          Browse Diaries
        </Link>
      </div>
    </main>
  );
}
