import { prisma } from '../config/db';
import { User } from '@prisma/client';
import { CreateUserInput } from '../types/auth.types';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdWithProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
  }

  async findByUsernameWithProfile(username: string) {
    return prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
      },
    });
  }

  async createUser(input: CreateUserInput): Promise<User> {
    // Run creation inside an atomic Prisma transaction to guarantee both
    // User and Profile are created successfully or rolled back completely.
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          username: input.username,
          passwordHash: input.passwordHash,
          fullName: input.fullName,
          college: input.college || 'NIT Calicut',
          course: input.course,
          branch: input.branch,
          graduationYear: input.graduationYear,
          emailVerificationToken: input.emailVerificationToken,
          emailVerificationTokenExpiresAt: input.emailVerificationTokenExpiresAt,
        },
      });

      // Automatically initialize an empty profile for the newly registered user.
      await tx.profile.create({
        data: {
          userId: user.id,
        },
      });

      return user;
    });
  }

  async updateUserAndProfile(
    userId: string,
    userData: any,
    profileData: any
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Update user fields
      const user = await tx.user.update({
        where: { id: userId },
        data: userData,
      });

      // 2. Update profile fields
      const profile = await tx.profile.update({
        where: { userId },
        data: profileData,
      });

      return { ...user, profile };
    });
  }

  async getBookmarks(userId: string) {
    const bookmarkRecords = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        interview: {
          include: {
            company: {
              select: {
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Strip bookmark envelopes and return flat interview objects
    return bookmarkRecords
      .filter((b) => b.interview && !b.interview.isDeleted)
      .map((b) => b.interview);
  }

  async getStats(userId: string) {
    const [totalInterviews, offersReceived, bookmarksCount, interviews] = await prisma.$transaction([
      prisma.interview.count({
        where: { authorId: userId, isDeleted: false },
      }),
      prisma.interview.count({
        where: { authorId: userId, outcome: 'SELECTED', isDeleted: false },
      }),
      prisma.bookmark.count({
        where: { userId },
      }),
      prisma.interview.findMany({
        where: { authorId: userId, isDeleted: false },
        select: { helpfulCount: true },
      }),
    ]);

    const helpfulVotesReceived = interviews.reduce((sum, item) => sum + item.helpfulCount, 0);

    // Profile completeness calculation
    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    let profileCompletion = 0;
    if (userWithProfile) {
      if (userWithProfile.fullName) profileCompletion += 10;
      if (userWithProfile.college) profileCompletion += 15;
      if (userWithProfile.branch) profileCompletion += 15;
      if (userWithProfile.graduationYear) profileCompletion += 10;
      
      const profile = userWithProfile.profile;
      if (profile) {
        if (profile.bio) profileCompletion += 20;
        if (profile.avatarUrl) profileCompletion += 10;
        if (profile.linkedinUrl || profile.githubUrl) profileCompletion += 10;
        if (profile.skills.length > 0) profileCompletion += 10;
      }
    }

    return {
      totalInterviews,
      offersReceived,
      helpfulVotesReceived,
      bookmarksCount,
      profileCompletion,
    };
  }

  async updateAvatarUrl(userId: string, avatarUrl: string | null): Promise<void> {
    await prisma.profile.update({
      where: { userId },
      data: { avatarUrl },
    });
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  async deactivateUser(userId: string): Promise<void> {
    await prisma.$transaction([
      // Mark account as inactive
      prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      }),
      // Revoke all active refresh tokens so existing sessions are terminated
      prisma.refreshToken.deleteMany({
        where: { userId },
      }),
    ]);
  }
}

export const userRepository = new UserRepository();
