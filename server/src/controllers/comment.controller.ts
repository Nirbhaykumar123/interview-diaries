import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/comment.service';

export class CommentController {
  /**
   * POST /api/interviews/:interviewId/comments
   * Adds a comment or nested reply.
   */
  addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const { interviewId } = req.params as { interviewId: string };
      const { content, parentId } = req.body;

      const comment = await commentService.addComment({
        userId,
        interviewId,
        content,
        parentId,
      });

      res.status(201).json({
        status: 'success',
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/comments/:commentId
   * Modifies an existing comment.
   */
  updateComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const { commentId } = req.params as { commentId: string };
      const { content } = req.body;

      const comment = await commentService.updateComment(userId, commentId, content);

      res.status(200).json({
        status: 'success',
        data: { comment },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/comments/:commentId
   * Soft-deletes a comment.
   */
  deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const userRole = (req as any).user.role;
      const { commentId } = req.params as { commentId: string };

      await commentService.deleteComment(userId, userRole, commentId);

      res.status(200).json({
        status: 'success',
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/interviews/:interviewId/comments
   * Lists paginated comments with replies nested.
   */
  getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { interviewId } = req.params as { interviewId: string };
      const { page, limit } = req.query as any;
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      const result = await commentService.getComments({
        interviewId,
        page: pageNum,
        limit: limitNum,
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const commentController = new CommentController();
