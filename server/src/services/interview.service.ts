import { interviewRepository } from '../repositories/interview.repository';
import { companyRepository } from '../repositories/company.repository';
import { Interview, Round } from '@prisma/client';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

export interface CreateInterviewInput {
  companyId: string;
  role: string;
  type: 'INTERNSHIP' | 'PLACEMENT';
  degree: 'BTECH' | 'MTECH';
  branch: string;
  cgpa: number;
  academicYear: string;
  placementBatch: number;
  campusDriveDate?: string;
  ctc?: number;
  stipend?: number;
  outcome: 'SELECTED' | 'REJECTED' | 'PENDING';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  oaPlatform?: string;
  eligibility?: string;
  overallExperience: string;
  tips?: string;
  status: 'DRAFT' | 'PUBLISHED';
  rounds: {
    roundNumber: number;
    roundType: 'ONLINE_TEST' | 'TECHNICAL' | 'HR' | 'MANAGERIAL' | 'GROUP_DISCUSSION' | 'OTHER';
    description: string;
    questionsAsked: string[];
    durationMinutes?: number;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  }[];
}

export interface UpdateInterviewInput extends Partial<CreateInterviewInput> {}

export class InterviewService {
  /**
   * Create a new interview experience diary.
   */
  async createInterview(authorId: string, input: CreateInterviewInput): Promise<Interview & { rounds: Round[] }> {
    // 1. Verify that the referenced company exists in the database
    const company = await companyRepository.findById(input.companyId);
    if (!company) {
      throw new NotFoundError('Selected company profile does not exist');
    }

    // 2. Map and validate round numbers (e.g. check for duplicates)
    const roundNumbers = input.rounds.map((r) => r.roundNumber);
    const uniqueRounds = new Set(roundNumbers);
    if (uniqueRounds.size !== roundNumbers.length) {
      throw new BadRequestError('Round numbers must be unique');
    }

    // 3. Assemble variables
    const interviewData: any = {
      authorId,
      companyId: input.companyId,
      role: input.role.trim(),
      type: input.type,
      degree: input.degree,
      branch: input.branch.trim().toUpperCase(),
      cgpa: input.cgpa,
      academicYear: input.academicYear.trim(),
      placementBatch: input.placementBatch,
      campusDriveDate: input.campusDriveDate ? new Date(input.campusDriveDate) : null,
      ctc: input.ctc ?? null,
      stipend: input.stipend ?? null,
      outcome: input.outcome,
      difficulty: input.difficulty,
      oaPlatform: input.oaPlatform?.trim() || null,
      eligibility: input.eligibility?.trim() || null,
      overallExperience: input.overallExperience.trim(),
      tips: input.tips?.trim() || null,
      status: input.status,
      publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
    };

    return interviewRepository.create(interviewData, input.rounds);
  }

