import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';

// Initialize the global TanStack Query Client with optimized default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevents aggressive refetches when the user alt-tabs between windows
      refetchOnWindowFocus: false,
      // Retry once on transient network failures, but never retry on auth/not-found errors
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        // Never retry on: Unauthorized, Forbidden, Not Found, Unprocessable Entity
        if (status === 401 || status === 403 || status === 404 || status === 422) return false;
        return failureCount < 1;
      },
      // 5-minute stale window: components re-mounting within this window use cache directly
      staleTime: 5 * 60 * 1000,
      // Keep unused query data in memory for 10 minutes before GC clears it
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      // Log mutation errors to console in development
      onError: (error: any) => {
        if (import.meta.env.DEV) {
          console.error('[Mutation Error]', error?.response?.data ?? error);
        }
      },
    },
  },
});

/**
 * RootLayout is the global shell of the application.
 * It serves as the mounting wrapper for global contexts, theme configurations,
 * and toast notification frameworks. All pages render inside its Outlet.
 */
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
            <Outlet />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
