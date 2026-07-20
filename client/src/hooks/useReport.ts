import { useMutation } from '@tanstack/react-query';
import { reportApi, CreateReportPayload } from '../api/report.api';

/**
 * Mutation hook to file content reports.
 */
export function useCreateReportMutation() {
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => reportApi.createReport(payload),
  });
}
