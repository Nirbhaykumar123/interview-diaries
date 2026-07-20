/**
 * Test Data Factories
 *
 * WHY FACTORIES?
 * Repeating { email: 'test@example.com', password: 'Secure123!', fullName: '...' }
 * in 30 different test files creates massive duplication and brittle tests.
 *
 * Factories produce valid test objects with sensible defaults.
 * Tests only override the fields they care about:
 *
 *   const user = await createUser();                     // all defaults
 *   const admin = await createUser({ role: 'ADMIN' });  // override just role
 *
 * This keeps tests focused and readable.
 */

import { testPrisma } from './setup';
import { hashPassword } from '@/utils/crypto';
import { generateAccessToken } from '@/utils/tokens';

let userCounter = 0;

/**
 * Create a user record directly in the test database.
 * Returns the full user object including its generated UUID.
 */
export async function createUser(overrides: {
  email?: string;
  username?: string;
  password?: string;
  fullName?: string;
  role?: 'USER' | 'ADMIN' | 'MODERATOR';
  isSuspended?: boolean;
} = {}) {
  const counter = ++userCounter;
  const {
    email = `testuser_${Date.now()}_${counter}@example.com`,
    username = `testuser_${Date.now()}_${counter}`,
    password = 'Secure123!',
    fullName = 'Test User',
    role = 'USER',
    isSuspended = false,
  } = overrides;

  const passwordHash = await hashPassword(password);

  const user = await testPrisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      fullName,
      role,
      isSuspended,
      course: 'BTECH',
      branch: 'CSE',
      graduationYear: 2026,
      isEmailVerified: true,
      profile: { create: {} }, // Every user gets a blank profile
    },
    include: { profile: true },
  });

  return user;
}

/**
 * Generate a valid Bearer token for a given user.
 * Use this to authenticate test API requests without going through login.
 */
export function generateTokenForUser(userId: string, role: string): string {
  return generateAccessToken(userId, role);
}

/**
 * Create a company record in the test database.
 */
export async function createCompany(overrides: {
  name?: string;
  slug?: string;
  industry?: string;
} = {}) {
  const uniqueSuffix = Date.now();
  const {
    name = `Test Company ${uniqueSuffix}`,
    slug = `test-company-${uniqueSuffix}`,
    industry = 'Technology',
  } = overrides;

  return testPrisma.company.create({
    data: { name, slug, industry },
  });
}

/**
 * Create a full published interview with one round.
 */
export async function createInterview(
  authorId: string,
  companyId: string,
  overrides: {
    status?: 'DRAFT' | 'PUBLISHED';
    role?: string;
  } = {}
) {
  const { status = 'PUBLISHED', role = 'Software Engineer' } = overrides;

  return testPrisma.interview.create({
    data: {
      authorId,
      companyId,
      role,
      type: 'PLACEMENT',
      degree: 'BTECH',
      branch: 'CSE',
      cgpa: 8.5,
      academicYear: '2025-2026',
      placementBatch: 2026,
      outcome: 'SELECTED',
      difficulty: 'MEDIUM',
      overallExperience: 'Great experience overall. Well structured rounds.',
      status,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      rounds: {
        create: [
          {
            roundNumber: 1,
            roundType: 'TECHNICAL',
            description: 'Data structures and algorithms round.',
            questionsAsked: ['Reverse a linked list', 'Binary search'],
          },
        ],
      },
    },
    include: { rounds: true },
  });
}

/**
 * Create a verification request for an interview.
 */
export async function createVerification(
  interviewId: string,
  overrides: {
    status?: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  } = {}
) {
  const { status = 'PENDING' } = overrides;

  return testPrisma.verification.create({
    data: {
      interviewId,
      status,
      evidenceUrl: 'https://example.com/offer_letter.pdf',
      evidenceType: 'OFFER_LETTER',
    },
  });
}
