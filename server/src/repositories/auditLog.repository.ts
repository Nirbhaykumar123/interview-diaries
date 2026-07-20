import { prisma } from '../config/db';
import { AuditLog } from '@prisma/client';

export class AuditLogRepository {
  /**
   * Create an audit log record.
   * Note: This is an insert-only table. No update or delete operations are exposed.
   */
  async create(data: {
    actorId: string;
    action: string;
    targetId: string;
    targetType: string;
    reason?: string | null;
    previousState?: string | null;
    newState?: string | null;
  }): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        targetId: data.targetId,
        targetType: data.targetType,
        reason: data.reason || null,
        previousState: data.previousState || null,
        newState: data.newState || null,
      },
    });
  }

  /**
   * Fetch paginated chronological audit logs list.
   */
  async findMany(params: {
    actorId?: string;
    action?: string;
    targetType?: string;
    page: number;
    limit: number;
  }) {
    const { actorId, action, targetType, page, limit } = params;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (actorId) whereClause.actorId = actorId;
    if (action) whereClause.action = action;
    if (targetType) whereClause.targetType = targetType;

    const [logs, totalCount] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          actor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({
        where: whereClause,
      }),
    ]);

    return { logs, totalCount };
  }
}

export const auditLogRepository = new AuditLogRepository();
