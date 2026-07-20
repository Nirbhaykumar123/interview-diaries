import { Router } from 'express';
import { companyController } from '../controllers/company.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth.middleware';
import { getCompaniesSchema, createCompanySchema } from '../validations/company.validation';

const router = Router();

// GET /api/companies - Paginated and filtered lists
router.get('/', validate(getCompaniesSchema), companyController.getCompanies);

// GET /api/companies/search/suggestions - Autocomplete typeahead matches
router.get('/search/suggestions', companyController.getSuggestions);

// GET /api/companies/slug/:slug - SEO friendly slug lookup
router.get('/slug/:slug', companyController.getCompanyBySlug);

// GET /api/companies/:id - Specific ID lookup
router.get('/:id', companyController.getCompanyById);

// POST /api/companies - Create a new company profile (Authenticated only)
router.post('/', authenticate, validate(createCompanySchema), companyController.createCompany);

export default router;
