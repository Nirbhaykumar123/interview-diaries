import { prisma } from '../config/db';
import { Verification, VerificationStatus } from '@prisma/client';

export class VerificationRepository {
  /**
   * Find verification by ID.
   */
  async findById(id: string) {
    return prisma.verification.findUnique({
      where: { id },
      include: {
        interview: {
          include: {
            author: { select: { id: true, fullName: true, username: true } },
            company: { select: { name: true } },
          },
        },
      },
    });
  }

  /**
   * Find verification by Interview ID.
   */
  async findByInterviewId(interviewId: string) {
    return prisma.verification.findUnique({
      where: { interviewId },
    });
  }

  /**
   * Create verification request.
   */
  async create(data: {
    interviewId: string;
    evidenceUrl?: string;
    evidenceType?: string;
  }): Promise<Verification> {
    return prisma.verification.create({
      data: {
        interviewId: data.interviewId,
        evidenceUrl: data.evidenceUrl || null,
        evidenceType: data.evidenceType || null,
        status: 'PENDING',
      },
    });
  }

  /**
   * Update verification record status and reviewer contexts.
   */
  async update(
    id: string,
    data: {
      status: VerificationStatus;
      reviewerId?: string;
      rejectionReason?: string | null;
    }
  ): Promise<Verification> {
    return prisma.verification.update({
      where: { id },
      data: {
        status: data.status,
        reviewerId: data.reviewerId !== undefined ? data.reviewerId : undefined,
        rejectionReason: data.rejectionReason !== undefined ? data.rejectionReason : undefined,
      },
    });
  }

  /**
   * Fetch paginated list of verification requests.
   */
  async findMany(params: {
    status?: VerificationStatus;
    page: number;
    limit: number;
  }) {
    const { status, page, limit } = params;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const [verifications, totalCount] = await prisma.$transaction([
      prisma.verification.findMany({
        where: whereClause,
        include: {
          interview: {
            select: {
              id: true,
              role: true,
              type: true,
              year: true,
              overallExperience: true,
              author: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                },
              },
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
          reviewer: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.verification.count({
        where: whereClause,
      }),
    ]);

    return { verifications, totalCount };
  }
}

export const verificationRepository = new VerificationRepository();
