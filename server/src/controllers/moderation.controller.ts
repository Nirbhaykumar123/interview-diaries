import { Request, Response, NextFunction } from 'express';
import { verificationService } from '../services/verification.service';
import { moderationService } from '../services/moderation.service';
import { reportService } from '../services/report.service';
import { VerificationStatus } from '@prisma/client';

export class ModerationController {
  /**
   * POST /api/admin/verifications/request
   * Submit experience verification request (Candidate).
   */
  requestVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const { interviewId, evidenceUrl, evidenceType } = req.body;

      const verification = await verificationService.requestVerification(userId, {
        interviewId,
        evidenceUrl,
        evidenceType,
      });

      res.status(201).json({
        status: 'success',
        data: { verification },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/verifications
   * List paginated verification tickets (Moderator/Admin).
   */
  getVerifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, status } = req.query as any;

      const result = await verificationService.getVerifications({
        status: status as VerificationStatus,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/admin/verifications/:verificationId
   * Resolve a verification request (Moderator/Admin).
   */
  resolveVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reviewerId = (req as any).user.sub;
      const { verificationId } = req.params as { verificationId: string };
      const { status, rejectionReason } = req.body;

      const verification = await verificationService.resolveVerification(reviewerId, verificationId, {
        status,
        rejectionReason,
      });

      res.status(200).json({
        status: 'success',
        data: { verification },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/admin/interviews/:interviewId/hide
   * Set public hidden flag on interview experience (Moderator/Admin).
   */
  hideInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const moderatorId = (req as any).user.sub;
      const { interviewId } = req.params as { interviewId: string };
      const { reason } = req.body;

      const interview = await moderationService.hideInterview(moderatorId, interviewId, reason);

      res.status(200).json({
        status: 'success',
        data: { interview },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/admin/interviews/:interviewId/restore
   * Restore hidden interview experience back to public status (Moderator/Admin).
   */
  restoreInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const moderatorId = (req as any).user.sub;
      const { interviewId } = req.params as { interviewId: string };
      const { reason } = req.body;

      const interview = await moderationService.restoreInterview(moderatorId, interviewId, reason);

      res.status(200).json({
        status: 'success',
        data: { interview },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/reports
   * List paginated flagged reports (Moderator/Admin).
   */
  getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, page, limit } = req.query as any;

      const result = await reportService.getReports({
        status,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/admin/reports/:reportId
   * Resolve or dismiss flagged reports (Moderator/Admin).
   */
  resolveReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const moderatorId = (req as any).user.sub;
      const { reportId } = req.params as { reportId: string };
      const { status, actionTaken, reason } = req.body;

      const result = await moderationService.resolveReport(moderatorId, reportId, {
        status,
        actionTaken,
        reason,
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/admin/users/:userId/suspend
   * Ban/Suspend user account (Admin only).
   */
  suspendUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user.sub;
      const { userId } = req.params as { userId: string };
      const { reason } = req.body;

      const result = await moderationService.suspendUser(adminId, userId, reason);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/admin/users/:userId/restore
   * Restore a suspended user account (Admin only).
   */
  restoreUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user.sub;
      const { userId } = req.params as { userId: string };
      const { reason } = req.body;

      const result = await moderationService.restoreUser(adminId, userId, reason);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/audit-logs
   * View immutable chronological system audit logs (Admin only).
   */
  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, actorId, action, targetType } = req.query as any;

      const result = await moderationService.getAuditLogs({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        actorId,
        action,
        targetType,
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/stats
   * Fetch dashboard statistics for the overview panel.
   */
  getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await moderationService.getDashboardStats();
      res.status(200).json({
        status: 'success',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const moderationController = new ModerationController();
