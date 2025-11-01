import express from 'express';
import {
  getUserNotifications,
  getUnreadCount,
} from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Notification routes
router.get('/notifications', getUserNotifications);
router.get('/notifications/unread-count', getUnreadCount);

export default router;

