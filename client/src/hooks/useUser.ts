import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, UpdateProfileInput } from '../api/user.api';

/**
 * Hook to fetch the full profile of the currently authenticated user.
 */
export function useMeQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: userApi.getMe,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Hook to fetch personal performance statistics.
 */
export function useStatsQuery() {
  return useQuery({
    queryKey: ['me-stats'],
    queryFn: userApi.getStats,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch saved bookmarks for the authenticated user.
 */
export function useBookmarksQuery() {
  return useQuery({
    queryKey: ['me-bookmarks'],
    queryFn: userApi.getBookmarks,
  });
}

/**
 * Mutation hook to update the user's profile fields.
 * Invalidates 'me', 'me-stats' caches on success.
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => userApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['me-stats'] });
    },
  });
}

/**
 * Hook to fetch a public student portfolio by username.
 */
export function usePublicProfileQuery(username: string) {
  return useQuery({
    queryKey: ['public-profile', username],
    queryFn: () => userApi.getPublicProfile(username),
    enabled: !!username,
  });
}

/**
 * Mutation hook to upload/update user avatar.
 */
export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

/**
 * Mutation hook to delete/reset user avatar.
 */
export function useDeleteAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
