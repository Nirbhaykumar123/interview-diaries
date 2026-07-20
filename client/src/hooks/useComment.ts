import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '../api/comment.api';

/**
 * Fetch paginated top-level comments with replies attached.
 */
export function useCommentsQuery(interviewId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['comments', interviewId, { page, limit }],
    queryFn: () => commentApi.getComments(interviewId, page, limit),
    enabled: !!interviewId,
  });
}

/**
 * Mutation hook to add a comment or nested reply.
 */
export function useAddCommentMutation(interviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { content: string; parentId?: string }) =>
      commentApi.addComment(interviewId, vars.content, vars.parentId),

    onSuccess: () => {
      // Invalidate all comment list paginations for this interview
      queryClient.invalidateQueries({ queryKey: ['comments', interviewId] });
      // Invalidate target interview cache to sync counts
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
}

/**
 * Mutation hook to edit a comment.
 */
export function useUpdateCommentMutation(interviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { commentId: string; content: string }) =>
      commentApi.updateComment(vars.commentId, vars.content),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', interviewId] });
    },
  });
}

/**
 * Mutation hook to soft-delete a comment.
 */
export function useDeleteCommentMutation(interviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentApi.deleteComment(commentId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', interviewId] });
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
}
