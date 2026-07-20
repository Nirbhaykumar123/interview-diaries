const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables from .env

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/interview_diaries';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const COMPANIES = [
  {
    name: 'Google',
    slug: 'google',
    description: 'Google LLC is an American multinational technology company specializing in online advertising, search engine technology, cloud computing, computer software, quantum computing, and artificial intelligence.',
    website: 'https://google.com',
    industry: 'Technology',
    location: 'Mountain View, CA',
    isHiring: true,
    interviewCount: 0,
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    description: 'Microsoft Corporation is an American multinational technology systems enterprise that produces computer software, consumer electronics, personal computers, and cloud systems.',
    website: 'https://microsoft.com',
    industry: 'Technology',
    location: 'Redmond, WA',
    isHiring: false,
    interviewCount: 0,
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    description: 'Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.',
    website: 'https://amazon.com',
    industry: 'E-Commerce',
    location: 'Seattle, WA',
    isHiring: true,
    interviewCount: 0,
  },
  {
    name: 'Meta',
    slug: 'meta',
    description: 'Meta Platforms, Inc., doing business as Meta, is an American multinational technology conglomerate based in Menlo Park, California. The company owns Facebook, Instagram, and WhatsApp.',
    website: 'https://meta.com',
    industry: 'Technology',
    location: 'Menlo Park, CA',
    isHiring: true,
    interviewCount: 0,
  },
  {
    name: 'Netflix',
    slug: 'netflix',
    description: 'Netflix, Inc. is an American media company based in Los Gatos, California. The company provides subscription-based video on demand streaming services and content production.',
    website: 'https://netflix.com',
    industry: 'Entertainment',
    location: 'Los Gatos, CA',
    isHiring: false,
    interviewCount: 0,
  },
  {
    name: 'Stripe',
    slug: 'stripe',
    description: 'Stripe, Inc. is a financial services and software-as-a-service company dual-headquartered in South San Francisco, California and Dublin, Ireland. The company primarily offers payment processing software.',
    website: 'https://stripe.com',
    industry: 'Finance',
    location: 'San Francisco, CA',
    isHiring: true,
    interviewCount: 0,
  },
  {
    name: 'Adobe',
    slug: 'adobe',
    description: 'Adobe Inc. is an American multinational computer software company incorporated in Delaware and headquartered in San Jose, California. It has historically specialized in software for creation.',
    website: 'https://adobe.com',
    industry: 'Technology',
    location: 'San Jose, CA',
    isHiring: false,
    interviewCount: 0,
  },
];

async function main() {
  console.log('Seeding mock companies into database...');

  for (const company of COMPANIES) {
    await prisma.company.upsert({
      where: { slug: company.slug },
      update: company,
      create: company,
    });
  }

  console.log('Successfully seeded database with mock companies! 🎉');
}

main()
  .catch((e) => {
    console.error('Error running seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // close pg connection pool
  });
