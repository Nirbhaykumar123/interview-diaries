import { api } from '../lib/api';

export interface HelpfulStatusResponse {
  status: string;
  data: {
    hasVoted: boolean;
  };
}

export const helpfulApi = {
  /**
   * Check if user voted the target interview as helpful.
   */
  getHelpfulStatus: async (interviewId: string): Promise<boolean> => {
    const response = await api.get<HelpfulStatusResponse>(`/helpful/${interviewId}/check`);
    return response.data.data.hasVoted;
  },

  /**
   * Vote an interview as helpful.
   */
  addHelpfulVote: async (interviewId: string): Promise<void> => {
    await api.post(`/helpful/${interviewId}`);
  },

  /**
   * Revoke helpful vote.
   */
  removeHelpfulVote: async (interviewId: string): Promise<void> => {
    await api.delete(`/helpful/${interviewId}`);
  },
};
