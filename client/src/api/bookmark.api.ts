import { api } from '../lib/api';

export const bookmarkApi = {
  /**
   * Check whether the authenticated user has bookmarked a given interview.
   */
  checkBookmark: async (interviewId: string): Promise<boolean> => {
    const response = await api.get<{ status: string; data: { isBookmarked: boolean } }>(
      `/bookmarks/${interviewId}/check`
    );
    return response.data.data.isBookmarked;
  },

  /**
   * Add a bookmark for an interview.
   */
  addBookmark: async (interviewId: string): Promise<void> => {
    await api.post(`/bookmarks/${interviewId}`);
  },

  /**
   * Remove a bookmark for an interview.
   */
  removeBookmark: async (interviewId: string): Promise<void> => {
    await api.delete(`/bookmarks/${interviewId}`);
  },
};
