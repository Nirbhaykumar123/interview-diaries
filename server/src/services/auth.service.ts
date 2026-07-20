import { userRepository } from '../repositories/user.repository';
import { tokenRepository } from '../repositories/token.repository';
import { hashPassword, comparePassword } from '../utils/crypto';
import { generateAccessToken, generateRefreshTokenString, hashTokenString } from '../utils/tokens';
import { ConflictError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import { RegisterInput, UserResponse } from '../types/auth.types';
import { User } from '@prisma/client';
import { prisma } from '../config/db';
import crypto from 'crypto';

export class AuthService {
  /**
   * Helper to strip password hashes and return a safe UserResponse DTO
   */
  public mapToUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      college: user.college,
      course: user.course || 'BTECH',
      branch: user.branch || '',
      graduationYear: user.graduationYear,
      role: user.role.toString(),
      createdAt: user.createdAt,
    };
  }

  /**
   * Handles user registration business logic and verification token creation.
   */
  async register(input: RegisterInput): Promise<UserResponse> {
    // 1. Duplicate checks
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError('Email is already registered');
    }

    const existingUsername = await userRepository.findByUsername(input.username);
    if (existingUsername) {
      throw new ConflictError('Username is already taken');
    }

    // 2. Hash password with bcrypt
    const passwordHash = await hashPassword(input.password);

    // 3. Generate verification token and expiry
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpiresAt = new Date();
    emailVerificationTokenExpiresAt.setHours(emailVerificationTokenExpiresAt.getHours() + 24); // 24h validity

    // 4. Create user inside transactional boundary
    const user = await userRepository.createUser({
      email: input.email,
      username: input.username,
      passwordHash,
      fullName: input.fullName,
      course: input.course,
      branch: input.branch,
      graduationYear: input.graduationYear,
      emailVerificationToken,
      emailVerificationTokenExpiresAt,
    });

    // 5. Log verification link to the console for local testing
    const verificationUrl = `http://localhost:5173/verify-email?token=${emailVerificationToken}`;
    console.log('\n--- [NITC EMAIL VERIFICATION LINK] ---');
    console.log(`To: ${user.email}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('--------------------------------------\n');

    return this.mapToUserResponse(user);
  }

  /**
   * Authenticate user credentials, generate tokens, and log session.
   */
  async login(
    email: string,
    password: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ accessToken: string; refreshToken: string; user: UserResponse }> {
    // 1. Find user by email (or username fallback if we wanted to, but schema validated as email)
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.isSuspended || user.status === 'SUSPENDED') {
      throw new ForbiddenError(`Your account has been suspended. Reason: ${user.suspensionReason || 'Community guidelines violation'}`);
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new ForbiddenError('Please verify your email address before logging in.');
    }

    // 2. Compare password hashes
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 3. Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshTokenString();
    const tokenHash = hashTokenString(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await tokenRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      user: this.mapToUserResponse(user),
    };
  }

  /**
   * Refreshes access tokens using valid long-lived refresh tokens.
   */
  async refresh(
    refreshTokenString: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ accessToken: string; refreshToken: string; user: UserResponse }> {
    const tokenHash = hashTokenString(refreshTokenString);
    const tokenRecord = await tokenRepository.findByHash(tokenHash);

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token is invalid or expired');
    }

    const user = await userRepository.findById(tokenRecord.userId);
    if (!user) {
      throw new UnauthorizedError('User associated with session not found');
    }

    if (user.isSuspended || user.status === 'SUSPENDED') {
      throw new ForbiddenError(`Your account has been suspended. Reason: ${user.suspensionReason || 'Community guidelines violation'}`);
    }

    // Revoke old refresh token (one-time use for maximum security)
    await tokenRepository.revokeToken(tokenHash);

    // Generate new pairs
    const accessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshTokenString();
    const newHash = hashTokenString(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await tokenRepository.createRefreshToken({
      userId: user.id,
      tokenHash: newHash,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: this.mapToUserResponse(user),
    };
  }

  /**
   * Revoke a refresh token to end a session (logout).
   */
  async logout(refreshTokenString: string): Promise<void> {
    const tokenHash = hashTokenString(refreshTokenString);
    await tokenRepository.revokeToken(tokenHash);
  }

  /**
   * Verifies the email token and activates the student account.
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid verification token');
    }

    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new UnauthorizedError('Verification token has expired');
    }

    // Activate the user's account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
        status: 'ACTIVE',
        isVerifiedBadge: true,
      },
    });
  }
}

export const authService = new AuthService();
