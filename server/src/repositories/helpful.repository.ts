import { prisma } from '../config/db';
import { HelpfulVote } from '@prisma/client';

export class HelpfulRepository {
  /**
   * Find a specific helpful vote record.
   */
  async findByUserIdAndInterviewId(userId: string, interviewId: string): Promise<HelpfulVote | null> {
    return prisma.helpfulVote.findUnique({
      where: {
        userId_interviewId: {
          userId,
          interviewId,
        },
      },
    });
  }

  /**
   * Add a helpful vote record.
   */
  async create(userId: string, interviewId: string): Promise<HelpfulVote> {
    return prisma.helpfulVote.create({
      data: {
        userId,
        interviewId,
      },
    });
  }

  /**
   * Remove a helpful vote record.
   */
  async delete(userId: string, interviewId: string): Promise<void> {
    await prisma.helpfulVote.delete({
      where: {
        userId_interviewId: {
          userId,
          interviewId,
        },
      },
    });
  }
}

export const helpfulRepository = new HelpfulRepository();
