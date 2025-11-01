import express from 'express';
import {
  getAllScheduledTests,
  getScheduledTestById,
  createScheduledTest,
  updateScheduledTest,
  deleteScheduledTest,
  toggleScheduledTest,
  getDueScheduledTests,
} from '../controllers/scheduledTestController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Scheduled tests routes
router.get('/scheduled', getAllScheduledTests);
router.get('/scheduled/:id', getScheduledTestById);
router.post('/scheduled', createScheduledTest);
router.put('/scheduled/:id', updateScheduledTest);
router.delete('/scheduled/:id', deleteScheduledTest);
router.patch('/scheduled/:id/toggle', toggleScheduledTest);

// Internal route for scheduler service
router.get('/scheduled/internal/due', getDueScheduledTests);

export default router;

