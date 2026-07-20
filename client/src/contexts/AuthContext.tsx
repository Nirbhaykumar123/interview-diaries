import { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  college?: string | null;
  graduationYear?: number | null;
  avatarUrl?: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, userData: User) => void;
  logout: () => Promise<void>;
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider coordinates user session memory cache (JWT access tokens
 * and user metadata state). Mounts to the application root.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Restore session from memory or refresh token cookie on boot
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          const userData = response.data.data.user;

          // Decode token and check if the role matches the user's role from DB
          const decoded = parseJwt(token);
          if (decoded && decoded.role !== userData.role) {
            try {
              const res = await api.post('/auth/refresh');
              const { accessToken, user: updatedUser } = res.data.data;
              localStorage.setItem('accessToken', accessToken);
              setUser(updatedUser);
            } catch (refreshErr) {
              localStorage.removeItem('accessToken');
              setUser(null);
            }
          } else {
            setUser(userData);
          }
        } catch (err) {
          // Access token expired, try to refresh via HTTP-only cookie
          try {
            const res = await api.post('/auth/refresh');
            const { accessToken, user: userData } = res.data.data;
            localStorage.setItem('accessToken', accessToken);
            setUser(userData);
          } catch (refreshErr) {
            // Refresh token expired or invalid, clear session
            localStorage.removeItem('accessToken');
            setUser(null);
          }
        }
      } else {
        // Try refreshing on boot in case user refreshed page and access token is lost
        try {
          const res = await api.post('/auth/refresh');
          const { accessToken, user: userData } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          setUser(userData);
        } catch (err) {
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (accessToken: string, userData: User) => {
    localStorage.setItem('accessToken', accessToken);
    queryClient.clear();
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Failed to logout on backend', err);
    } finally {
      localStorage.removeItem('accessToken');
      queryClient.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to safely consume the AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
