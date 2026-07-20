import { Request, Response, NextFunction } from 'express';
import { helpfulService } from '../services/helpful.service';

export class HelpfulController {
  /**
   * POST /api/helpful/:interviewId
   * Casts a helpful vote on an interview.
   */
  addVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const { interviewId } = req.params as { interviewId: string };

      await helpfulService.addHelpfulVote(userId, interviewId);

      res.status(201).json({
        status: 'success',
        message: 'Interview marked as helpful',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/helpful/:interviewId
   * Revokes a helpful vote.
   */
  removeVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const { interviewId } = req.params as { interviewId: string };

      await helpfulService.removeHelpfulVote(userId, interviewId);

      res.status(200).json({
        status: 'success',
        message: 'Helpful vote revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/helpful/:interviewId/check
   * Verifies if the active user has marked the target interview as helpful.
   */
  checkVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const { interviewId } = req.params as { interviewId: string };

      const hasVoted = await helpfulService.checkVoteStatus(userId, interviewId);

      res.status(200).json({
        status: 'success',
        data: { hasVoted },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const helpfulController = new HelpfulController();
