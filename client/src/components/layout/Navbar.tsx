import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, BookOpen, Search, Building2, Home } from 'lucide-react';
import UserDropdown from './UserDropdown';

interface NavbarProps {
  user: {
    fullName: string;
    email: string;
    avatarUrl?: string;
  } | null;
  onLogout?: () => void;
}

/**
 * Navbar is the primary header navbar for public pages.
 * Fully responsive: collapses into a mobile hamburger menu overlay on smaller viewports.
 * Displays navigation links and user auth state.
 */
export default function Navbar({ user, onLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-8">
        {/* Branding Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span>Interview Diaries</span>
        </Link>

        {/* Desktop Navigation Link Menu */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-slate-900 ${
                isActive ? 'text-slate-900' : 'text-slate-500'
              }`
            }
          >
            <Home className="h-4 w-4" />
            Home
          </NavLink>
          <NavLink
            to="/companies"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-slate-900 ${
                isActive ? 'text-slate-900' : 'text-slate-500'
              }`
            }
          >
            <Building2 className="h-4 w-4" />
            Companies
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-slate-900 ${
                isActive ? 'text-slate-900' : 'text-slate-500'
              }`
            }
          >
            <Search className="h-4 w-4" />
            Browse Diaries
          </NavLink>
        </nav>

        {/* Desktop Auth Call-to-actions / User Profile Dropdown */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <UserDropdown user={user} onLogout={onLogout} />
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Switch */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors text-slate-500 focus:outline-none"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Navigation */}
      {isMobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-6 py-6 shadow-inner md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-base font-medium text-slate-600 hover:text-slate-900"
            >
              <Home className="h-5 w-5" />
              Home
            </Link>
            <Link
              to="/companies"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-base font-medium text-slate-600 hover:text-slate-900"
            >
              <Building2 className="h-5 w-5" />
              Companies
            </Link>
            <Link
              to="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-base font-medium text-slate-600 hover:text-slate-900"
            >
              <Search className="h-5 w-5" />
              Browse Diaries
            </Link>
            <hr className="border-slate-100" />
            {user ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Settings</p>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="text-left text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center rounded-lg border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
