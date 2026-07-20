import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

/**
 * Hook to retrieve admin statistics.
 */
export function useAdminStatsQuery(enabled = true) {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    enabled,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch paginated verification tickets.
 */
export function useAdminVerificationsQuery(
  params: {
    page: number;
    limit: number;
    status?: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  },
  enabled = true
) {
  return useQuery({
    queryKey: ['admin-verifications', params],
    queryFn: () => adminApi.getVerifications(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/**
 * Hook to resolve a verification request (Approve/Reject).
 */
export function useResolveVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      verificationId,
      payload,
    }: {
      verificationId: string;
      payload: { status: 'VERIFIED' | 'REJECTED'; rejectionReason?: string };
    }) => adminApi.resolveVerification(verificationId, payload),
    onSuccess: () => {
      // Invalidate queues, statistics, and detail cache of affected interview
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['interview'] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
}

/**
 * Hook to fetch paginated content violation reports.
 */
export function useAdminReportsQuery(
  params: {
    page: number;
    limit: number;
    status?: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  },
  enabled = true
) {
  return useQuery({
    queryKey: ['admin-reports', params],
    queryFn: () => adminApi.getReports(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/**
 * Hook to resolve a content report (Dismiss/Take Action).
 */
export function useResolveReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      payload,
    }: {
      reportId: string;
      payload: {
        status: 'RESOLVED' | 'DISMISSED';
        actionTaken?: 'HIDE_CONTENT' | 'WARN_USER' | 'NONE';
        reason: string;
      };
    }) => adminApi.resolveReport(reportId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

/**
 * Hook to fetch paginated system audit logs.
 */
export function useAdminAuditLogsQuery(
  params: {
    page: number;
    limit: number;
    actorId?: string;
    action?: string;
    targetType?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: ['admin-audit-logs', params],
    queryFn: () => adminApi.getAuditLogs(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/**
 * Hook to submit verification request (Candidate).
 */
export function useRequestVerificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      interviewId: string;
      evidenceUrl?: string;
      evidenceType?: string;
    }) => adminApi.requestVerification(params),
    onSuccess: (_, variables) => {
      // Invalidate queries so status UI refreshes instantly
      queryClient.invalidateQueries({ queryKey: ['interview', variables.interviewId] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
}
