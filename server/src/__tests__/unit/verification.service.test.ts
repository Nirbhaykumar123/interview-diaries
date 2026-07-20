/**
 * Unit Tests: VerificationService
 *
 * WHY MOCK DEPENDENCIES?
 * The VerificationService has 3 dependencies: verificationRepository, auditLogRepository, prisma.
 * We replace them with vi.fn() mocks so that:
 *   - Tests run instantly (no real DB connection required)
 *   - Tests only verify the SERVICE's own logic (not the repository's SQL)
 *   - We can precisely control what the "database" returns for each scenario
 *
 * WHAT WE'RE TESTING:
 * - requestVerification(): ownership guard, status conflict guards (VERIFIED/PENDING/UNDER_REVIEW)
 * - resolveVerification(): self-verification block, rejection reason requirement
 * - getVerifications(): pagination math
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerificationService } from '@/services/verification.service';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/utils/errors';

// ── Mock all external dependencies ──────────────────────────────────────────

vi.mock('@/repositories/verification.repository', () => ({
  verificationRepository: {
    findByInterviewId: vi.fn(),
    findById: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/repositories/auditLog.repository', () => ({
  auditLogRepository: {
    create: vi.fn(),
  },
}));

vi.mock('@/config/db', () => ({
  prisma: {
    interview: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation((cb) => cb({
      verification: { update: vi.fn() },
      interview: { update: vi.fn() },
    })),
  },
}));

vi.mock('@/services/notification.service', () => ({
  notificationService: {
    createNotification: vi.fn(),
  },
}));

// ── Import after mocks are set up ────────────────────────────────────────────
import { verificationRepository } from '@/repositories/verification.repository';
import { prisma } from '@/config/db';

// ── Test Suite ───────────────────────────────────────────────────────────────

describe('VerificationService.requestVerification()', () => {
  let service: VerificationService;
  const userId = 'user-abc-123';
  const interviewId = 'interview-xyz-456';

  beforeEach(() => {
    service = new VerificationService();
    vi.clearAllMocks();
  });

  it('throws NotFoundError when interview does not exist', async () => {
    vi.mocked(prisma.interview.findUnique).mockResolvedValue(null);

    await expect(
      service.requestVerification(userId, { interviewId })
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError when user is not the interview author', async () => {
    vi.mocked(prisma.interview.findUnique).mockResolvedValue({
      id: interviewId,
      authorId: 'different-user-id', // NOT the requesting user
      status: 'PUBLISHED',
    } as any);

    await expect(
      service.requestVerification(userId, { interviewId })
    ).rejects.toThrow(ForbiddenError);

    await expect(
      service.requestVerification(userId, { interviewId })
    ).rejects.toThrow('You can only submit verification requests for your own posts');
  });

  it('throws BadRequestError when interview is a DRAFT (not published)', async () => {
    vi.mocked(prisma.interview.findUnique).mockResolvedValue({
      id: interviewId,
      authorId: userId,
      status: 'DRAFT', // User must publish first
    } as any);

    await expect(
      service.requestVerification(userId, { interviewId })
    ).rejects.toThrow(BadRequestError);

    await expect(
      service.requestVerification(userId, { interviewId })
    ).rejects.toThrow('Cannot request verification for a draft post');
  });

  it('throws BadRequestError when a PENDING verification already exists', async () => {
    vi.mocked(prisma.interview.findUnique).mockResolvedValue({
      id: interviewId,
      authorId: userId,
      status: 'PUBLISHED',
    } as any);

    vi.mocked(verificationRepository.findByInterviewId).mockResolvedValue({
      id: 'ver-001',
      status: 'PENDING',
    } as any);

    await expect(
      service.requestVerification(userId, { interviewId })
    ).rejects.toThrow('A verification request is already pending review');
  });

  it('throws BadRequestError when the interview is already VERIFIED', async () => {
    vi.mocked(prisma.interview.findUnique).mockResolvedValue({
      id: interviewId,
      authorId: userId,
      status: 'PUBLISHED',
    } as any);

    vi.mocked(verificationRepository.findByInterviewId).mockResolvedValue({
      id: 'ver-001',
      status: 'VERIFIED',
    } as any);

    await expect(
      service.requestVerification(userId, { interviewId })
    ).rejects.toThrow('This experience is already verified');
  });

  it('throws BadRequestError when a request is UNDER_REVIEW', async () => {
    vi.mocked(prisma.interview.findUnique).mockResolvedValue({
      id: interviewId,
      authorId: userId,
      status: 'PUBLISHED',
    } as any);

    vi.mocked(verificationRepository.findByInterviewId).mockResolvedValue({
      id: 'ver-001',
      status: 'UNDER_REVIEW',
    } as any);

    await expect(
      service.requestVerification(userId, { interviewId })
    ).rejects.toThrow('currently under review');
  });

  it('creates a NEW verification when none exists', async () => {
    vi.mocked(prisma.interview.findUnique).mockResolvedValue({
      id: interviewId,
      authorId: userId,
      status: 'PUBLISHED',
    } as any);

    vi.mocked(verificationRepository.findByInterviewId).mockResolvedValue(null);
    vi.mocked(verificationRepository.create).mockResolvedValue({ id: 'new-ver', status: 'PENDING' } as any);

    await service.requestVerification(userId, { interviewId, evidenceUrl: 'https://example.com/doc.pdf' });

    expect(verificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ interviewId, evidenceUrl: 'https://example.com/doc.pdf' })
    );
  });

  it('RE-SUBMITS (updates to PENDING) when previous request was REJECTED', async () => {
    vi.mocked(prisma.interview.findUnique).mockResolvedValue({
      id: interviewId,
      authorId: userId,
      status: 'PUBLISHED',
    } as any);

    vi.mocked(verificationRepository.findByInterviewId).mockResolvedValue({
      id: 'ver-001',
      status: 'REJECTED',
    } as any);

    vi.mocked(verificationRepository.update).mockResolvedValue({ id: 'ver-001', status: 'PENDING' } as any);

    await service.requestVerification(userId, { interviewId });

    expect(verificationRepository.update).toHaveBeenCalledWith('ver-001', {
      status: 'PENDING',
      rejectionReason: null,
    });
  });
});

describe('VerificationService.resolveVerification()', () => {
  let service: VerificationService;
  const reviewerId = 'moderator-id-789';

  beforeEach(() => {
    service = new VerificationService();
    vi.clearAllMocks();
  });

  it('throws NotFoundError when verification record does not exist', async () => {
    vi.mocked(verificationRepository.findById).mockResolvedValue(null);

    await expect(
      service.resolveVerification(reviewerId, 'non-existent-id', { status: 'VERIFIED' })
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError when moderator tries to verify their OWN interview', async () => {
    vi.mocked(verificationRepository.findById).mockResolvedValue({
      id: 'ver-001',
      status: 'PENDING',
      interviewId: 'int-001',
      interview: {
        authorId: reviewerId, // Same as reviewerId — self-verification attempt
        isVerified: false,
      },
    } as any);

    await expect(
      service.resolveVerification(reviewerId, 'ver-001', { status: 'VERIFIED' })
    ).rejects.toThrow(ForbiddenError);

    await expect(
      service.resolveVerification(reviewerId, 'ver-001', { status: 'VERIFIED' })
    ).rejects.toThrow('cannot review or approve your own interview');
  });

  it('throws BadRequestError when rejecting without a rejection reason', async () => {
    vi.mocked(verificationRepository.findById).mockResolvedValue({
      id: 'ver-001',
      status: 'PENDING',
      interviewId: 'int-001',
      interview: {
        authorId: 'different-user', // Not the reviewer
        isVerified: false,
      },
    } as any);

    await expect(
      service.resolveVerification(reviewerId, 'ver-001', {
        status: 'REJECTED',
        rejectionReason: '', // Empty reason
      })
    ).rejects.toThrow('rejection reason');
  });

  it('throws BadRequestError when rejection reason is too short (< 5 chars)', async () => {
    vi.mocked(verificationRepository.findById).mockResolvedValue({
      id: 'ver-001',
      status: 'PENDING',
      interviewId: 'int-001',
      interview: { authorId: 'different-user', isVerified: false },
    } as any);

    await expect(
      service.resolveVerification(reviewerId, 'ver-001', {
        status: 'REJECTED',
        rejectionReason: 'No', // Only 2 chars — too short
      })
    ).rejects.toThrow('minimum 5 characters');
  });
});

describe('VerificationService.getVerifications()', () => {
  let service: VerificationService;

  beforeEach(() => {
    service = new VerificationService();
    vi.clearAllMocks();
  });

  it('calculates pagination metadata correctly', async () => {
    vi.mocked(verificationRepository.findMany).mockResolvedValue({
      verifications: [{ id: 'v1' }, { id: 'v2' }] as any,
      totalCount: 25,
    });

    const result = await service.getVerifications({ page: 2, limit: 10 });

    expect(result.pagination).toMatchObject({
      page: 2,
      limit: 10,
      totalItems: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it('sets hasNextPage to false on the last page', async () => {
    vi.mocked(verificationRepository.findMany).mockResolvedValue({
      verifications: [{ id: 'v1' }] as any,
      totalCount: 10,
    });

    const result = await service.getVerifications({ page: 1, limit: 10 });

    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });
});
