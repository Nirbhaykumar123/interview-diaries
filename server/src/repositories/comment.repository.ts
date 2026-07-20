import { prisma } from '../config/db';
import { Comment } from '@prisma/client';

export class CommentRepository {
  /**
   * Find a comment by its ID.
   */
  async findById(id: string) {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  /**
   * Create a comment or nested reply.
   */
  async create(data: {
    interviewId: string;
    authorId: string;
    content: string;
    parentId?: string;
  }) {
    return prisma.comment.create({
      data: {
        interviewId: data.interviewId,
        authorId: data.authorId,
        content: data.content,
        parentId: data.parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update comment content.
   */
  async update(id: string, content: string): Promise<Comment> {
    return prisma.comment.update({
      where: { id },
      data: { content },
    });
  }

  /**
   * Soft-delete a comment by marking it as deleted.
   */
  async softDelete(id: string): Promise<Comment> {
    return prisma.comment.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }

  /**
   * Fetch paginated top-level comments for an interview, along with their replies nested.
   */
  async findManyByInterviewId(params: {
    interviewId: string;
    page: number;
    limit: number;
  }) {
    const { interviewId, page, limit } = params;
    const skip = (page - 1) * limit;

    const [comments, totalCount] = await prisma.$transaction([
      prisma.comment.findMany({
        where: {
          interviewId,
          parentId: null, // Only fetch top-level comments initially
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  profile: {
                    select: {
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'asc', // Replies listed chronologically
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Newest top-level comments first
        },
        skip,
        take: limit,
      }),
      prisma.comment.count({
        where: {
          interviewId,
          parentId: null,
        },
      }),
    ]);

    return { comments, totalCount };
  }
}

export const commentRepository = new CommentRepository();
