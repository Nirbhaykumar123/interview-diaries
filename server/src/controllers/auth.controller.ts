import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';

export class AuthController {
  /**
   * Controller for registration. Sends verification email link details.
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await authService.register(req.body);

      let devVerificationUrl: string | undefined;
      if (env.NODE_ENV !== 'production') {
        const dbUser = await userRepository.findByEmail(user.email);
        if (dbUser?.emailVerificationToken) {
          devVerificationUrl = `http://localhost:5173/verify-email?token=${dbUser.emailVerificationToken}`;
        }
      }

      res.status(201).json({
        status: 'success',
        message: 'Account created successfully. Please verify your email before logging in.',
        data: {
          user,
          ...(devVerificationUrl && { _devVerificationUrl: devVerificationUrl }),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller to verify student email token.
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;
      await authService.verifyEmail(token);

      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully! You can now log in.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller for user login. Sets HTTP-Only cookie.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'];
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || undefined;

      const { accessToken, refreshToken, user } = await authService.login(
        email,
        password,
        userAgent,
        ipAddress
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        status: 'success',
        data: { accessToken, user },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller for refreshing user access token.
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        throw new UnauthorizedError('Session cookie is missing');
      }

      const userAgent = req.headers['user-agent'];
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || undefined;

      const { accessToken, refreshToken: newRefreshToken, user } = await authService.refresh(
        refreshToken,
        userAgent,
        ipAddress
      );

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        status: 'success',
        data: { accessToken, user },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller to log user out of session. Clears cookie.
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      res.status(200).json({
        status: 'success',
        message: 'Successfully logged out',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Controller to fetch currently authenticated user metadata.
   */
  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.sub;
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      res.status(200).json({
        status: 'success',
        data: {
          user: authService.mapToUserResponse(user),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
