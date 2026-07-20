import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  /**
   * GET /api/notifications
   * Fetch paginated notifications feed.
   */
  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipientId = (req as any).user.sub;
      const { page, limit } = req.query as any;

      const result = await notificationService.getNotifications({
        recipientId,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/notifications/:notificationId/read
   * Mark a single notification record as read.
   */
  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipientId = (req as any).user.sub;
      const { notificationId } = req.params as { notificationId: string };

      const notification = await notificationService.markAsRead(recipientId, notificationId);

      res.status(200).json({
        status: 'success',
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/notifications/read-all
   * Marks all pending notifications as read for the active user.
   */
  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipientId = (req as any).user.sub;

      await notificationService.markAllAsRead(recipientId);

      res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/notifications/unread-count
   * Returns count of unread notifications for navigation badges.
   */
  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipientId = (req as any).user.sub;

      const result = await notificationService.getUnreadCount(recipientId);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const notificationController = new NotificationController();
