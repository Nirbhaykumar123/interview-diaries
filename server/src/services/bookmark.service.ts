import { bookmarkRepository } from '../repositories/bookmark.repository';
import { prisma } from '../config/db';
import { NotFoundError, ConflictError } from '../utils/errors';

export class BookmarkService {
  /**
   * Adds a new bookmark for an interview.
   * Guarantees unique constraints by preventing duplicates.
   */
  async addBookmark(userId: string, interviewId: string): Promise<void> {
    // 1. Verify the interview exists, is published, and not deleted
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        isDeleted: false,
        status: 'PUBLISHED',
      },
    });

    if (!interview) {
      throw new NotFoundError('Interview experience not found or is currently a draft');
    }

    // 2. Avoid duplicate bookmark violations
    const existing = await bookmarkRepository.findByUserIdAndInterviewId(userId, interviewId);
    if (existing) {
      throw new ConflictError('You have already bookmarked this interview experience');
    }

    await bookmarkRepository.create(userId, interviewId);
  }

  /**
   * Removes an existing bookmark.
   */
  async removeBookmark(userId: string, interviewId: string): Promise<void> {
    const existing = await bookmarkRepository.findByUserIdAndInterviewId(userId, interviewId);
    if (!existing) {
      throw new NotFoundError('Bookmark does not exist');
    }

    await bookmarkRepository.delete(userId, interviewId);
  }

  /**
   * Checks whether the current user has bookmarked a given interview.
   */
  async checkBookmarkStatus(userId: string, interviewId: string): Promise<boolean> {
    const existing = await bookmarkRepository.findByUserIdAndInterviewId(userId, interviewId);
    return !!existing;
  }
}

export const bookmarkService = new BookmarkService();
