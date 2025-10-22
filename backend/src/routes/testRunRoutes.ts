import express from 'express';
import {
  getAllTestRuns,
  getTestRunById,
  createTestRun,
  updateTestRun,
  getDashboardMetrics,
  getSystemHealth,
} from '../controllers/testRunController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/runs', getAllTestRuns);
router.get('/runs/:id', getTestRunById);
router.post('/runs', createTestRun);
router.put('/runs/:id', updateTestRun);

router.get('/dashboard/metrics', getDashboardMetrics);
router.get('/dashboard/system-health', getSystemHealth);

export default router;
