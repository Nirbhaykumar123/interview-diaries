import { z } from 'zod';

export const addCommentSchema = z.object({
  params: z.object({
    interviewId: z.string().uuid('Invalid interview selection'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment content cannot be empty').max(1000, 'Comment cannot exceed 1000 characters').trim(),
    parentId: z.string().uuid('Invalid parent comment selection').optional(),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    commentId: z.string().uuid('Invalid comment selection'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment content cannot be empty').max(1000, 'Comment cannot exceed 1000 characters').trim(),
  }),
});

export const commentIdParamSchema = z.object({
  params: z.object({
    commentId: z.string().uuid('Invalid comment selection'),
  }),
});

export const getCommentsSchema = z.object({
  params: z.object({
    interviewId: z.string().uuid('Invalid interview selection'),
  }),
  query: z.object({
    page: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).default(1)),
    limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).max(100).default(10)),
  }),
});
