import { Request, Response, NextFunction } from 'express';
import { bookmarkService } from '../services/bookmark.service';

export class BookmarkController {
  /**
   * POST /api/bookmarks/:interviewId
   * Saves an interview to user's bookmarks list.
   */
  addBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const { interviewId } = req.params as { interviewId: string };

      await bookmarkService.addBookmark(userId, interviewId);

      res.status(201).json({
        status: 'success',
        message: 'Interview bookmarked successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/bookmarks/:interviewId
   * Removes an interview from user's bookmarks list.
   */
  removeBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const { interviewId } = req.params as { interviewId: string };

      await bookmarkService.removeBookmark(userId, interviewId);

      res.status(200).json({
        status: 'success',
        message: 'Bookmark removed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/bookmarks/:interviewId/check
   * Verifies if the active user has bookmarked the target interview.
   */
  checkBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const { interviewId } = req.params as { interviewId: string };

      const isBookmarked = await bookmarkService.checkBookmarkStatus(userId, interviewId);

      res.status(200).json({
        status: 'success',
        data: { isBookmarked },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const bookmarkController = new BookmarkController();
