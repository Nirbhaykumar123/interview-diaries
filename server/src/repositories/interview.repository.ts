import { prisma } from '../config/db';
import { Interview, Round, Prisma } from '@prisma/client';

export interface FindInterviewsParams {
  skip: number;
  take: number;
  search?: string;
  companyId?: string;
  type?: 'INTERNSHIP' | 'PLACEMENT';
  degree?: 'BTECH' | 'MTECH';
  branch?: string;
  outcome?: 'SELECTED' | 'REJECTED' | 'PENDING';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export class InterviewRepository {
  /**
   * Insert a new interview experience and its chronological rounds.
   * Increments the company's interviewCount within a single ACID transaction.
   */
  async create(
    interviewData: Prisma.InterviewUncheckedCreateInput,
    roundsData: Omit<Prisma.RoundUncheckedCreateInput, 'interviewId'>[]
  ): Promise<Interview & { rounds: Round[] }> {
    return prisma.$transaction(async (tx) => {
      // 1. Create the Interview post
      const interview = await tx.interview.create({
        data: interviewData,
      });

      // 2. Create the child Rounds
      const rounds = await Promise.all(
        roundsData.map((round) =>
          tx.round.create({
            data: {
              ...round,
              interviewId: interview.id,
            },
          })
        )
      );

      // 3. If published, increment denormalized interviewCount on the associated Company
      if (interview.status === 'PUBLISHED') {
        await tx.company.update({
          where: { id: interview.companyId },
          data: {
            interviewCount: { increment: 1 },
          },
        });
      }

      return { ...interview, rounds };
    });
  }

  /**
   * Fetch paginated list of published & non-deleted interviews matching search filters.
   */
  async findAndCount(params: FindInterviewsParams): Promise<{ interviews: (Interview & { company: { name: string; logoUrl: string | null } })[]; total: number }> {
    const { skip, take, search, companyId, type, degree, branch, outcome, difficulty, sortBy, sortOrder } = params;

    // Enforce public viewing limits
    const where: Prisma.InterviewWhereInput = {
      isDeleted: false,
      status: 'PUBLISHED',
    };

    if (companyId) {
      where.companyId = companyId;
    }

    if (type) {
      where.type = type;
    }

    if (degree) {
      where.degree = degree;
    }

    if (branch) {
      where.branch = { contains: branch, mode: 'insensitive' };
    }

    if (outcome) {
      where.outcome = outcome;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (search) {
      where.OR = [
        { role: { contains: search, mode: 'insensitive' } },
        { overallExperience: { contains: search, mode: 'insensitive' } },
        {
          rounds: {
            some: {
              questionsAsked: {
                hasSome: [search],
              },
            },
          },
        },
      ];
    }

    const [interviews, total] = await prisma.$transaction([
      prisma.interview.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          company: {
            select: {
              name: true,
              logoUrl: true,
            },
          },
        },
      }),
      prisma.interview.count({ where }),
    ]);

    return { interviews, total };
  }

  /**
   * Retrieve a detailed view of a single interview, with nested rounds and company.
   */
  async findById(id: string) {
    return prisma.interview.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        rounds: {
          orderBy: {
            roundNumber: 'asc',
          },
        },
        verification: true,
        company: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        author: {
          select: {
            id: true,
            fullName: true,
            course: true,
            branch: true,
            graduationYear: true,
            isVerifiedBadge: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Retrieve all posts written by a specific student.
   */
  async findByUser(userId: string): Promise<Interview[]> {
    return prisma.interview.findMany({
      where: {
        authorId: userId,
        isDeleted: false,
      },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update an existing interview experience.
   * Handles nested rounds recreation inside a transaction.
   */
  async update(
    id: string,
    interviewData: Prisma.InterviewUncheckedUpdateInput,
    roundsData?: Omit<Prisma.RoundUncheckedCreateInput, 'interviewId'>[]
  ): Promise<Interview & { rounds: Round[] }> {
    return prisma.$transaction(async (tx) => {
      // 1. Get original post to compare status transitions
      const original = await tx.interview.findUnique({
        where: { id },
        select: { status: true, companyId: true },
      });

      if (!original) {
        throw new Error('Interview not found');
      }

      // 2. Perform main updates
      const interview = await tx.interview.update({
        where: { id },
        data: interviewData,
      });

      // 3. Recreate rounds if provided (delete-then-reinsert ensures clean history)
      if (roundsData) {
        await tx.round.deleteMany({
          where: { interviewId: id },
        });

        await Promise.all(
          roundsData.map((round) =>
            tx.round.create({
              data: {
                ...round,
                interviewId: id,
              },
            })
          )
        );
      }

      // Fetch fresh rounds list
      const rounds = await tx.round.findMany({
        where: { interviewId: id },
        orderBy: { roundNumber: 'asc' },
      });

      // 4. Handle company interviewCount adjustments on publish transitions
      if (original.status === 'DRAFT' && interview.status === 'PUBLISHED') {
        await tx.company.update({
          where: { id: interview.companyId },
          data: { interviewCount: { increment: 1 } },
        });
      } else if (original.status === 'PUBLISHED' && interview.status === 'DRAFT') {
        await tx.company.update({
          where: { id: interview.companyId },
          data: { interviewCount: { decrement: 1 } },
        });
      }

      return { ...interview, rounds };
    });
  }

  /**
   * Soft delete an interview record and decrements the company counter.
   */
  async softDelete(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const interview = await tx.interview.findUnique({
        where: { id },
        select: { status: true, companyId: true, isDeleted: true },
      });

      if (!interview || interview.isDeleted) return;

      // Soft delete interview
      await tx.interview.update({
        where: { id },
        data: { isDeleted: true },
      });

      // If it was published, decrement the company's counter
      if (interview.status === 'PUBLISHED') {
        await tx.company.update({
          where: { id: interview.companyId },
          data: {
            interviewCount: { decrement: 1 },
          },
        });
      }
    });
  }

  /**
   * Increments the view count of an interview diary.
   */
  async incrementViewCount(id: string): Promise<void> {
    await prisma.interview.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    });
  }

  /**
   * Fetch top recommended/related interviews excluding the current one.
   * Matches by same company or same job role title.
   */
  async getRelatedInterviews(id: string, companyId: string, role: string, limit = 3): Promise<(Interview & { company: { name: string; logoUrl: string | null } })[]> {
    return prisma.interview.findMany({
      where: {
        id: { not: id },
        isDeleted: false,
        status: 'PUBLISHED',
        OR: [
          { companyId },
          { role: { contains: role, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: [
        { createdAt: 'desc' },
      ],
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
      },
    });
  }
}

export const interviewRepository = new InterviewRepository();
