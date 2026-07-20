import { reportRepository } from '../repositories/report.repository';
import { prisma } from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { ReportReason, ReportStatus } from '@prisma/client';

export class ReportService {
  /**
   * File a report on an interview or comment.
   */
  async createReport(params: {
    reporterId: string;
    interviewId?: string;
    commentId?: string;
    reason: ReportReason;
    details?: string;
  }) {
    const { reporterId, interviewId, commentId, reason, details } = params;

    // 1. Enforce mutually exclusive polymorphic targets
    if (!interviewId && !commentId) {
      throw new BadRequestError('Must specify either an interview ID or a comment ID to report');
    }
    if (interviewId && commentId) {
      throw new BadRequestError('Cannot report both an interview and a comment in a single report');
    }

    // 2. Validate target entity exists
    if (interviewId) {
      const interview = await prisma.interview.findFirst({
        where: { id: interviewId, isDeleted: false },
      });
      if (!interview) {
        throw new NotFoundError('Target interview experience not found');
      }
    } else if (commentId) {
      const comment = await prisma.comment.findFirst({
        where: { id: commentId, isDeleted: false },
      });
      if (!comment) {
        throw new NotFoundError('Target comment not found');
      }
    }

    // 3. Avoid duplicate pending reports from the same user on the same entity
    const duplicate = await prisma.report.findFirst({
      where: {
        reporterId,
        interviewId: interviewId || null,
        commentId: commentId || null,
        status: 'PENDING',
      },
    });

    if (duplicate) {
      throw new BadRequestError('You have already submitted a pending report for this content');
    }

    return reportRepository.create({
      reporterId,
      interviewId,
      commentId,
      reason,
      details,
    });
  }

  /**
   * Action a pending report (Resolve or Dismiss).
   */
  async resolveReport(reportId: string, status: ReportStatus) {
    const report = await reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    if (report.status !== 'PENDING') {
      throw new BadRequestError('This report has already been reviewed');
    }

    return reportRepository.updateStatus(reportId, status);
  }

  /**
   * Retrieve lists of reports for the admin dashboard.
   */
  async getReports(params: {
    status?: ReportStatus;
    page: number;
    limit: number;
  }) {
    const { reports, totalCount } = await reportRepository.findMany(params);

    return {
      reports,
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

export const reportService = new ReportService();
