import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, BookMarked, ChevronDown } from 'lucide-react';
import { getInitials, generateAvatarColor } from '../../utils';
import { cn } from '../../lib/utils';

interface UserDropdownProps {
  user: {
    fullName: string;
    email: string;
    avatarUrl?: string;
  } | null;
  onLogout?: () => void;
}

/**
 * UserDropdown handles dashboard settings for the logged-in user.
 * Displays user avatar, name, and opens a dropdown list containing links
 * to Profile Settings, Bookmarks, and Logout actions.
 */
export default function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside the component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = getInitials(user.fullName);
  const avatarColor = generateAvatarColor(user.fullName);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 transition-colors focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold uppercase", avatarColor)}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className="hidden text-sm font-medium text-slate-700 md:block">{user.fullName}</span>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <Link
              to="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <User className="h-4 w-4 text-slate-400" />
              My Profile
            </Link>
            <Link
              to="/dashboard/bookmarks"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <BookMarked className="h-4 w-4 text-slate-400" />
              Bookmarks
            </Link>
            <Link
              to="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Account Settings
            </Link>
          </div>
          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onLogout) onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-400" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
