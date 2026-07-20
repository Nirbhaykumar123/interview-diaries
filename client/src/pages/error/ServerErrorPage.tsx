import { AlertOctagon } from 'lucide-react';
import Button from '../../components/common/Button';

/**
 * ServerErrorPage (500 Error page)
 * Displayed when there is an internal server error or database query crash.
 */
export default function ServerErrorPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100">
        <AlertOctagon className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Internal Server Error
      </h1>
      <p className="mt-4 text-base text-slate-500 max-w-md leading-relaxed">
        The server encountered an unexpected error and could not complete your request. 
        We have been notified and are working on resolving this issue.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button
          onClick={() => window.location.reload()}
          variant="primary"
          className="px-6"
        >
          Reload Page
        </Button>
        <a
          href="/"
          className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  );
}
