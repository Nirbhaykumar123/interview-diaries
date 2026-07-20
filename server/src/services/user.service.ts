import { userRepository } from '../repositories/user.repository';
import { NotFoundError, ForbiddenError, BadRequestError, UnauthorizedError } from '../utils/errors';
import bcrypt from 'bcrypt';
import { uploadService } from './upload.service';

export interface UpdateProfileInput {
  fullName?: string;
  college?: string;
  branch?: string;
  graduationYear?: number;
  bio?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  currentCompany?: string;
  currentRole?: string;
  skills?: string[];
  isPrivate?: boolean;
}

export class UserService {
  /**
   * Fetch current user profile metadata.
   */
  async getMe(userId: string) {
    const user = await userRepository.findByIdWithProfile(userId);
    if (!user) {
      throw new NotFoundError('User account not found');
    }
    return user;
  }

  /**
   * Update student profile fields. Splits parameters for transactions.
   */
  async updateMe(userId: string, input: UpdateProfileInput) {
    // 1. Get original user record to confirm existence
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    // 2. Separate user fields from profile fields
    const userData: any = {};
    if (input.fullName !== undefined) userData.fullName = input.fullName.trim();
    if (input.college !== undefined) userData.college = input.college.trim() || null;
    if (input.branch !== undefined) userData.branch = input.branch.trim() || null;
    if (input.graduationYear !== undefined) userData.graduationYear = input.graduationYear;

    const profileData: any = {};
    if (input.bio !== undefined) profileData.bio = input.bio.trim() || null;
    if (input.avatarUrl !== undefined) profileData.avatarUrl = input.avatarUrl.trim() || null;
    if (input.linkedinUrl !== undefined) profileData.linkedinUrl = input.linkedinUrl.trim() || null;
    if (input.githubUrl !== undefined) profileData.githubUrl = input.githubUrl.trim() || null;
    if (input.portfolioUrl !== undefined) profileData.portfolioUrl = input.portfolioUrl.trim() || null;
    if (input.currentCompany !== undefined) profileData.currentCompany = input.currentCompany.trim() || null;
    if (input.currentRole !== undefined) profileData.currentRole = input.currentRole.trim() || null;
    if (input.skills !== undefined) profileData.skills = input.skills;
    if (input.isPrivate !== undefined) profileData.isPrivate = input.isPrivate;

    return userRepository.updateUserAndProfile(userId, userData, profileData);
  }

  /**
   * Fetch user bookmarks feed
   */
  async getBookmarks(userId: string) {
    return userRepository.getBookmarks(userId);
  }

  /**
   * Fetch user dashboard statistics
   */
  async getStats(userId: string) {
    return userRepository.getStats(userId);
  }

  /**
   * Public profile search lookup
   */
  async getPublicProfile(username: string) {
    const user = await userRepository.findByUsernameWithProfile(username.toLowerCase());
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    // If student marked profile as private, block public access
    if (user.profile?.isPrivate) {
      throw new ForbiddenError('This student profile is set to private');
    }

    return {
      username: user.username,
      fullName: user.fullName,
      college: user.college,
      branch: user.branch,
      graduationYear: user.graduationYear,
      profile: {
        bio: user.profile?.bio,
        avatarUrl: user.profile?.avatarUrl,
        linkedinUrl: user.profile?.linkedinUrl,
        githubUrl: user.profile?.githubUrl,
        portfolioUrl: user.profile?.portfolioUrl,
        currentCompany: user.profile?.currentCompany,
        currentRole: user.profile?.currentRole,
        skills: user.profile?.skills || [],
      },
    };
  }

  /**
   * Change a user's password after verifying the current password.
   * Security: requires current password — prevents attacks from stolen session tokens.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // 1. Fetch full user including the hashed password
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User account not found');

    // 2. Verify the current password the user typed matches the stored hash
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // 3. Reject if new password is the same as the current one
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      throw new BadRequestError('New password must be different from the current password');
    }

    // 4. Hash and persist the new password
    const newHash = await bcrypt.hash(newPassword, 12);
    await userRepository.updatePassword(userId, newHash);
  }

  /**
   * Deactivate a user's account.
   * Sets isActive = false — login attempts will be rejected by the auth service.
   * The account and all its data are preserved in the database.
   */
  async deactivateAccount(userId: string, password: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User account not found');

    // Require password confirmation to prevent accidental deactivations
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Password confirmation failed');
    }

    await userRepository.deactivateUser(userId);
  }

  /**
   * Uploads user avatar photo and returns the public url.
   */
  async updateAvatar(userId: string, localFilePath: string, requestHost: string, protocol: string): Promise<string> {
    const user = await userRepository.findByIdWithProfile(userId);
    if (!user) throw new NotFoundError('User account not found');

    // Upload using service
    const avatarUrl = await uploadService.uploadAvatar(localFilePath, requestHost, protocol);

    // Save url in database
    await userRepository.updateAvatarUrl(userId, avatarUrl);

    return avatarUrl;
  }

  /**
   * Removes current user avatar and resets to null in DB.
   */
  async deleteAvatar(userId: string): Promise<void> {
    const user = await userRepository.findByIdWithProfile(userId);
    if (!user) throw new NotFoundError('User account not found');

    // Reset avatarUrl to null in DB
    await userRepository.updateAvatarUrl(userId, null);
  }
}

export const userService = new UserService();
