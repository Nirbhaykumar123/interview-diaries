import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import UserDropdown from '../components/layout/UserDropdown';
import { useAuth } from '../contexts/AuthContext';

/**
 * DashboardLayout is the template for authenticated workspace routes.
 * It contains a sidebar navigation drawer on the left and a scrollable content
 * viewport on the right, capped with a contextual top user action header.
 */
export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Skip to main content — visible only on keyboard focus (screen reader / Tab key) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-slate-900 focus:text-white focus:text-xs focus:font-bold focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-xl"
      >
        Skip to main content
      </a>

      {/* Collapsible Sidebar Drawer Column */}
      <aside
        aria-label="Dashboard navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onCloseMobile={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Mobile Sidebar Overlay back-drop */}
      {isSidebarOpen && (
        <div
          role="presentation"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Viewport Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top User Header Bar */}
        <header
          role="banner"
          className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6"
        >
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-1.5 hover:bg-slate-100 md:hidden text-slate-500"
            aria-label="Open navigation sidebar"
            aria-expanded={isSidebarOpen}
            aria-controls="dashboard-sidebar"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 items-center justify-end">
            <UserDropdown
              user={user ? { fullName: user.fullName, email: user.email, avatarUrl: user.avatarUrl || undefined } : null}
              onLogout={logout}
            />
          </div>
        </header>

        {/* Scrollable Content Viewport */}
        <main
          id="main-content"
          role="main"
          aria-label="Dashboard content"
          className="flex-1 overflow-y-auto px-6 py-8 focus:outline-none"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
