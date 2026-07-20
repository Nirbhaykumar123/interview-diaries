import { companyRepository } from '../repositories/company.repository';
import { Company } from '@prisma/client';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';

export interface CompanyListQuery {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  isHiring?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCompaniesResponse {
  companies: Company[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class CompanyService {
  /**
   * Helper function to generate a URL-safe, lowercase alphanumeric slug from a company name.
   * e.g., "Google India L.T.D." -> "google-india-ltd"
   */
  public slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove special characters
      .replace(/[\s_-]+/g, '-') // collapse spaces/underscores into dashes
      .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
  }

  /**
   * Orchestrates paging logic, validates sorting fields, and retrieves list summaries
   */
  async getCompanies(query: CompanyListQuery): Promise<PaginatedCompaniesResponse> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10)); // cap limit to max 100
    const skip = (page - 1) * limit;

    // Validate and sanitize sort options
    const allowedSortBy = ['name', 'interviewCount', 'createdAt'];
    const sortBy = allowedSortBy.includes(query.sortBy || '') ? query.sortBy! : 'name';
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

    const { companies, total } = await companyRepository.findAndCount({
      skip,
      take: limit,
      search: query.search,
      industry: query.industry,
      isHiring: query.isHiring,
      sortBy,
      sortOrder,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      companies,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Find a single company by its unique UUID.
   */
  async getCompanyById(id: string): Promise<Company> {
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new BadRequestError('Invalid UUID format provided');
    }

    const company = await companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    return company;
  }

  /**
   * Find a single company by its URL slug.
   */
  async getCompanyBySlug(slug: string): Promise<Company> {
    const company = await companyRepository.findBySlug(slug);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    return company;
  }

  /**
   * Fetches lightweight autocomplete items
   */
  async getSuggestions(query: string): Promise<Pick<Company, 'id' | 'name' | 'slug' | 'logoUrl'>[]> {
    const searchString = query ? query.trim() : '';
    if (searchString.length < 2) {
      return [];
    }

    return companyRepository.findSuggestions(searchString);
  }

  /**
   * Create a new company record, validating duplicates on company name
   */
  async createCompany(data: {
    name: string;
    description?: string;
    logoUrl?: string;
    website?: string;
    industry?: string;
    location?: string;
    isHiring?: boolean;
    createdById?: string;
  }): Promise<Company> {
    const name = data.name.trim();
    if (!name) {
      throw new BadRequestError('Company name is required');
    }

    const slug = this.slugify(name);

    // Verify if company name or slug already exists
    const existingCompany = await companyRepository.findBySlug(slug);
    if (existingCompany) {
      throw new ConflictError('A company with this name already exists');
    }

    return companyRepository.createCompany({
      name,
      slug,
      description: data.description,
      logoUrl: data.logoUrl,
      website: data.website,
      industry: data.industry,
      location: data.location,
      isHiring: data.isHiring,
      createdById: data.createdById,
    });
  }
}

export const companyService = new CompanyService();
