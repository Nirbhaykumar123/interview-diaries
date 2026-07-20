import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarkApi } from '../api/bookmark.api';

/**
 * Query hook to check if the authenticated user has bookmarked an interview.
 * Only runs when the user is logged in (enabled must be passed from parent).
 */
export function useBookmarkStatusQuery(interviewId: string, enabled = true) {
  return useQuery({
    queryKey: ['bookmark-status', interviewId],
    queryFn: () => bookmarkApi.checkBookmark(interviewId),
    enabled: enabled && !!interviewId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Optimistic bookmark toggle mutation.
 *
 * OPTIMISTIC UPDATE PATTERN:
 * 1. On mutate:  immediately flip the cached 'bookmark-status' to the new value.
 * 2. On error:   roll back to the previous cached value (snapshot).
 * 3. On settle:  invalidate to sync with the real server state.
 *
 * This makes the UI feel instant — the button responds before the API responds.
 */
export function useToggleBookmarkMutation(interviewId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['bookmark-status', interviewId];

  return useMutation({
    mutationFn: async (currentlyBookmarked: boolean) => {
      if (currentlyBookmarked) {
        await bookmarkApi.removeBookmark(interviewId);
      } else {
        await bookmarkApi.addBookmark(interviewId);
      }
    },

    // Step 1: Optimistically update the cache before the API responds
    onMutate: async (currentlyBookmarked: boolean) => {
      // Cancel any in-flight refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value for rollback on error
      const previous = queryClient.getQueryData<boolean>(queryKey);

      // Flip the cached value immediately
      queryClient.setQueryData<boolean>(queryKey, !currentlyBookmarked);

      // Return snapshot so onError can restore it
      return { previous };
    },

    // Step 2: If the API fails, roll back the optimistic update
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<boolean>(queryKey, context.previous);
      }
    },

    // Step 3: Invalidate to confirm real state from server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      // Also refresh the bookmarks list and stats counter
      queryClient.invalidateQueries({ queryKey: ['me-bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['me-stats'] });
    },
  });
}
