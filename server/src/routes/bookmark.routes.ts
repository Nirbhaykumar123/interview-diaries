import { Router } from 'express';
import { bookmarkController } from '../controllers/bookmark.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { bookmarkParamSchema } from '../validations/bookmark.validation';

const router = Router();

// Secure all routes with authentication middleware
router.use(authenticate);

router.post('/:interviewId', validate(bookmarkParamSchema), bookmarkController.addBookmark);
router.delete('/:interviewId', validate(bookmarkParamSchema), bookmarkController.removeBookmark);
router.get('/:interviewId/check', validate(bookmarkParamSchema), bookmarkController.checkBookmark);

export default router;
