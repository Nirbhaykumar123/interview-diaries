import { afterAll, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env.test') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const testPrisma = new PrismaClient({ adapter });

/**
 * Clean up all tables AFTER each test.
 * Using afterEach (not beforeEach) means stale data from a previous crashed run
 * will be cleaned up by the next run's beforeEach.
 *
 * We delete in FK dependency order using individual deleteMany() calls
 * (instead of TRUNCATE ALL) to avoid PostgreSQL deadlock errors when
 * Vitest runs multiple test files in parallel.
 */
afterEach(async () => {
  // Delete in correct FK dependency order (children before parents)
  await testPrisma.auditLog.deleteMany();
  await testPrisma.adminNote.deleteMany();
  await testPrisma.verification.deleteMany();
  await testPrisma.notification.deleteMany();
  await testPrisma.report.deleteMany();
  await testPrisma.bookmark.deleteMany();
  await testPrisma.helpfulVote.deleteMany();
  await testPrisma.comment.deleteMany();
  await testPrisma.round.deleteMany();
  await testPrisma.interview.deleteMany();
  await testPrisma.refreshToken.deleteMany();
  await testPrisma.profile.deleteMany();
  await testPrisma.company.deleteMany();
  await testPrisma.user.deleteMany();
});

afterAll(async () => {
  await testPrisma.$disconnect();
  await pool.end();
});

