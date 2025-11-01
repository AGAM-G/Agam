import express from 'express';
import { register, login, getMe, getAllUsers, updateUserRole, deleteUser, getUserStats } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);

// Team management routes
router.get('/users', authenticateToken, getAllUsers);
router.patch('/users/:userId/role', authenticateToken, updateUserRole);
router.delete('/users/:userId', authenticateToken, deleteUser);
router.get('/users/:userId/stats', authenticateToken, getUserStats);

export default router;
