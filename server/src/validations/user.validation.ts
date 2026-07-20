import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100).trim().optional(),
    college: z.string().max(200).trim().optional(),
    branch: z.string().max(150).trim().optional(),
    graduationYear: z.number().int().min(1990).max(2100).optional().or(z.literal('')),
    bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').trim().optional(),
    avatarUrl: z.string().url('Invalid profile picture link').trim().or(z.literal('')).optional(),
    linkedinUrl: z.string().url('Invalid LinkedIn address').trim().or(z.literal('')).optional(),
    githubUrl: z.string().url('Invalid GitHub address').trim().or(z.literal('')).optional(),
    portfolioUrl: z.string().url('Invalid portfolio link').trim().or(z.literal('')).optional(),
    currentCompany: z.string().max(150).trim().optional(),
    currentRole: z.string().max(150).trim().optional(),
    skills: z.array(z.string().min(1).trim()).max(30, 'Cannot exceed 30 skills').optional(),
    isPrivate: z.boolean().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
  }),
});

export const deactivateAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, 'Password confirmation is required'),
  }),
});
