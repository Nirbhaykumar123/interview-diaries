import { Router } from 'express';
import { helpfulController } from '../controllers/helpful.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { rateLimiter } from '../middleware/rateLimiter.middleware';
import { helpfulParamSchema } from '../validations/helpful.validation';

const router = Router();

// Secure all paths with authentication
router.use(authenticate);

router.post(
  '/:interviewId',
  rateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    message: 'Too many votes cast. Please wait before upvoting again.',
  }),
  validate(helpfulParamSchema),
  helpfulController.addVote
);
router.delete('/:interviewId', validate(helpfulParamSchema), helpfulController.removeVote);
router.get('/:interviewId/check', validate(helpfulParamSchema), helpfulController.checkVote);

export default router;
