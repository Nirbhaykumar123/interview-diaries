import { api } from '../lib/api';
import { InterviewCardData } from '../components/interview/InterviewCard';
import { RoundData } from '../components/interview/RoundCard';

export interface GetInterviewsResponse {
  status: string;
  data: {
    interviews: (InterviewCardData & { company: { name: string; logoUrl: string | null } })[];
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

export interface GetInterviewDetailsResponse {
  status: string;
  data: {
    interview: InterviewCardData & {
      rounds: RoundData[];
      verification?: {
        id: string;
        interviewId: string;
        status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
        evidenceUrl: string | null;
        evidenceType: string | null;
        rejectionReason: string | null;
      } | null;
      company: { name: string; slug: string; logoUrl: string | null };
    };
  };
}

export const interviewApi = {
  /**
   * Fetch paginated list of published interview experiences
   */
  getInterviews: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    companyId?: string;
    type?: 'INTERNSHIP' | 'PLACEMENT';
    outcome?: 'SELECTED' | 'REJECTED' | 'PENDING';
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetInterviewsResponse['data']> => {
    const response = await api.get<GetInterviewsResponse>('/interviews', { params });
    return response.data.data;
  },

  /**
   * Fetch a single detailed interview experience by UUID
   */
  getInterviewById: async (id: string): Promise<GetInterviewDetailsResponse['data']['interview']> => {
    const response = await api.get<GetInterviewDetailsResponse>(`/interviews/${id}`);
    return response.data.data.interview;
  },

  /**
   * Fetch all interview experiences written by the authenticated user
   */
  getMyInterviews: async (): Promise<InterviewCardData[]> => {
    const response = await api.get<{ status: string; data: { interviews: InterviewCardData[] } }>('/interviews/user/me');
    return response.data.data.interviews;
  },

  /**
   * Register a new interview experience (Authenticated only)
   */
  createInterview: async (data: any): Promise<InterviewCardData> => {
    const response = await api.post<{ status: string; data: { interview: InterviewCardData } }>('/interviews', data);
    return response.data.data.interview;
  },

  /**
   * Update an existing interview experience (Authenticated only, checks owner)
   */
  updateInterview: async (id: string, data: any): Promise<InterviewCardData> => {
    const response = await api.patch<{ status: string; data: { interview: InterviewCardData } }>(`/interviews/${id}`, data);
    return response.data.data.interview;
  },

  /**
   * Soft delete an interview experience (Authenticated only, checks owner)
   */
  deleteInterview: async (id: string): Promise<void> => {
    await api.delete(`/interviews/${id}`);
  },

  /**
   * Fetch top recommended/related interviews
   */
  getRelatedInterviews: async (id: string): Promise<InterviewCardData[]> => {
    const response = await api.get<{ status: string; data: { interviews: InterviewCardData[] } }>(`/interviews/${id}/related`);
    return response.data.data.interviews;
  },
};
