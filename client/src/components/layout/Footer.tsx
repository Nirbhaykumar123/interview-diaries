import { Link } from 'react-router-dom';

/**
 * Footer is a shared layout footer component.
 * Displays copyright info, project details, and useful links.
 */
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 text-slate-500">
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <Link to="/" className="text-lg font-bold text-slate-900 hover:opacity-90 transition-opacity">
              Interview Diaries 📚
            </Link>
            <p className="text-xs">A platform to share and learn from interview experiences.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <Link to="/search" className="hover:text-slate-900 transition-colors">Browse Diaries</Link>
            <Link to="/about" className="hover:text-slate-900 transition-colors">About Project</Link>
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
          </nav>
        </div>
        <hr className="my-8 border-slate-100" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Interview Diaries. All rights reserved.</p>
          <p>Made for placements portfolio presentation.</p>
        </div>
      </div>
    </footer>
  );
}
