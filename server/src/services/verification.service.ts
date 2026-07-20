import { verificationRepository } from '../repositories/verification.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { prisma } from '../config/db';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { VerificationStatus } from '@prisma/client';
import { notificationService } from './notification.service';

export class VerificationService {
  /**
   * Submit or update a verification request for an interview experience.
   */
  async requestVerification(
    userId: string,
    params: {
      interviewId: string;
      evidenceUrl?: string;
      evidenceType?: string;
    }
  ) {
    const { interviewId, evidenceUrl, evidenceType } = params;

    // 1. Fetch parent interview and verify ownership
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new NotFoundError('Interview experience not found');
    }

    if (interview.authorId !== userId) {
      throw new ForbiddenError('You can only submit verification requests for your own posts');
    }

    if (interview.status !== 'PUBLISHED') {
      throw new BadRequestError('Cannot request verification for a draft post. Please publish it first.');
    }

    // 2. Check if a verification request already exists
    const existing = await verificationRepository.findByInterviewId(interviewId);

    if (existing) {
      if (existing.status === 'VERIFIED') {
        throw new BadRequestError('This experience is already verified.');
      }
      if (existing.status === 'PENDING') {
        throw new BadRequestError('A verification request is already pending review for this experience.');
      }
      if (existing.status === 'UNDER_REVIEW') {
        throw new BadRequestError('This request is currently under review by our moderation team.');
      }

      // Re-submit verification request for rejected/pending status
      return verificationRepository.update(existing.id, {
        status: 'PENDING',
        rejectionReason: null,
      });
    }

    // 3. Create new verification request
    return verificationRepository.create({
      interviewId,
      evidenceUrl,
      evidenceType,
    });
  }

  /**
   * Fetch paginated list of verification requests.
   */
  async getVerifications(params: {
    status?: VerificationStatus;
    page: number;
    limit: number;
  }) {
    const { verifications, totalCount } = await verificationRepository.findMany(params);

    return {
      verifications,
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
   * Approve or reject a verification request.
   */
  async resolveVerification(
    reviewerId: string,
    verificationId: string,
    params: {
      status: 'VERIFIED' | 'REJECTED';
      rejectionReason?: string;
    }
  ) {
    const { status, rejectionReason } = params;

    // 1. Fetch request with details
    const verification = await verificationRepository.findById(verificationId);
    if (!verification) {
      throw new NotFoundError('Verification request not found');
    }

    if (verification.status === 'VERIFIED' && status === 'VERIFIED') {
      throw new BadRequestError('Verification is already approved');
    }

    // Conflict Guard: A reviewer cannot verify their own interview experience (except in development mode)
    if (verification.interview.authorId === reviewerId && process.env.NODE_ENV !== 'development') {
      throw new ForbiddenError('You cannot review or approve your own interview experience');
    }

    if (status === 'REJECTED' && (!rejectionReason || rejectionReason.trim().length < 5)) {
      throw new BadRequestError('A detailed rejection reason (minimum 5 characters) must be provided.');
    }

    const previousSnapshot = JSON.stringify({
      id: verification.id,
      status: verification.status,
      isVerified: verification.interview.isVerified,
    });

    const isVerifiedValue = status === 'VERIFIED';

    let updatedVerification;

    // 2. Transactional update to preserve data consistency
    await prisma.$transaction(async (tx) => {
      // Update verification request
      updatedVerification = await tx.verification.update({
        where: { id: verificationId },
        data: {
          status,
          reviewerId,
          rejectionReason: status === 'REJECTED' ? rejectionReason?.trim() : null,
        },
      });

      // Update parent interview
      await tx.interview.update({
        where: { id: verification.interviewId },
        data: {
          isVerified: isVerifiedValue,
        },
      });
    });

    const newSnapshot = JSON.stringify({
      id: verification.id,
      status,
      isVerified: isVerifiedValue,
    });

    // 3. Create immutable audit log entry
    try {
      await auditLogRepository.create({
        actorId: reviewerId,
        action: status === 'VERIFIED' ? 'VERIFY_INTERVIEW' : 'REJECT_VERIFICATION',
        targetId: verification.interviewId,
        targetType: 'INTERVIEW',
        reason: status === 'REJECTED' ? rejectionReason : 'Evidence validated successfully.',
        previousState: previousSnapshot,
        newState: newSnapshot,
      });
    } catch (auditErr) {
      console.error('⚠️ Audit log write failed:', auditErr);
    }

    // 4. Send background notification to candidate
    try {
      await notificationService.createNotification({
        recipientId: verification.interview.authorId,
        type: 'SYSTEM',
        interviewId: verification.interviewId,
      });
    } catch (notifErr) {
      console.error('⚠️ Failed to dispatch verification notification:', notifErr);
    }

    return updatedVerification;
  }
}

export const verificationService = new VerificationService();
