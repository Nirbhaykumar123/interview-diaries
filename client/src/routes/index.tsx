import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from '../layouts/RootLayout';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import AdminRoute from './AdminRoute';
import Loader from '../components/common/Loader';

// ─── Eagerly loaded (critical path — above the fold on first load) ─────────────
import LandingPage from '../pages/LandingPage';
import NotFoundPage from '../pages/error/NotFoundPage';
import ForbiddenPage from '../pages/error/ForbiddenPage';
import ServerErrorPage from '../pages/error/ServerErrorPage';

// ─── Lazily loaded (code-split into separate JS chunks) ───────────────────────
// Public pages: loaded only when the user visits each route
const SearchFeedPage     = lazy(() => import('../pages/SearchFeedPage'));
const CompaniesPage      = lazy(() => import('../pages/CompaniesPage'));
const CompanyDetailsPage = lazy(() => import('../pages/CompanyDetailsPage'));
const InterviewDetailsPage = lazy(() => import('../pages/InterviewDetailsPage'));
const UserProfilePage    = lazy(() => import('../pages/UserProfilePage'));

// Auth pages
const LoginPage    = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'));

// Dashboard pages — never loaded by unauthenticated users
const DashboardPage        = lazy(() => import('../pages/DashboardPage'));
const DashboardStatsPage   = lazy(() => import('../pages/DashboardStatsPage'));
const BookmarksPage        = lazy(() => import('../pages/BookmarksPage'));
const ProfilePage          = lazy(() => import('../pages/ProfilePage'));
const AccountSettingsPage  = lazy(() => import('../pages/AccountSettingsPage'));
const MyInterviewsPage     = lazy(() => import('../pages/MyInterviewsPage'));
const CreateInterviewPage  = lazy(() => import('../pages/CreateInterviewPage'));
const EditInterviewPage    = lazy(() => import('../pages/EditInterviewPage'));

// Admin & Moderation pages
const AdminDashboardPage     = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminVerificationsPage = lazy(() => import('../pages/admin/AdminVerificationsPage'));
const AdminReportsPage       = lazy(() => import('../pages/admin/AdminReportsPage'));
const AdminAuditLogsPage     = lazy(() => import('../pages/admin/AdminAuditLogsPage'));

// ─── Suspense fallback wrapper ─────────────────────────────────────────────────
// Shown while any lazy chunk is downloading. Using our existing Loader component.
function PageLoader() {
  return <Loader message="Loading page..." />;
}

function withSuspense(element: React.ReactElement) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

// ─── Router Definition ─────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      // Public Layout Routes
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <LandingPage /> },
          { path: 'search', element: withSuspense(<SearchFeedPage />) },
          { path: 'companies', element: withSuspense(<CompaniesPage />) },
          { path: 'companies/:slug', element: withSuspense(<CompanyDetailsPage />) },
          { path: 'interviews/:id', element: withSuspense(<InterviewDetailsPage />) },
          { path: 'users/:username', element: withSuspense(<UserProfilePage />) },
          { path: '403', element: <ForbiddenPage /> },
        ],
      },
      // Authenticated User Only Views
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardLayout />,
            children: [
              { index: true, element: withSuspense(<DashboardPage />) },
              { path: 'stats', element: withSuspense(<DashboardStatsPage />) },
              { path: 'interviews', element: withSuspense(<MyInterviewsPage />) },
              { path: 'interviews/create', element: withSuspense(<CreateInterviewPage />) },
              { path: 'interviews/:id/edit', element: withSuspense(<EditInterviewPage />) },
              { path: 'bookmarks', element: withSuspense(<BookmarksPage />) },
              { path: 'profile', element: withSuspense(<ProfilePage />) },
              { path: 'settings', element: withSuspense(<AccountSettingsPage />) },
            ],
          },
        ],
      },
      // Moderator & Admin Only Views
      {
        element: <AdminRoute />,
        children: [
          {
            path: 'admin',
            element: <DashboardLayout />,
            children: [
              { index: true, element: withSuspense(<AdminDashboardPage />) },
              { path: 'verifications', element: withSuspense(<AdminVerificationsPage />) },
              { path: 'reports', element: withSuspense(<AdminReportsPage />) },
              { path: 'audit-logs', element: withSuspense(<AdminAuditLogsPage />) },
            ],
          },
        ],
      },
      // Guest Only Views
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: 'login', element: withSuspense(<LoginPage />) },
              { path: 'register', element: withSuspense(<RegisterPage />) },
              { path: 'verify-email', element: withSuspense(<VerifyEmailPage />) },
            ],
          },
        ],
      },
      // 404 Catch-All
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
