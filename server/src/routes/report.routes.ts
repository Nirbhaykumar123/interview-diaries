import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate';
import { rateLimiter } from '../middleware/rateLimiter.middleware';
import {
  createReportSchema,
  resolveReportSchema,
  getReportsSchema,
} from '../validations/report.validation';

const router = Router();

// All reporting pathways require authentication
router.use(authenticate);

// Any registered user can file content reports (limited to 3 reports per minute)
router.post(
  '/',
  rateLimiter({
    windowMs: 60 * 1000,
    max: 3,
    message: 'Too many reports submitted. Please wait before submitting another flag.',
  }),
  validate(createReportSchema),
  reportController.createReport
);

// Admin-restricted routes for moderation queue review and resolution
router.get('/', authorize('ADMIN'), validate(getReportsSchema), reportController.getReports);
router.patch('/:reportId/resolve', authorize('ADMIN'), validate(resolveReportSchema), reportController.resolveReport);

export default router;
