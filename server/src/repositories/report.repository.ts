import { prisma } from '../config/db';
import { Report, ReportReason, ReportStatus } from '@prisma/client';

export class ReportRepository {
  /**
   * Find a report by ID.
   */
  async findById(id: string) {
    return prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
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
   * Create a report for inappropriate content.
   */
  async create(data: {
    reporterId: string;
    interviewId?: string;
    commentId?: string;
    reason: ReportReason;
    details?: string;
  }): Promise<Report> {
    return prisma.report.create({
      data: {
        reporterId: data.reporterId,
        interviewId: data.interviewId || null,
        commentId: data.commentId || null,
        reason: data.reason,
        details: data.details || null,
      },
    });
  }

  /**
   * Update report state (resolve or dismiss).
   */
  async updateStatus(id: string, status: ReportStatus): Promise<Report> {
    return prisma.report.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Lists paginated reports for moderation query queues.
   */
  async findMany(params: {
    status?: ReportStatus;
    page: number;
    limit: number;
  }) {
    const { status, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [reports, totalCount] = await prisma.$transaction([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, username: true, fullName: true },
          },
          interview: {
            select: { id: true, role: true, company: { select: { name: true } } },
          },
          comment: {
            select: { id: true, content: true, isDeleted: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return { reports, totalCount };
  }
}

export const reportRepository = new ReportRepository();
