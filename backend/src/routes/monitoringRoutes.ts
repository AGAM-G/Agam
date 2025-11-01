import express from 'express';
import {
  getActiveTests,
  getSystemHealth,
  getSystemAlerts,
  getExecutionStats,
  ping,
} from '../controllers/monitoringController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public ping endpoint (no auth needed)
router.get('/ping', ping);

// Protected monitoring endpoints
router.use(authenticateToken);

router.get('/active-tests', getActiveTests);
router.get('/system-health', getSystemHealth);
router.get('/alerts', getSystemAlerts);
router.get('/stats', getExecutionStats);

export default router;

