import { z } from 'zod';

export const getNotificationsSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).default(1)),
    limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).max(100).default(10)),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    notificationId: z.string().uuid('Invalid notification selection'),
  }),
});
