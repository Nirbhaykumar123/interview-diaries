import { z } from 'zod';

export const requestVerificationSchema = z.object({
  body: z.object({
    interviewId: z.string().uuid('Invalid interview experience selected'),
    evidenceUrl: z.string().url('Invalid evidence link format').optional(),
    evidenceType: z.string().min(1, 'Evidence category cannot be empty').optional(),
  }),
});

export const resolveVerificationSchema = z.object({
  params: z.object({
    verificationId: z.string().uuid('Invalid verification request selection'),
  }),
  body: z.object({
    status: z.enum(['VERIFIED', 'REJECTED'] as const),
    rejectionReason: z.string().min(5, 'Rejection explanation must be at least 5 characters').optional(),
  }),
});

export const resolveReportSchema = z.object({
  params: z.object({
    reportId: z.string().uuid('Invalid content report selection'),
  }),
  body: z.object({
    status: z.enum(['RESOLVED', 'DISMISSED'] as const),
    actionTaken: z.enum(['HIDE_CONTENT', 'WARN_USER', 'NONE'] as const).default('NONE'),
    reason: z.string().min(5, 'Resolution justification must be at least 5 characters'),
  }),
});

export const hideInterviewSchema = z.object({
  params: z.object({
    interviewId: z.string().uuid('Invalid interview experience selection'),
  }),
  body: z.object({
    reason: z.string().min(5, 'Action reason must be at least 5 characters'),
  }),
});

export const suspendUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user account selection'),
  }),
  body: z.object({
    reason: z.string().min(5, 'Suspension justification must be at least 5 characters'),
  }),
});

export const getVerificationsSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).default(1)),
    limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).max(100).default(10)),
    status: z.enum(['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'] as const).optional(),
  }),
});

export const getReportsSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).default(1)),
    limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).max(100).default(10)),
    status: z.enum(['PENDING', 'RESOLVED', 'DISMISSED'] as const).optional(),
  }),
});

export const getAuditLogsSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).default(1)),
    limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).max(100).default(15)),
    actorId: z.string().uuid('Invalid filter actor').optional(),
    action: z.string().optional(),
    targetType: z.string().optional(),
  }),
});
