import { api } from '../lib/api';

// ─── Shared Types ──────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  college: string | null;
  course: string | null;
  branch: string | null;
  graduationYear: number | null;
  role: string;
  createdAt: string;
  profile: {
    bio: string | null;
    avatarUrl: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
    currentCompany: string | null;
    currentRole: string | null;
    skills: string[];
    isPrivate: boolean;
  } | null;
}

export interface UserStats {
  totalInterviews: number;
  offersReceived: number;
  helpfulVotesReceived: number;
  bookmarksCount: number;
  profileCompletion: number;
}

export interface UpdateProfileInput {
  fullName?: string;
  college?: string;
  branch?: string;
  graduationYear?: number;
  bio?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  currentCompany?: string;
  currentRole?: string;
  skills?: string[];
  isPrivate?: boolean;
}

// ─── API Methods ───────────────────────────────────────────────────────────────

export const userApi = {
  /**
   * Fetch the full profile of the authenticated user.
   */
  getMe: async (): Promise<UserProfile> => {
    const response = await api.get<{ status: string; data: { user: UserProfile } }>('/users/me');
    return response.data.data.user;
  },

  /**
   * Update authenticated user's profile fields.
   */
  updateMe: async (data: UpdateProfileInput): Promise<UserProfile> => {
    const response = await api.patch<{ status: string; data: { user: UserProfile } }>('/users/me', data);
    return response.data.data.user;
  },

  /**
   * Fetch dashboard statistics for the authenticated user.
   */
  getStats: async (): Promise<UserStats> => {
    const response = await api.get<{ status: string; data: { stats: UserStats } }>('/users/me/stats');
    return response.data.data.stats;
  },

  /**
   * Fetch bookmarked interview diaries.
   */
  getBookmarks: async (): Promise<any[]> => {
    const response = await api.get<{ status: string; data: { bookmarks: any[] } }>('/users/me/bookmarks');
    return response.data.data.bookmarks;
  },

  /**
   * Fetch public user portfolio by username.
   */
  getPublicProfile: async (username: string): Promise<UserProfile> => {
    const response = await api.get<{ status: string; data: { user: UserProfile } }>(`/users/profile/${username}`);
    return response.data.data.user;
  },

  /**
   * Upload user avatar profile picture.
   */
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.patch<{ status: string; data: { avatarUrl: string } }>(
      '/users/me/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.avatarUrl;
  },

  /**
   * Remove user avatar profile picture.
   */
  deleteAvatar: async (): Promise<void> => {
    await api.delete('/users/me/avatar');
  },
};
