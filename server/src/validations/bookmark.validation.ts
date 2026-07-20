import { z } from 'zod';

export const bookmarkParamSchema = z.object({
  params: z.object({
    interviewId: z.string().uuid('Invalid interview ID selection'),
  }),
});
