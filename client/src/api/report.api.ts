import { api } from '../lib/api';

export type ReportReason = 'SPAM' | 'ABUSIVE' | 'FALSE_INFORMATION' | 'DUPLICATE' | 'OTHER';

export interface CreateReportPayload {
  interviewId?: string;
  commentId?: string;
  reason: ReportReason;
  details?: string;
}

export const reportApi = {
  /**
   * File report for content moderation flags.
   */
  createReport: async (payload: CreateReportPayload): Promise<void> => {
    await api.post('/reports', payload);
  },
};
