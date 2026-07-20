import { Router } from 'express';
import { interviewController } from '../controllers/interview.controller';
import { validate } from '../middleware/validate';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { createInterviewSchema, updateInterviewSchema, getInterviewsSchema } from '../validations/interview.validation';

const router = Router();

// GET /api/interviews - Public paginated feeds
router.get('/', validate(getInterviewsSchema), interviewController.getInterviews);

// GET /api/interviews/user/me - Author posts lookup (Authenticated)
router.get('/user/me', authenticate, interviewController.getMyInterviews);

// GET /api/interviews/trending - Most upvoted experiences
router.get('/trending', interviewController.getTrendingInterviews);

// GET /api/interviews/recent - Latest experiences
router.get('/recent', interviewController.getRecentInterviews);

// GET /api/interviews/:id/related - Fetch related posts
router.get('/:id/related', interviewController.getRelatedInterviews);

// GET /api/interviews/:id - Detailed lookup (Optional auth to check drafts access)
router.get('/:id', optionalAuthenticate, interviewController.getInterviewById);

// POST /api/interviews - Create experience (Authenticated)
router.post('/', authenticate, validate(createInterviewSchema), interviewController.createInterview);

// PATCH /api/interviews/:id - Edit experience (Authenticated)
router.patch('/:id', authenticate, validate(updateInterviewSchema), interviewController.updateInterview);

// DELETE /api/interviews/:id - Soft delete experience (Authenticated)
router.delete('/:id', authenticate, interviewController.deleteInterview);

export default router;
