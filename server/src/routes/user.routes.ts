import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema, deactivateAccountSchema } from '../validations/user.validation';
import { uploadAvatar as uploadAvatarMiddleware } from '../middleware/upload.middleware';

const router = Router();

// GET /api/users/me - Fetch own authenticated profile
router.get('/me', authenticate, userController.getMe);

// PATCH /api/users/me - Update authenticated user profile fields
router.patch('/me', authenticate, validate(updateProfileSchema), userController.updateMe);

// PATCH /api/users/me/avatar - Upload profile avatar image
router.patch('/me/avatar', authenticate, uploadAvatarMiddleware, userController.uploadAvatar);

// DELETE /api/users/me/avatar - Remove profile avatar image
router.delete('/me/avatar', authenticate, userController.deleteAvatar);

// GET /api/users/me/bookmarks - Fetch saved bookmarks
router.get('/me/bookmarks', authenticate, userController.getBookmarks);

// GET /api/users/me/stats - Fetch dashboard statistics
router.get('/me/stats', authenticate, userController.getStats);

// PATCH /api/users/me/password - Change password (requires current password verification)
router.patch('/me/password', authenticate, validate(changePasswordSchema), userController.changePassword);

// POST /api/users/me/deactivate - Deactivate account (requires password confirmation)
router.post('/me/deactivate', authenticate, validate(deactivateAccountSchema), userController.deactivateAccount);

// GET /api/users/profile/:username - Public student portfolio
router.get('/profile/:username', userController.getPublicProfile);

export default router;
