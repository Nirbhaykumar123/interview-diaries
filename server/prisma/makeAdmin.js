const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/interview_diaries';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Promoting all users in local database to ADMIN role...');
  const result = await prisma.user.updateMany({
    data: {
      role: 'ADMIN',
    },
  });
  console.log(`Successfully updated ${result.count} users to ADMIN role! 🎉`);
}

main()
  .catch((e) => {
    console.error('Error promoting users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