  /**
   * Retrieves paginated lists matching queries
   */
  async getInterviews(query: {
    page?: number;
    limit?: number;
    search?: string;
    companyId?: string;
    type?: 'INTERNSHIP' | 'PLACEMENT';
    degree?: 'BTECH' | 'MTECH';
    branch?: string;
    outcome?: 'SELECTED' | 'REJECTED' | 'PENDING';
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const allowedSortBy = ['createdAt', 'helpfulCount', 'viewCount'];
    const sortBy = allowedSortBy.includes(query.sortBy || '') ? query.sortBy! : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const { interviews, total } = await interviewRepository.findAndCount({
      skip,
      take: limit,
      search: query.search,
      companyId: query.companyId,
      type: query.type,
      degree: query.degree,
      branch: query.branch,
      outcome: query.outcome,
      difficulty: query.difficulty,
      sortBy,
      sortOrder,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      interviews,
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
   * Retrieves detail rows. Allows draft viewing only for author or admin.
   */
  async getInterviewById(id: string, currentUserId?: string, currentUserRole?: string): Promise<any> {
    const interview = await interviewRepository.findById(id);
    if (!interview) {
      throw new NotFoundError('Interview diary not found');
    }

    // Auth gating: If post is draft, ensure viewer owns it or holds admin keys
    if (interview.status === 'DRAFT') {
      const isOwner = currentUserId && interview.authorId === currentUserId;
      const isAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'MODERATOR';

      if (!isOwner && !isAdmin) {
        throw new ForbiddenError('You are not authorized to view this draft experience');
      }
    }

    // Map database author fields to safe public profile shape
    const { author, ...rest } = interview as any;
    let mappedAuthor = null;
    if (author) {
      mappedAuthor = {
        id: author.id,
        fullName: author.fullName,
        avatar: author.profile?.avatarUrl || null,
        branch: author.branch,
        degree: author.course,
        graduationYear: author.graduationYear,
        isVerified: author.isVerifiedBadge,
      };
    }

    return {
      ...rest,
      author: mappedAuthor,
    };
  }

  /**
   * Retrieve all posts written by the logged-in student.
   */
  async getMyInterviews(userId: string): Promise<Interview[]> {
    return interviewRepository.findByUser(userId);
  }

  /**
   * Update an existing interview experience. Checks ownership.
   */
  async updateInterview(
    id: string,
    userId: string,
    userRole: string,
    input: UpdateInterviewInput
  ): Promise<Interview & { rounds: Round[] }> {
    // 1. Load original record
    const original = await interviewRepository.findById(id);
    if (!original) {
      throw new NotFoundError('Interview diary not found');
    }

    // 2. RBAC check: only author or Admin can edit
    const isAuthor = original.authorId === userId;
    const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
    if (!isAuthor && !isAdmin) {
      throw new ForbiddenError('You do not have permission to modify this experience');
    }

    // 3. Assemble variables
    const interviewData: any = {};
    if (input.companyId) {
      const company = await companyRepository.findById(input.companyId);
      if (!company) throw new NotFoundError('Company not found');
      interviewData.companyId = input.companyId;
    }
    if (input.role) interviewData.role = input.role.trim();
    if (input.type) interviewData.type = input.type;
    if (input.degree) interviewData.degree = input.degree;
    if (input.branch) interviewData.branch = input.branch.trim().toUpperCase();
    if (input.cgpa !== undefined) interviewData.cgpa = input.cgpa;
    if (input.academicYear) interviewData.academicYear = input.academicYear.trim();
    if (input.placementBatch) interviewData.placementBatch = input.placementBatch;
    if (input.campusDriveDate !== undefined) interviewData.campusDriveDate = input.campusDriveDate ? new Date(input.campusDriveDate) : null;
    if (input.ctc !== undefined) interviewData.ctc = input.ctc;
    if (input.stipend !== undefined) interviewData.stipend = input.stipend;
    if (input.outcome) interviewData.outcome = input.outcome;
    if (input.difficulty) interviewData.difficulty = input.difficulty;
    if (input.oaPlatform !== undefined) interviewData.oaPlatform = input.oaPlatform?.trim() || null;
    if (input.eligibility !== undefined) interviewData.eligibility = input.eligibility?.trim() || null;
    if (input.overallExperience) interviewData.overallExperience = input.overallExperience.trim();
    if (input.tips !== undefined) interviewData.tips = input.tips?.trim() || null;
    
    if (input.status) {
      interviewData.status = input.status;
      if (input.status === 'PUBLISHED' && original.status === 'DRAFT') {
        interviewData.publishedAt = new Date();
      }
    }

    // 4. Validate rounds unique roundNumber mapping if provided
    if (input.rounds) {
      const roundNumbers = input.rounds.map((r) => r.roundNumber);
      const uniqueRounds = new Set(roundNumbers);
      if (uniqueRounds.size !== roundNumbers.length) {
        throw new BadRequestError('Round numbers must be unique');
      }
    }

    return interviewRepository.update(id, interviewData, input.rounds);
  }

  /**
   * Delete an experience. Checks ownership.
   */
  async deleteInterview(id: string, userId: string, userRole: string): Promise<void> {
    const interview = await interviewRepository.findById(id);
    if (!interview) {
      throw new NotFoundError('Interview diary not found');
    }

    const isAuthor = interview.authorId === userId;
    const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';
    if (!isAuthor && !isAdmin) {
      throw new ForbiddenError('You do not have permission to delete this experience');
    }

    await interviewRepository.softDelete(id);
  }

  /**
   * Fetch recommended/related interviews matching company or role.
   */
  async getRelatedInterviews(id: string): Promise<(Interview & { company: { name: string; logoUrl: string | null } })[]> {
    const interview = await interviewRepository.findById(id);
    if (!interview) {
      throw new NotFoundError('Interview diary not found');
    }

    return interviewRepository.getRelatedInterviews(id, interview.companyId, interview.role);
  }
}

export const interviewService = new InterviewService();
