const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function activate() {
  try {
    const user = await prisma.user.update({
      where: { email: 'nirbhay_b230468ec@nitc.ac.in' },
      data: {
        isEmailVerified: true,
        status: 'ACTIVE',
        isVerifiedBadge: true
      }
    });
    console.log(`✅ Successfully activated user: ${user.email}`);
  } catch (error) {
    console.error('❌ Failed to activate user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

activate();
