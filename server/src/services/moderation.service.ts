import { auditLogRepository } from '../repositories/auditLog.repository';
import { prisma } from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { notificationService } from './notification.service';
import { ReportStatus } from '@prisma/client';

export class ModerationService {
  /**
   * Hide an interview experience from public search feeds.
   */
  async hideInterview(moderatorId: string, interviewId: string, reason: string) {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A detailed reason (minimum 5 characters) must be provided.');
    }

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new NotFoundError('Interview experience not found');
    }

    if (interview.isHidden) {
      throw new BadRequestError('Interview is already hidden');
    }

    const previousSnapshot = JSON.stringify({ id: interview.id, isHidden: interview.isHidden });

    // Update state
    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: { isHidden: true },
    });

    const newSnapshot = JSON.stringify({ id: interview.id, isHidden: true });

    // Write audit log
    await auditLogRepository.create({
      actorId: moderatorId,
      action: 'HIDE_INTERVIEW',
      targetId: interviewId,
      targetType: 'INTERVIEW',
      reason,
      previousState: previousSnapshot,
      newState: newSnapshot,
    });

    // Notify author
    try {
      await notificationService.createNotification({
        recipientId: interview.authorId,
        type: 'REPORT_RESOLUTION',
        interviewId,
      });
    } catch (notifErr) {
      console.error('⚠️ Failed to dispatch hide notification:', notifErr);
    }

    return updated;
  }

  /**
   * Restore visibility of a hidden interview experience.
   */
  async restoreInterview(moderatorId: string, interviewId: string, reason: string) {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A detailed reason (minimum 5 characters) must be provided.');
    }

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new NotFoundError('Interview experience not found');
    }

    if (!interview.isHidden) {
      throw new BadRequestError('Interview is not hidden');
    }

    const previousSnapshot = JSON.stringify({ id: interview.id, isHidden: interview.isHidden });

    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: { isHidden: false },
    });

    const newSnapshot = JSON.stringify({ id: interview.id, isHidden: false });

    await auditLogRepository.create({
      actorId: moderatorId,
      action: 'RESTORE_INTERVIEW',
      targetId: interviewId,
      targetType: 'INTERVIEW',
      reason,
      previousState: previousSnapshot,
      newState: newSnapshot,
    });

    return updated;
  }

  /**
   * Resolve or dismiss a content violation report.
   */
  async resolveReport(
    moderatorId: string,
    reportId: string,
    params: {
      status: 'RESOLVED' | 'DISMISSED';
      actionTaken?: 'HIDE_CONTENT' | 'WARN_USER' | 'NONE';
      reason: string;
    }
  ) {
    const { status, actionTaken = 'NONE', reason } = params;

    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A detailed resolution explanation is required.');
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        interview: true,
        comment: true,
      },
    });

    if (!report) {
      throw new NotFoundError('Content report not found');
    }

    if (report.status !== 'PENDING') {
      throw new BadRequestError('Report is already resolved or dismissed');
    }

    const previousSnapshot = JSON.stringify({ id: report.id, status: report.status });

    // Execute state changes in transaction
    await prisma.$transaction(async (tx) => {
      // Update report status
      await tx.report.update({
        where: { id: reportId },
        data: {
          status: status as ReportStatus,
        },
      });

      // If action is HIDE_CONTENT, hide the target item
      if (status === 'RESOLVED' && actionTaken === 'HIDE_CONTENT') {
        if (report.interviewId) {
          await tx.interview.update({
            where: { id: report.interviewId },
            data: { isHidden: true },
          });
        } else if (report.commentId) {
          await tx.comment.update({
            where: { id: report.commentId },
            data: { isDeleted: true }, // Reuse soft-delete
          });
        }
      }
    });

    const newSnapshot = JSON.stringify({ id: report.id, status });

    // Write audit log
    await auditLogRepository.create({
      actorId: moderatorId,
      action: status === 'RESOLVED' ? `RESOLVE_REPORT:${actionTaken}` : 'DISMISS_REPORT',
      targetId: reportId,
      targetType: 'REPORT',
      reason,
      previousState: previousSnapshot,
      newState: newSnapshot,
    });

    // Notify post owner if hidden
    if (status === 'RESOLVED' && actionTaken === 'HIDE_CONTENT') {
      try {
        const recipientId = report.interview?.authorId || report.comment?.authorId;
        if (recipientId) {
          await notificationService.createNotification({
            recipientId,
            type: 'REPORT_RESOLUTION',
            interviewId: report.interviewId || undefined,
            commentId: report.commentId || undefined,
          });
        }
      } catch (notifErr) {
        console.error('⚠️ Failed to notify resolved action:', notifErr);
      }
    }

    return { id: reportId, status };
  }

  /**
   * Suspend a user account (Admin only).
   */
  async suspendUser(adminId: string, targetUserId: string, reason: string) {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A detailed suspension reason (minimum 5 characters) must be provided.');
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isSuspended) {
      throw new BadRequestError('User is already suspended');
    }

    const previousSnapshot = JSON.stringify({ id: user.id, isSuspended: user.isSuspended });

    // Transactionally suspend user and invalidate tokens
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetUserId },
        data: {
          isSuspended: true,
          suspensionReason: reason,
        },
      });

      // Revoke all active refresh sessions
      await tx.refreshToken.updateMany({
        where: { userId: targetUserId, isRevoked: false },
        data: { isRevoked: true },
      });
    });

    const newSnapshot = JSON.stringify({ id: user.id, isSuspended: true });

    await auditLogRepository.create({
      actorId: adminId,
      action: 'SUSPEND_USER',
      targetId: targetUserId,
      targetType: 'USER',
      reason,
      previousState: previousSnapshot,
      newState: newSnapshot,
    });

    return { id: targetUserId, isSuspended: true };
  }

  /**
   * Restore a suspended user account (Admin only).
   */
  async restoreUser(adminId: string, targetUserId: string, reason: string) {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestError('A detailed restoration explanation (minimum 5 characters) must be provided.');
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.isSuspended) {
      throw new BadRequestError('User is not suspended');
    }

    const previousSnapshot = JSON.stringify({ id: user.id, isSuspended: user.isSuspended });

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isSuspended: false,
        suspensionReason: null,
      },
    });

    const newSnapshot = JSON.stringify({ id: user.id, isSuspended: false });

    await auditLogRepository.create({
      actorId: adminId,
      action: 'RESTORE_USER',
      targetId: targetUserId,
      targetType: 'USER',
      reason,
      previousState: previousSnapshot,
      newState: newSnapshot,
    });

    return { id: targetUserId, isSuspended: false };
  }

  /**
   * Fetch paginated audit trail logs (Admin only).
   */
  async getAuditLogs(params: {
    actorId?: string;
    action?: string;
    targetType?: string;
    page: number;
    limit: number;
  }) {
    const { logs, totalCount } = await auditLogRepository.findMany(params);

    return {
      logs,
      pagination: {
        page: params.page,
        limit: params.limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / params.limit),
        hasNextPage: params.page * params.limit < totalCount,
        hasPreviousPage: params.page > 1,
      },
    };
  }

  /**
   * Fetch moderator dashboard statistics.
   */
  async getDashboardStats() {
    const [pendingVerifications, pendingReports, resolvedCount] = await Promise.all([
      prisma.verification.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today's changes
          },
        },
      }),
    ]);

    return {
      pendingVerifications,
      pendingReports,
      resolvedCount,
    };
  }
}

export const moderationService = new ModerationService();
