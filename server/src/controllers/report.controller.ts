import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';

export class ReportController {
  /**
   * POST /api/reports
   * Files a new content violation report.
   */
  createReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reporterId = (req as any).user.sub;
      const { interviewId, commentId, reason, details } = req.body;

      const report = await reportService.createReport({
        reporterId,
        interviewId,
        commentId,
        reason,
        details,
      });

      res.status(201).json({
        status: 'success',
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/reports/:reportId/resolve
   * Resolves or dismisses a report (Admin only).
   */
  resolveReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reportId } = req.params as { reportId: string };
      const { status } = req.body;

      const report = await reportService.resolveReport(reportId, status);

      res.status(200).json({
        status: 'success',
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/reports
   * Lists reports (Admin only).
   */
  getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, page, limit } = req.query as any;

      const result = await reportService.getReports({
        status,
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
}

export const reportController = new ReportController();
