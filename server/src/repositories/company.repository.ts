import { prisma } from '../config/db';
import { Company } from '@prisma/client';

export interface FindCompaniesParams {
  skip: number;
  take: number;
  search?: string;
  industry?: string;
  isHiring?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export class CompanyRepository {
  /**
   * Fetch paginated list of companies and the total matching count in a single
   * database transaction to prevent connection overhead and guarantee consistency.
   */
  async findAndCount(params: FindCompaniesParams): Promise<{ companies: Company[]; total: number }> {
    const { skip, take, search, industry, isHiring, sortBy, sortOrder } = params;

    // Build the query where filtering clauses
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (industry) {
      where.industry = { equals: industry, mode: 'insensitive' };
    }

    if (isHiring !== undefined) {
      where.isHiring = isHiring;
    }

    // Execute queries in parallel using Prisma transaction
    const [companies, total] = await prisma.$transaction([
      prisma.company.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.company.count({ where }),
    ]);

    return { companies, total };
  }

  /**
   * Find a single company by its unique UUID.
   */
  async findById(id: string): Promise<Company | null> {
    return prisma.company.findUnique({
      where: { id },
    });
  }

  /**
   * Find a single company by its unique URL slug.
   */
  async findBySlug(slug: string): Promise<Company | null> {
    return prisma.company.findUnique({
      where: { slug },
    });
  }

  /**
   * Retrieve lightweight matching suggestion records for autocomplete dropdowns.
   */
  async findSuggestions(query: string, limit = 5): Promise<Pick<Company, 'id' | 'name' | 'slug' | 'logoUrl'>[]> {
    return prisma.company.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Insert a new company record into the database.
   */
  async createCompany(data: {
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    website?: string;
    industry?: string;
    location?: string;
    isHiring?: boolean;
    createdById?: string;
  }): Promise<Company> {
    return prisma.company.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        website: data.website || null,
        industry: data.industry || null,
        location: data.location || null,
        isHiring: data.isHiring ?? false,
        createdById: data.createdById || null,
      },
    });
  }
}

export const companyRepository = new CompanyRepository();
