import { z } from 'zod';

export const createReportSchema = z.object({
  body: z.object({
    interviewId: z.string().uuid('Invalid interview selection').optional(),
    commentId: z.string().uuid('Invalid comment selection').optional(),
    reason: z.enum(['SPAM', 'ABUSIVE', 'FALSE_INFORMATION', 'DUPLICATE', 'OTHER']),
    details: z.string().max(500, 'Details description cannot exceed 500 characters').trim().optional(),
  }),
});

export const resolveReportSchema = z.object({
  params: z.object({
    reportId: z.string().uuid('Invalid report selection'),
  }),
  body: z.object({
    status: z.enum(['RESOLVED', 'DISMISSED']),
  }),
});

export const getReportsSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'RESOLVED', 'DISMISSED']).optional(),
    page: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).default(1)),
    limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).max(100).default(10)),
  }),
});
