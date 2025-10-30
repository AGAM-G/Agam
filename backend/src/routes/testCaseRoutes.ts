import express from 'express';
import {
  getAllTestCases,
  getTestCaseById,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  getAllTestFiles,
  discoverTests,
  executeTestFile,
  cleanupTestFiles,
} from '../controllers/testCaseController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/cases', getAllTestCases);
router.get('/cases/:id', getTestCaseById);
router.post('/cases', createTestCase);
router.put('/cases/:id', updateTestCase);
router.delete('/cases/:id', deleteTestCase);

router.get('/files', getAllTestFiles);
router.post('/discover', discoverTests);
router.post('/files/:id/execute', executeTestFile);
router.delete('/cleanup', cleanupTestFiles);

export default router;
