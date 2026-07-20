import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { interviewApi } from '../api/interview.api';

/**
 * Hook to retrieve a paginated and filtered list of published interviews.
 */
export function useInterviewsQuery(params: {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  type?: 'INTERNSHIP' | 'PLACEMENT';
  outcome?: 'SELECTED' | 'REJECTED' | 'PENDING';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['interviews', params],
    queryFn: () => interviewApi.getInterviews(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook to fetch a single detailed interview experience by UUID.
 */
export function useInterviewDetailsQuery(id: string) {
  return useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewApi.getInterviewById(id),
    enabled: !!id, // Only run the query if a valid UUID is provided
  });
}

/**
 * Hook to fetch all posts authored by the currently logged-in student.
 */
export function useMyInterviewsQuery(isAuthenticated: boolean) {
  return useQuery({
    queryKey: ['my-interviews'],
    queryFn: () => interviewApi.getMyInterviews(),
    enabled: isAuthenticated, // Only execute if user session is active
  });
}

/**
 * Mutation hook to register a new interview experience.
 */
export function useCreateInterviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: interviewApi.createInterview,
    onSuccess: (newPost) => {
      // Invalidate public feed lists and student list caches
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] }); // Invalidate company counts
      queryClient.invalidateQueries({ queryKey: ['company'] }); // Invalidate company details
      
      // Pre-seed detail cache
      queryClient.setQueryData(['interview', newPost.id], newPost);
    },
  });
}

/**
 * Mutation hook to edit an existing experience.
 */
export function useUpdateInterviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      interviewApi.updateInterview(id, data),
    onSuccess: (updatedPost, variables) => {
      // Invalidate list caches
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      
      // Update specific details cache block directly
      queryClient.setQueryData(['interview', variables.id], updatedPost);
    },
  });
}

/**
 * Mutation hook to delete an experience post.
 */
export function useDeleteInterviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: interviewApi.deleteInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['my-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] }); // Invalidate company counts
      queryClient.invalidateQueries({ queryKey: ['company'] });
    },
  });
}

/**
 * Hook to retrieve a list of related/recommended interview experiences.
 */
export function useRelatedInterviewsQuery(id: string) {
  return useQuery({
    queryKey: ['related-interviews', id],
    queryFn: () => interviewApi.getRelatedInterviews(id),
    enabled: !!id,
  });
}
