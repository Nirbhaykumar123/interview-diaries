import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  getNotificationsSchema,
  notificationIdParamSchema,
} from '../validations/notification.validation';

const router = Router();

// Secure all endpoints in this router
router.use(authenticate);

router.get('/', validate(getNotificationsSchema), notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:notificationId/read', validate(notificationIdParamSchema), notificationController.markAsRead);

export default router;
