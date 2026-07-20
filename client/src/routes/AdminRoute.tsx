import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/common/Loader';

/**
 * AdminRoute shields moderation dashboard routes from candidates.
 * Checks user roles and redirects to /403 if unauthorized.
 */
export default function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show a full-screen loading spinner while the auth session restores
  if (isLoading) {
    return <Loader fullScreen message="Validating credentials..." />;
  }

  // Redirect to login if user is unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isModOrAdmin = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');

  // Redirect to Forbidden page if role is insufficient
  if (!isModOrAdmin) {
    return <Navigate to="/403" replace />;
  }

  // Render the matched admin component
  return <Outlet />;
}
