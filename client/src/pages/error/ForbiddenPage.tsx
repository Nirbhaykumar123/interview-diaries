import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

/**
 * ForbiddenPage (403 Error page)
 * Displayed when a user attempts to access a resource/admin dashboard 
 * that they do not have permissions to view.
 */
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Access Denied
      </h1>
      <p className="mt-4 text-base text-slate-500 max-w-md leading-relaxed">
        You do not have permission to access this page. This area requires administrative or moderator level authentication bounds.
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Back to Safety
        </Link>
      </div>
    </div>
  );
}
