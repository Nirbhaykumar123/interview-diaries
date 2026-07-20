import { z } from 'zod';

export const getCompaniesSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).optional()),
    limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).max(100).optional()),
    search: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    isHiring: z.preprocess(
      (val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return undefined;
      },
      z.boolean().optional()
    ),
    sortBy: z.enum(['name', 'interviewCount', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const createCompanySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Company name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(200, 'Name cannot exceed 200 characters')
      .trim(),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').trim().optional(),
    logoUrl: z.string().url('Logo URL must be a valid URL').trim().optional().or(z.literal('')),
    website: z.string().url('Website must be a valid URL').trim().optional().or(z.literal('')),
    industry: z.string().max(100).trim().optional(),
    location: z.string().max(200).trim().optional(),
    isHiring: z.boolean().optional(),
  }),
});
