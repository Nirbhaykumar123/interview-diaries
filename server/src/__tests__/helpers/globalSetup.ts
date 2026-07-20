/**
 * Global Test Setup — runs ONCE before all test suites start.
 *
 * WHY A SEPARATE FILE?
 * Vitest's `globalSetup` runs in a different process than the test files.
 * It's the correct place to:
 *   - Set the NODE_ENV to 'test'
 *   - Verify the test database exists and is reachable
 *   - Run any one-time setup (migrations, seed fixtures)
 *
 * NEVER put per-test cleanup here (use setupFiles for that).
 */

import { execSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

export async function setup() {
  // 1. Load test-specific environment variables
  dotenv.config({ path: path.join(__dirname, '../../../.env.test') });

  // Ensure we are always running against the test DB
  if (!process.env.DATABASE_URL?.includes('_test')) {
    throw new Error(
      '⛔ Safety guard: DATABASE_URL must point to a "_test" database during tests.\n' +
      'Set DATABASE_URL in .env.test to postgresql://...../interview_diaries_test'
    );
  }

  const envPath = path.join(__dirname, '../../../.env');
  const envTestPath = path.join(__dirname, '../../../.env.test');
  
  let backupEnv: Buffer | null = null;
  if (fs.existsSync(envPath)) {
    backupEnv = fs.readFileSync(envPath);
  }

  try {
    // Copy test env to main env for prisma to pick it up during db push
    fs.copyFileSync(envTestPath, envPath);

    console.log('🧪 Syncing Prisma schema against test database...');

    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../../../'),
    });

    console.log('✅ Test database schema synced.');
  } finally {
    // Restore dev env backup
    if (backupEnv) {
      fs.writeFileSync(envPath, backupEnv);
    } else if (fs.existsSync(envPath)) {
      fs.unlinkSync(envPath);
    }
  }
}

export async function teardown() {
  console.log('🧹 Global test teardown complete.');
}
