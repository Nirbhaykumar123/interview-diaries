import { z } from 'zod';

const roundSchema = z.object({
  roundNumber: z.number().int().min(1, 'Round number must be at least 1'),
  roundType: z.enum(['ONLINE_TEST', 'TECHNICAL', 'HR', 'MANAGERIAL', 'GROUP_DISCUSSION', 'OTHER']),
  description: z.string().min(10, 'Description must be at least 10 characters').trim(),
  questionsAsked: z.array(z.string().min(2, 'Question must be at least 2 characters').trim()).default([]),
  durationMinutes: z.number().int().min(1).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
});

export const createInterviewSchema = z.object({
  body: z.object({
    companyId: z.string().uuid('Invalid company selection'),
    role: z.string().min(2, 'Job role must be at least 2 characters').max(100).trim(),
    type: z.enum(['INTERNSHIP', 'PLACEMENT']),
    degree: z.enum(['BTECH', 'MTECH']),
    branch: z.string().min(1, 'Branch name is required').max(100).trim(),
    cgpa: z.number().min(0, 'CGPA must be a positive number').max(10, 'CGPA cannot exceed 10.0'),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Invalid academic year format (e.g. 2025-2026)').trim(),
    placementBatch: z.number().int().min(2000, 'Invalid placement batch').max(2100, 'Invalid placement batch'),
    campusDriveDate: z.preprocess((val) => (val ? new Date(val as string) : undefined), z.date().optional()),
    ctc: z.number().min(0, 'CTC must be a positive number').optional(),
    stipend: z.number().int().min(0, 'Stipend must be a positive number').optional(),
    outcome: z.enum(['SELECTED', 'REJECTED', 'PENDING']),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    oaPlatform: z.string().max(100).trim().optional(),
    eligibility: z.string().max(2000).trim().optional(),
    overallExperience: z.string().min(10, 'Overall experience description must be at least 10 characters').trim(),
    tips: z.string().max(2000).trim().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
    rounds: z.array(roundSchema).min(1, 'At least one interview round must be provided'),
  }),
});

export const updateInterviewSchema = z.object({
  body: createInterviewSchema.shape.body.partial(),
});

export const getInterviewsSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).optional()),
    limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).max(100).optional()),
    search: z.string().trim().optional(),
    companyId: z.string().uuid('Invalid company query').optional(),
    type: z.enum(['INTERNSHIP', 'PLACEMENT']).optional(),
    degree: z.enum(['BTECH', 'MTECH']).optional(),
    branch: z.string().trim().optional(),
    outcome: z.enum(['SELECTED', 'REJECTED', 'PENDING']).optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    sortBy: z.enum(['createdAt', 'helpfulCount', 'viewCount']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
