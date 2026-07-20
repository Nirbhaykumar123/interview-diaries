import { api } from '../lib/api';

export interface CommentAuthor {
  id: string;
  username: string;
  fullName: string;
  profile?: {
    avatarUrl?: string;
  };
}

export interface CommentData {
  id: string;
  interviewId: string;
  authorId: string;
  author: CommentAuthor;
  content: string;
  isDeleted: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  replies: CommentData[];
}

export interface PaginatedCommentsResponse {
  status: string;
  data: {
    comments: CommentData[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface SingleCommentResponse {
  status: string;
  data: {
    comment: CommentData;
  };
}

export const commentApi = {
  /**
   * Fetch paginated list of top-level comments for an interview.
   */
  getComments: async (interviewId: string, page = 1, limit = 10): Promise<PaginatedCommentsResponse['data']> => {
    const response = await api.get<PaginatedCommentsResponse>(`/comments/interview/${interviewId}`, {
      params: { page, limit },
    });
    return response.data.data;
  },

  /**
   * Post a new comment or a reply.
   */
  addComment: async (interviewId: string, content: string, parentId?: string): Promise<CommentData> => {
    const response = await api.post<SingleCommentResponse>(`/comments/interview/${interviewId}`, {
      content,
      parentId,
    });
    return response.data.data.comment;
  },

  /**
   * Edit content of a comment.
   */
  updateComment: async (commentId: string, content: string): Promise<CommentData> => {
    const response = await api.patch<SingleCommentResponse>(`/comments/${commentId}`, {
      content,
    });
    return response.data.data.comment;
  },

  /**
   * Delete a comment.
   */
  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};
