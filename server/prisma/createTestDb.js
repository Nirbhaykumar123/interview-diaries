/**
 * Database setup script for the test environment.
 * Run this once before running the test suite for the first time.
 *
 * Usage:
 *   node prisma/createTestDb.js
 *
 * This creates the 'interview_diaries_test' database if it doesn't exist,
 * then applies all Prisma migrations to it.
 */

const { Client } = require('pg');
const { execSync } = require('child_process');

async function main() {
  // Connect to postgres default DB to create the test DB
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgrespassword',
    database: 'postgres', // connect to default DB first
  });

  try {
    await client.connect();

    // Check if test DB exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = 'interview_diaries_test'`
    );

    if (result.rowCount === 0) {
      await client.query('CREATE DATABASE interview_diaries_test');
      console.log('✅ Created database: interview_diaries_test');
    } else {
      console.log('ℹ️  Database already exists: interview_diaries_test');
    }
  } finally {
    await client.end();
  }

  // Apply migrations to the test database
  console.log('🔄 Applying migrations to test database...');
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: 'postgresql://postgres:postgrespassword@localhost:5432/interview_diaries_test?schema=public',
    },
    stdio: 'inherit',
  });

  console.log('✅ Test database is ready!');
}

main().catch((err) => {
  console.error('❌ Failed to set up test database:', err);
  process.exit(1);
});
