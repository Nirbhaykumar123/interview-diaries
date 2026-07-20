import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { rateLimiter } from '../middleware/rateLimiter.middleware';
import {
  addCommentSchema,
  updateCommentSchema,
  commentIdParamSchema,
  getCommentsSchema,
} from '../validations/comment.validation';

const router = Router();

// Endpoints for editing/deleting specific comments (Authenticated)
router.patch('/:commentId', authenticate, validate(updateCommentSchema), commentController.updateComment);
router.delete('/:commentId', authenticate, validate(commentIdParamSchema), commentController.deleteComment);

// Endpoints for creating/reading comments on an interview experience
router.post(
  '/interview/:interviewId',
  authenticate,
  rateLimiter({
    windowMs: 60 * 1000,
    max: 5,
    message: 'Too many comments posted. Please wait a minute before trying again.',
  }),
  validate(addCommentSchema),
  commentController.addComment
);
router.get('/interview/:interviewId', validate(getCommentsSchema), commentController.getComments);

export default router;
