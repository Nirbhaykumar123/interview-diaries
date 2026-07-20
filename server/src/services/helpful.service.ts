import { helpfulRepository } from '../repositories/helpful.repository';
import { prisma } from '../config/db';
import { NotFoundError, ConflictError } from '../utils/errors';
import { notificationService } from './notification.service';

export class HelpfulService {
  /**
   * Casts a helpful vote on an interview experience.
   * Increments the cached helpfulCount atomically.
   */
  async addHelpfulVote(userId: string, interviewId: string): Promise<void> {
    // 1. Verify the interview exists, is published, and not deleted
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        isDeleted: false,
        status: 'PUBLISHED',
      },
    });

    if (!interview) {
      throw new NotFoundError('Interview experience not found');
    }

    // 2. Prevent duplicate votes
    const existing = await helpfulRepository.findByUserIdAndInterviewId(userId, interviewId);
    if (existing) {
      throw new ConflictError('You have already marked this interview as helpful');
    }

    // 3. Atomically add the vote record and increment the counter
    await prisma.$transaction(async (tx) => {
      await tx.helpfulVote.create({
        data: {
          userId,
          interviewId,
        },
      });

      await tx.interview.update({
        where: { id: interviewId },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      });
    });

    // 4. Trigger social notification
    try {
      await notificationService.createNotification({
        recipientId: interview.authorId,
        senderId: userId,
        type: 'HELPFUL_VOTE',
        interviewId,
      });
    } catch (notifErr) {
      console.error('⚠️ Failed to dispatch helpful notification:', notifErr);
    }
  }

  /**
   * Revokes a previously cast helpful vote.
   * Decrements the cached helpfulCount atomically.
   */
  async removeHelpfulVote(userId: string, interviewId: string): Promise<void> {
    // 1. Verify the vote exists before trying to remove it
    const existing = await helpfulRepository.findByUserIdAndInterviewId(userId, interviewId);
    if (!existing) {
      throw new NotFoundError('Helpful vote record not found');
    }

    // 2. Atomically delete the vote record and decrement the counter
    await prisma.$transaction(async (tx) => {
      await tx.helpfulVote.delete({
        where: {
          userId_interviewId: {
            userId,
            interviewId,
          },
        },
      });

      await tx.interview.update({
        where: { id: interviewId },
        data: {
          helpfulCount: {
            decrement: 1,
          },
        },
      });
    });
  }

  /**
   * Verifies if the active user has already cast a vote.
   */
  async checkVoteStatus(userId: string, interviewId: string): Promise<boolean> {
    const existing = await helpfulRepository.findByUserIdAndInterviewId(userId, interviewId);
    return !!existing;
  }
}

export const helpfulService = new HelpfulService();
