import { prisma } from './config/db';

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
  } catch (error: any) {
    console.error('❌ Failed to activate user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

activate();
