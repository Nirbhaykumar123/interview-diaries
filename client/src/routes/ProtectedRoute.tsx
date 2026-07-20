import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/common/Loader';

/**
 * ProtectedRoute shields private routes from unauthenticated users.
 * Checks the session loader state and redirects to /login if unauthorized.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show a full-screen loading spinner while the auth session restores
  if (isLoading) {
    return <Loader fullScreen message="Verifying session..." />;
  }

  // Redirect to login if user is unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render the matched route component
  return <Outlet />;
}
