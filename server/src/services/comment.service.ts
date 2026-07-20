import { commentRepository } from '../repositories/comment.repository';
import { prisma } from '../config/db';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { notificationService } from './notification.service';

export class CommentService {
  /**
   * Adds a comment to an interview experience.
   * Can also be a reply to a top-level comment.
   */
  async addComment(params: {
    userId: string;
    interviewId: string;
    content: string;
    parentId?: string;
  }) {
    const { userId, interviewId, content, parentId } = params;

    // 1. Verify target interview exists and is published
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

    // 2. If it is a reply, validate the parent comment
    if (parentId) {
      const parentComment = await commentRepository.findById(parentId);
      if (!parentComment) {
        throw new NotFoundError('Parent comment not found');
      }

      if (parentComment.isDeleted) {
        throw new BadRequestError('Cannot reply to a deleted comment');
      }

      if (parentComment.interviewId !== interviewId) {
        throw new BadRequestError('Parent comment must belong to the same interview experience');
      }

      // Enforce clean one-level nesting (no replies to replies)
      if (parentComment.parentId !== null) {
        throw new BadRequestError('Cannot reply to a reply. Only one level of nesting is allowed.');
      }
    }

    // 3. Create comment
    const newComment = await commentRepository.create({
      interviewId,
      authorId: userId,
      content: content.trim(),
      parentId,
    });

    // 4. Update the interview's comment count cache
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    // 5. Trigger social notification (in the background, no await block for fast response)
    try {
      if (parentId) {
        const parentComment = await commentRepository.findById(parentId);
        if (parentComment) {
          await notificationService.createNotification({
            recipientId: parentComment.authorId,
            senderId: userId,
            type: 'REPLY',
            interviewId,
            commentId: newComment.id,
          });
        }
      } else {
        await notificationService.createNotification({
          recipientId: interview.authorId,
          senderId: userId,
          type: 'COMMENT',
          interviewId,
          commentId: newComment.id,
        });
      }
    } catch (notifErr) {
      // Fail silently so comment post is not blocked by notification failures
      console.error('⚠️ Failed to dispatch comment/reply notification:', notifErr);
    }

    return newComment;
  }

  /**
   * Modifies an existing comment. Only the owner can edit.
   */
  async updateComment(userId: string, commentId: string, content: string) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.isDeleted) {
      throw new BadRequestError('Cannot edit a deleted comment');
    }

    // Validate ownership
    if (comment.authorId !== userId) {
      throw new ForbiddenError('You do not have permission to edit this comment');
    }

    return commentRepository.update(commentId, content.trim());
  }

  /**
   * Soft-deletes a comment (owner or admin).
   */
  async deleteComment(userId: string, userRole: string, commentId: string) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.isDeleted) {
      throw new BadRequestError('Comment is already deleted');
    }

    // Validate ownership or admin status
    if (comment.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this comment');
    }

    const deleted = await commentRepository.softDelete(commentId);

    // Decrement comment count on parent interview
    await prisma.interview.update({
      where: { id: comment.interviewId },
      data: {
        commentCount: {
          decrement: 1,
        },
      },
    });

    return deleted;
  }

  /**
   * Fetch paginated top-level comments for an interview.
   */
  async getComments(params: {
    interviewId: string;
    page: number;
    limit: number;
  }) {
    // Verify target interview exists
    const interview = await prisma.interview.findFirst({
      where: {
        id: params.interviewId,
        isDeleted: false,
      },
    });

    if (!interview) {
      throw new NotFoundError('Interview experience not found');
    }

    const { comments, totalCount } = await commentRepository.findManyByInterviewId(params);

    return {
      comments,
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
}

export const commentService = new CommentService();
