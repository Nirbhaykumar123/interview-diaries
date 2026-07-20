import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helpfulApi } from '../api/helpful.api';

/**
 * Checks whether the authenticated user has marked an interview as helpful.
 */
export function useHelpfulStatusQuery(interviewId: string, enabled = true) {
  return useQuery({
    queryKey: ['helpful-status', interviewId],
    queryFn: () => helpfulApi.getHelpfulStatus(interviewId),
    enabled: enabled && !!interviewId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Optimistic helpful toggle mutation.
 * Flips the status query immediately and updates the cache.
 */
export function useToggleHelpfulMutation(interviewId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['helpful-status', interviewId];
  const interviewQueryKey = ['interview', interviewId];

  return useMutation({
    mutationFn: async (currentlyVoted: boolean) => {
      if (currentlyVoted) {
        await helpfulApi.removeHelpfulVote(interviewId);
      } else {
        await helpfulApi.addHelpfulVote(interviewId);
      }
    },

    onMutate: async (currentlyVoted: boolean) => {
      await queryClient.cancelQueries({ queryKey });

      const previousStatus = queryClient.getQueryData<boolean>(queryKey);

      // Set optimistic vote status
      queryClient.setQueryData<boolean>(queryKey, !currentlyVoted);

      // Optimistically increment/decrement helpfulCount on interview details cache
      const previousInterview = queryClient.getQueryData<any>(interviewQueryKey);
      if (previousInterview) {
        queryClient.setQueryData<any>(interviewQueryKey, {
          ...previousInterview,
          helpfulCount: Math.max(0, previousInterview.helpfulCount + (currentlyVoted ? -1 : 1)),
        });
      }

      return { previousStatus, previousInterview };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData<boolean>(queryKey, context.previousStatus);
      }
      if (context?.previousInterview !== undefined) {
        queryClient.setQueryData<any>(interviewQueryKey, context.previousInterview);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: interviewQueryKey });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['me-stats'] });
    },
  });
}
