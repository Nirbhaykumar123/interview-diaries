import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth.middleware';
import { registerSchema, loginSchema, verifyEmailSchema } from '../validations/auth.validation';

const router = Router();

// POST /api/auth/register - Register new student account
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login - Log in with email & password
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/verify-email - Verify student email verification token
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

// POST /api/auth/refresh - Refresh access token session cookie
router.post('/refresh', authController.refresh);

// POST /api/auth/logout - Revoke refresh token and end session
router.post('/logout', authController.logout);

// GET /api/auth/me - Fetch currently logged-in student metadata
router.get('/me', authenticate, authController.getMe);

export default router;
