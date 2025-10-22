import express from 'express';
import {
  getAllTestCases,
  getTestCaseById,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  getAllTestFiles,
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

export default router;
