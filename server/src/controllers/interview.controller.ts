import { Request, Response, NextFunction } from 'express';
import { interviewService } from '../services/interview.service';

export class InterviewController {
  /**
   * POST /api/interviews
   * Creates a new experience post with nested rounds list.
   */
  createInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authorId = (req as any).user.sub;
      const result = await interviewService.createInterview(authorId, req.body);

      res.status(201).json({
        status: 'success',
        data: { interview: result },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/interviews
   * Renders the public paginated feed of published experiences.
   */
  getInterviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await interviewService.getInterviews(req.query as any);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/interviews/user/me
   * Renders posts authored by the logged-in student.
   */
  getMyInterviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const interviews = await interviewService.getMyInterviews(userId);

      res.status(200).json({
        status: 'success',
        data: { interviews },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/interviews/:id
   * Detailed lookup by UUID.
   */
  getInterviewById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const currentUserId = (req as any).user?.sub || undefined;
      const currentUserRole = (req as any).user?.role || undefined;

      const interview = await interviewService.getInterviewById(id, currentUserId, currentUserRole);

      res.status(200).json({
        status: 'success',
        data: { interview },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/interviews/:id
   * Edit post details. Protected by ownership logic.
   */
  updateInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.sub;
      const userRole = (req as any).user.role;

      const result = await interviewService.updateInterview(id, userId, userRole, req.body);

      res.status(200).json({
        status: 'success',
        data: { interview: result },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/interviews/:id
   * Soft deletes a post. Protected by ownership rules.
   */
  deleteInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.sub;
      const userRole = (req as any).user.role;

      await interviewService.deleteInterview(id, userId, userRole);

      res.status(200).json({
        status: 'success',
        message: 'Interview experience deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
  /**
   * GET /api/interviews/trending
   * Renders the top 5 most helpful experiences.
   */
  getTrendingInterviews = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await interviewService.getInterviews({ sortBy: 'helpfulCount', limit: 5 });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/interviews/recent
   * Renders the top 5 newest experiences.
   */
  getRecentInterviews = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await interviewService.getInterviews({ sortBy: 'createdAt', limit: 5 });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/interviews/:id/related
   * Renders up to 3 related interview experiences.
   */
  getRelatedInterviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const interviews = await interviewService.getRelatedInterviews(id);

      res.status(200).json({
        status: 'success',
        data: { interviews },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const interviewController = new InterviewController();
