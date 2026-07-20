import { prisma } from '../config/db';
import { Notification, NotificationType } from '@prisma/client';

export class NotificationRepository {
  /**
   * Find a notification by ID and recipient.
   */
  async findByIdAndRecipient(id: string, recipientId: string): Promise<Notification | null> {
    return prisma.notification.findFirst({
      where: {
        id,
        recipientId,
      },
    });
  }

  /**
   * Create a notification record.
   */
  async create(data: {
    recipientId: string;
    senderId?: string;
    type: NotificationType;
    interviewId?: string;
    commentId?: string;
  }): Promise<Notification> {
    return prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        senderId: data.senderId || null,
        type: data.type,
        interviewId: data.interviewId || null,
        commentId: data.commentId || null,
      },
    });
  }

  /**
   * Mark a specific notification as read.
   */
  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a recipient.
   */
  async markAllAsRead(recipientId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { recipientId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Get unread notification counts.
   */
  async countUnread(recipientId: string): Promise<number> {
    return prisma.notification.count({
      where: { recipientId, isRead: false },
    });
  }

  /**
   * Fetch paginated list of notifications for a recipient.
   */
  async findManyByRecipientId(params: {
    recipientId: string;
    page: number;
    limit: number;
  }) {
    const { recipientId, page, limit } = params;
    const skip = (page - 1) * limit;

    const [notifications, totalCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { recipientId },
        include: {
          sender: {
            select: { id: true, username: true, fullName: true, profile: { select: { avatarUrl: true } } },
          },
          interview: {
            select: { id: true, role: true, company: { select: { name: true } } },
          },
          comment: {
            select: { id: true, content: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { recipientId },
      }),
    ]);

    return { notifications, totalCount };
  }
}

export const notificationRepository = new NotificationRepository();
