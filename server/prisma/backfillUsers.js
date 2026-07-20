const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/interview_diaries';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Backfilling user data for existing users...');
  
  const result = await prisma.user.updateMany({
    data: {
      college: 'NIT Calicut',
      course: 'BTECH',
      branch: 'CSE',
      graduationYear: 2026,
      isEmailVerified: true, // Verify existing users so they don't get locked out
      status: 'ACTIVE',
      isVerifiedBadge: true
    }
  });

  console.log(`Successfully backfilled ${result.count} users! 🎉`);
}

main()
  .catch((e) => {
    console.error('Error backfilling data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
