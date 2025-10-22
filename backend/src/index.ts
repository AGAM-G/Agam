import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import testCaseRoutes from './routes/testCaseRoutes';
import testRunRoutes from './routes/testRunRoutes';
import pool from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testCaseRoutes);
app.use('/api/test-runs', testRunRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 AutomationHub Backend Server         ║
╠════════════════════════════════════════════╣
║   Environment: ${process.env.NODE_ENV?.padEnd(28) || 'development'.padEnd(28)}║
║   Port: ${PORT.toString().padEnd(35)}║
║   Frontend URL: ${(process.env.FRONTEND_URL || 'http://localhost:5173').padEnd(26)}║
╚════════════════════════════════════════════╝
  `);
});

export default app;
