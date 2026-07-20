import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { BadRequestError } from '../utils/errors';

export class UserController {
  /**
   * GET /api/users/me
   * Fetches full profile details for the authenticated user.
   */
  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const user = await userService.getMe(userId);

      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/users/me
   * Updates profile fields.
   */
  updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const result = await userService.updateMe(userId, req.body);

      res.status(200).json({
        status: 'success',
        data: { user: result },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/me/bookmarks
   * Fetches the user's saved diaries.
   */
  getBookmarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const bookmarks = await userService.getBookmarks(userId);

      res.status(200).json({
        status: 'success',
        data: { bookmarks },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/me/stats
   * Fetches aggregated metrics.
   */
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const stats = await userService.getStats(userId);

      res.status(200).json({
        status: 'success',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/profile/:username
   * Fetches public student portfolio view.
   */
  getPublicProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const username = req.params.username as string;
      const user = await userService.getPublicProfile(username);

      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/users/me/password
   * Changes the authenticated user's password.
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const { currentPassword, newPassword } = req.body;
      await userService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/users/me/deactivate
   * Deactivates the authenticated user's account after password confirmation.
   */
  deactivateAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const { password } = req.body;
      await userService.deactivateAccount(userId, password);

      // Clear auth cookies after deactivation
      res.clearCookie('refreshToken', { httpOnly: true, path: '/api/auth/refresh' });

      res.status(200).json({
        status: 'success',
        message: 'Account deactivated. You have been signed out.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/users/me/avatar
   * Uploads and updates profile picture (avatar).
   */
  uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      if (!req.file) {
        throw new BadRequestError('No file uploaded or file format is invalid');
      }

      const avatarUrl = await userService.updateAvatar(
        userId,
        req.file.path,
        req.get('host') || 'localhost:5000',
        req.protocol
      );

      res.status(200).json({
        status: 'success',
        data: { avatarUrl },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/users/me/avatar
   * Removes profile picture (resets to null).
   */
  deleteAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      await userService.deleteAvatar(userId);

      res.status(200).json({
        status: 'success',
        message: 'Profile picture removed successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
