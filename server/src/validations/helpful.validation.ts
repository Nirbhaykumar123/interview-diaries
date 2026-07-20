import { z } from 'zod';

export const helpfulParamSchema = z.object({
  params: z.object({
    interviewId: z.string().uuid('Invalid interview selection'),
  }),
});
