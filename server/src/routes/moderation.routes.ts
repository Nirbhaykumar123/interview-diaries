import { Router } from 'express';
import { moderationController } from '../controllers/moderation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate';
import {
  requestVerificationSchema,
  resolveVerificationSchema,
  resolveReportSchema,
  hideInterviewSchema,
  suspendUserSchema,
  getVerificationsSchema,
  getReportsSchema,
  getAuditLogsSchema,
} from '../validations/moderation.validation';

const router = Router();

// 1. Candidate pathways (Require simple authentication)
router.post(
  '/verifications/request',
  authenticate,
  validate(requestVerificationSchema),
  moderationController.requestVerification
);

// 2. Moderator & Admin pathways (Require MODERATOR or ADMIN role)
router.get(
  '/verifications',
  authenticate,
  authorize('MODERATOR', 'ADMIN'),
  validate(getVerificationsSchema),
  moderationController.getVerifications
);

router.patch(
  '/verifications/:verificationId',
  authenticate,
  authorize('MODERATOR', 'ADMIN'),
  validate(resolveVerificationSchema),
  moderationController.resolveVerification
);

router.get(
  '/reports',
  authenticate,
  authorize('MODERATOR', 'ADMIN'),
  validate(getReportsSchema),
  moderationController.getReports
);

router.patch(
  '/reports/:reportId',
  authenticate,
  authorize('MODERATOR', 'ADMIN'),
  validate(resolveReportSchema),
  moderationController.resolveReport
);

router.patch(
  '/interviews/:interviewId/hide',
  authenticate,
  authorize('MODERATOR', 'ADMIN'),
  validate(hideInterviewSchema),
  moderationController.hideInterview
);

router.patch(
  '/interviews/:interviewId/restore',
  authenticate,
  authorize('MODERATOR', 'ADMIN'),
  validate(hideInterviewSchema),
  moderationController.restoreInterview
);

router.get(
  '/stats',
  authenticate,
  authorize('MODERATOR', 'ADMIN'),
  moderationController.getStats
);

// 3. Admin-only pathways (Require ADMIN role)
router.patch(
  '/users/:userId/suspend',
  authenticate,
  authorize('ADMIN'),
  validate(suspendUserSchema),
  moderationController.suspendUser
);

router.patch(
  '/users/:userId/restore',
  authenticate,
  authorize('ADMIN'),
  validate(suspendUserSchema),
  moderationController.restoreUser
);

router.get(
  '/audit-logs',
  authenticate,
  authorize('ADMIN'),
  validate(getAuditLogsSchema),
  moderationController.getAuditLogs
);

export default router;
