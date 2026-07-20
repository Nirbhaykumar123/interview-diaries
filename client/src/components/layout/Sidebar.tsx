import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  User,
  Settings,
  BookOpen,
  BarChart2,
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ScrollText,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

/**
 * Sidebar is the dashboard navigation sidebar drawer.
 * Displays navigation items to access Dashboard pages, highlighting
 * the active route using NavLink attributes.
 */
export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const { user } = useAuth();
  
  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/interviews', label: 'My Interviews', icon: FileText },
    { to: '/dashboard/interviews/create', label: 'Share Experience', icon: PlusCircle },
    { to: '/dashboard/stats', label: 'Statistics', icon: BarChart2 },
    { to: '/dashboard/profile', label: 'My Profile', icon: User },
  ];

  const isModOrAdmin = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');
  const isAdmin = user && user.role === 'ADMIN';

  const adminItems = [
    { to: '/admin', label: 'Moderation Hub', icon: ShieldCheck },
    { to: '/admin/verifications', label: 'Verification Queue', icon: ShieldAlert },
    { to: '/admin/reports', label: 'Flagged Reports', icon: AlertTriangle },
  ];

  if (isAdmin) {
    adminItems.push({ to: '/admin/audit-logs', label: 'System Audit Trail', icon: ScrollText });
  }

  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      {/* Sidebar Header / Branding */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <BookOpen className="h-5 w-5 text-slate-900" />
          <span>Interview Diaries</span>
        </Link>
      </div>

      {/* Main Navigation links list */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}

        {isModOrAdmin && (
          <div className="pt-6 mt-6 border-t border-slate-100 space-y-1">
            <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Moderator Area</p>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Sidebar Footer context links */}
      <div className="border-t border-slate-100 p-4">
        <NavLink
          to="/dashboard/settings"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          <Settings className="h-4 w-4" />
          Account Settings
        </NavLink>
      </div>
    </div>
  );
}
