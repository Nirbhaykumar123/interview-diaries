import { prisma } from '../config/db';
import { Bookmark } from '@prisma/client';

export class BookmarkRepository {
  /**
   * Find a specific bookmark by the combined unique user ID and interview ID.
   */
  async findByUserIdAndInterviewId(userId: string, interviewId: string): Promise<Bookmark | null> {
    return prisma.bookmark.findUnique({
      where: {
        userId_interviewId: {
          userId,
          interviewId,
        },
      },
    });
  }

  /**
   * Add a new bookmark.
   */
  async create(userId: string, interviewId: string): Promise<Bookmark> {
    return prisma.bookmark.create({
      data: {
        userId,
        interviewId,
      },
    });
  }

  /**
   * Remove a bookmark.
   */
  async delete(userId: string, interviewId: string): Promise<void> {
    await prisma.bookmark.delete({
      where: {
        userId_interviewId: {
          userId,
          interviewId,
        },
      },
    });
  }
}

export const bookmarkRepository = new BookmarkRepository();
