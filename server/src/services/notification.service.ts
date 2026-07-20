import { notificationRepository } from '../repositories/notification.repository';
import { NotFoundError } from '../utils/errors';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  /**
   * Internal method to dispatch notifications silently in the background.
   */
  async createNotification(data: {
    recipientId: string;
    senderId?: string;
    type: NotificationType;
    interviewId?: string;
    commentId?: string;
  }) {
    // Avoid sending self-notifications
    if (data.recipientId === data.senderId) return null;

    return notificationRepository.create(data);
  }

  /**
   * Fetch paginated list of notifications for the active user.
   */
  async getNotifications(params: {
    recipientId: string;
    page: number;
    limit: number;
  }) {
    const { notifications, totalCount } = await notificationRepository.findManyByRecipientId(params);
    const unreadCount = await notificationRepository.countUnread(params.recipientId);

    return {
      notifications,
      unreadCount,
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

  /**
   * Mark a specific notification as read.
   */
  async markAsRead(recipientId: string, notificationId: string) {
    const notification = await notificationRepository.findByIdAndRecipient(notificationId, recipientId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    return notificationRepository.markAsRead(notificationId);
  }

  /**
   * Mark all notifications as read for a recipient.
   */
  async markAllAsRead(recipientId: string) {
    await notificationRepository.markAllAsRead(recipientId);
  }

  /**
   * Fetch unread notification counts.
   */
  async getUnreadCount(recipientId: string) {
    const count = await notificationRepository.countUnread(recipientId);
    return { unreadCount: count };
  }
}

export const notificationService = new NotificationService();
