import { api } from '../lib/api';

export interface VerificationRequestData {
  id: string;
  interviewId: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  evidenceUrl: string | null;
  evidenceType: string | null;
  reviewerId: string | null;
  rejectionReason: string | null;
  createdAt: string;
  interview: {
    id: string;
    role: string;
    type: 'INTERNSHIP' | 'PLACEMENT';
    year: number;
    overallExperience: string;
    author: {
      id: string;
      fullName: string;
      username: string;
    };
    company: {
      name: string;
    };
  };
}

export interface GetVerificationsResponse {
  status: string;
  data: {
    verifications: VerificationRequestData[];
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

export interface AdminReportData {
  id: string;
  reporterId: string;
  reporter: {
    username: string;
    fullName: string;
  };
  reason: 'SPAM' | 'ABUSIVE' | 'FALSE_INFORMATION' | 'DUPLICATE' | 'OTHER';
  details: string | null;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  interview?: {
    id: string;
    role: string;
    company: {
      name: string;
    };
  };
  comment?: {
    id: string;
    content: string;
  };
}

export interface GetReportsResponse {
  status: string;
  data: {
    reports: AdminReportData[];
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

export interface AuditLogData {
  id: string;
  actorId: string;
  actor: {
    id: string;
    fullName: string;
    email: string;
  };
  action: string;
  targetId: string;
  targetType: string;
  reason: string | null;
  previousState: string | null;
  newState: string | null;
  createdAt: string;
}

export interface GetAuditLogsResponse {
  status: string;
  data: {
    logs: AuditLogData[];
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

export interface AdminStats {
  pendingVerifications: number;
  pendingReports: number;
  resolvedCount: number;
}

export interface GetAdminStatsResponse {
  status: string;
  data: {
    stats: AdminStats;
  };
}

export const adminApi = {
  /**
   * Submit a verification request (Candidate)
   */
  requestVerification: async (params: {
    interviewId: string;
    evidenceUrl?: string;
    evidenceType?: string;
  }): Promise<any> => {
    const response = await api.post('/admin/verifications/request', params);
    return response.data;
  },

  /**
   * Fetch paginated verification tickets (Moderator/Admin)
   */
  getVerifications: async (params: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  }): Promise<GetVerificationsResponse['data']> => {
    const response = await api.get<GetVerificationsResponse>('/admin/verifications', { params });
    return response.data.data;
  },

  /**
   * Resolve a verification request (Moderator/Admin)
   */
  resolveVerification: async (
    verificationId: string,
    payload: {
      status: 'VERIFIED' | 'REJECTED';
      rejectionReason?: string;
    }
  ): Promise<any> => {
    const response = await api.patch(`/admin/verifications/${verificationId}`, payload);
    return response.data;
  },

  /**
   * Fetch paginated flagged reports (Moderator/Admin)
   */
  getReports: async (params: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  }): Promise<GetReportsResponse['data']> => {
    const response = await api.get<GetReportsResponse>('/admin/reports', { params });
    return response.data.data;
  },

  /**
   * Resolve a content violation report (Moderator/Admin)
   */
  resolveReport: async (
    reportId: string,
    payload: {
      status: 'RESOLVED' | 'DISMISSED';
      actionTaken?: 'HIDE_CONTENT' | 'WARN_USER' | 'NONE';
      reason: string;
    }
  ): Promise<any> => {
    const response = await api.patch(`/admin/reports/${reportId}`, payload);
    return response.data;
  },

  /**
   * Fetch paginated audit trail logs (Admin only)
   */
  getAuditLogs: async (params: {
    page?: number;
    limit?: number;
    actorId?: string;
    action?: string;
    targetType?: string;
  }): Promise<GetAuditLogsResponse['data']> => {
    const response = await api.get<GetAuditLogsResponse>('/admin/audit-logs', { params });
    return response.data.data;
  },

  /**
   * Fetch admin overview statistics
   */
  getStats: async (): Promise<GetAdminStatsResponse['data']> => {
    const response = await api.get<GetAdminStatsResponse>('/admin/stats');
    return response.data.data;
  },
};
