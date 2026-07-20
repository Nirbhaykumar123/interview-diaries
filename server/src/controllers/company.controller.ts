import { Request, Response, NextFunction } from 'express';
import { companyService } from '../services/company.service';

export class CompanyController {
  /**
   * GET /api/companies
   * Returns a paginated list of companies matching search and filters
   */
  getCompanies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await companyService.getCompanies(req.query as any);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/companies/:id
   * Returns a single company matching the UUID key
   */
  getCompanyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const company = await companyService.getCompanyById(req.params.id as string);
      res.status(200).json({
        status: 'success',
        data: { company },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/companies/slug/:slug
   * Returns a single company matching the SEO URL slug
   */
  getCompanyBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const company = await companyService.getCompanyBySlug(req.params.slug as string);
      res.status(200).json({
        status: 'success',
        data: { company },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/companies/search/suggestions
   * Returns lightweight autocomplete names for search dropdown inputs
   */
  getSuggestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const suggestions = await companyService.getSuggestions(req.query.q as string);
      res.status(200).json({
        status: 'success',
        data: { suggestions },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/companies
   * Inserts a new company profile. Protected by authentication middleware.
   */
  createCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Retrieve the logged-in user's ID from authentication middleware context
      const createdById = (req as any).user?.sub || null;

      const company = await companyService.createCompany({
        ...req.body,
        createdById,
      });

      res.status(201).json({
        status: 'success',
        data: { company },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const companyController = new CompanyController();
