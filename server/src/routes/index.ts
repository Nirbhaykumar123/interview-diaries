import { Router } from 'express';
import authRoutes from './auth.routes';
import companyRoutes from './company.routes';
import interviewRoutes from './interview.routes';
import userRoutes from './user.routes';
import bookmarkRoutes from './bookmark.routes';
import commentRoutes from './comment.routes';
import helpfulRoutes from './helpful.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import moderationRoutes from './moderation.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/interviews', interviewRoutes);
router.use('/users', userRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/comments', commentRoutes);
router.use('/helpful', helpfulRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', moderationRoutes);

export default router;
