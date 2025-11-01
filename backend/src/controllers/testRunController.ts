import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAllTestRuns = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, limit = '50' } = req.query;

    let query = `
      SELECT tr.*, u.name as user_name, u.email as user_email
      FROM test_runs tr
      LEFT JOIN users u ON tr.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      query += ` AND tr.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY tr.started_at DESC LIMIT $${paramCount}`;
    params.push(parseInt(limit as string));

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get test runs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getTestRunById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const runResult = await pool.query(
      `SELECT tr.*, u.name as user_name, u.email as user_email
       FROM test_runs tr
       LEFT JOIN users u ON tr.user_id = u.id
       WHERE tr.id = $1`,
      [id]
    );

    if (runResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Test run not found',
      });
      return;
    }

    // Get test results for this run
    const resultsQuery = await pool.query(
      `SELECT tr.*, tc.name as test_name, tc.type as test_type
       FROM test_results tr
       LEFT JOIN test_cases tc ON tr.test_case_id = tc.id
       WHERE tr.test_run_id = $1
       ORDER BY tr.started_at`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...runResult.rows[0],
        results: resultsQuery.rows,
      },
    });
  } catch (error) {
    console.error('Get test run error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const createTestRun = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, testCaseIds } = req.body;
    const userId = req.userId;

    if (!name || !testCaseIds || testCaseIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Name and test case IDs are required',
      });
      return;
    }

    // Generate unique run ID
    const runId = `test-run-${Date.now()}`;

    // Create test run
    const runResult = await pool.query(
      `INSERT INTO test_runs (run_id, name, status, total_tests, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [runId, name, 'pending', testCaseIds.length, userId]
    );

    const testRun = runResult.rows[0];

    // Create test results for each test case
    const resultPromises = testCaseIds.map((testCaseId: string) =>
      pool.query(
        `INSERT INTO test_results (test_run_id, test_case_id, status)
         VALUES ($1, $2, $3)`,
        [testRun.id, testCaseId, 'pending']
      )
    );

    await Promise.all(resultPromises);

    // Update test cases status to pending
    await pool.query(
      `UPDATE test_cases SET status = 'pending' WHERE id = ANY($1)`,
      [testCaseIds]
    );

    res.status(201).json({
      success: true,
      data: testRun,
      message: 'Test run created successfully',
    });
  } catch (error) {
    console.error('Create test run error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const updateTestRun = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, duration, testsPassed, testsFailed, testsPending } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;

      if (status === 'running') {
        updates.push(`started_at = CURRENT_TIMESTAMP`);
      } else if (['passed', 'failed'].includes(status)) {
        updates.push(`completed_at = CURRENT_TIMESTAMP`);
      }
    }

    if (duration !== undefined) {
      updates.push(`duration = $${paramCount}`);
      params.push(duration);
      paramCount++;
    }

    if (testsPassed !== undefined) {
      updates.push(`tests_passed = $${paramCount}`);
      params.push(testsPassed);
      paramCount++;
    }

    if (testsFailed !== undefined) {
      updates.push(`tests_failed = $${paramCount}`);
      params.push(testsFailed);
      paramCount++;
    }

    if (testsPending !== undefined) {
      updates.push(`tests_pending = $${paramCount}`);
      params.push(testsPending);
      paramCount++;
    }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
      return;
    }

    params.push(id);
    const query = `
      UPDATE test_runs
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Test run not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Test run updated successfully',
    });
  } catch (error) {
    console.error('Update test run error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getDashboardMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get total tests (current)
    const totalTestsResult = await pool.query(
      'SELECT COUNT(*) as count FROM test_cases WHERE active = true'
    );
    const totalTests = parseInt(totalTestsResult.rows[0].count);

    // Get total tests from previous week for comparison
    const prevTotalTestsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM test_cases 
      WHERE active = true 
        AND created_at < NOW() - INTERVAL '7 days'
    `);
    const prevTotalTests = parseInt(prevTotalTestsResult.rows[0].count);

    // Calculate total tests change
    const totalTestsChange = prevTotalTests > 0
      ? ((totalTests - prevTotalTests) / prevTotalTests) * 100
      : 0;

    // Get recent test runs stats (last 7 days)
    const recentRunsResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'passed') as passed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        AVG(duration) as avg_duration
      FROM test_runs
      WHERE started_at > NOW() - INTERVAL '7 days'
    `);

    const stats = recentRunsResult.rows[0];
    const totalRuns = parseInt(stats.passed || 0) + parseInt(stats.failed || 0);
    const successRate = totalRuns > 0 ? ((parseInt(stats.passed || 0) / totalRuns) * 100) : 0;
    const avgDuration = parseInt(stats.avg_duration || 0);
    const failedTests = parseInt(stats.failed || 0);

    // Get previous week stats for comparison (14 days ago to 7 days ago)
    const previousWeekResult = await pool.query(`
      SELECT
        COUNT(*) as total_tests,
        COUNT(*) FILTER (WHERE status = 'passed') as passed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        AVG(duration) as avg_duration
      FROM test_runs
      WHERE started_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'
    `);

    const prevStats = previousWeekResult.rows[0];
    const prevTotalRuns = parseInt(prevStats.total_tests || 0);
    const prevFailedTests = parseInt(prevStats.failed || 0);
    const prevAvgDuration = parseInt(prevStats.avg_duration || 0);
    const prevSuccessRate = prevTotalRuns > 0
      ? ((parseInt(prevStats.passed || 0) / prevTotalRuns) * 100)
      : 0;

    // Calculate all changes (percentage change)
    const successRateChange = prevSuccessRate > 0
      ? ((successRate - prevSuccessRate) / prevSuccessRate) * 100
      : 0;

    const failedTestsChange = prevFailedTests > 0
      ? ((failedTests - prevFailedTests) / prevFailedTests) * 100
      : (failedTests > 0 ? 100 : 0); // If no previous failures but current failures, show 100% increase

    const avgDurationChange = prevAvgDuration > 0
      ? ((avgDuration - prevAvgDuration) / prevAvgDuration) * 100
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalTests,
        totalTestsChange: Math.round(totalTestsChange),
        successRate: Math.round(successRate),
        successRateChange: Math.round(successRateChange),
        failedTests,
        failedTestsChange: Math.round(failedTestsChange),
        avgDuration: avgDuration / 1000, // Convert to seconds
        avgDurationChange: Math.round(avgDurationChange),
      },
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getSystemHealth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check database connection and get stats
    const dbStartTime = Date.now();
    await pool.query('SELECT 1');
    const dbResponseTime = Date.now() - dbStartTime;

    // Get active test runs
    const activeRunsResult = await pool.query(
      "SELECT COUNT(*) as count FROM test_runs WHERE status = 'running'"
    );
    const runningTests = parseInt(activeRunsResult.rows[0].count);

    // Get database pool stats (real availability)
    const poolStats = pool.totalCount;
    const poolIdle = pool.idleCount;
    const poolActive = poolStats - poolIdle;
    const dbAvailability = poolStats > 0 ? Math.round((poolIdle / poolStats) * 100) : 100;

    // Determine overall status
    const isHealthy = dbResponseTime < 1000 && dbAvailability > 20;
    const status = isHealthy ? 'healthy' : 'degraded';

    res.status(200).json({
      success: true,
      data: {
        status,
        testRunners: {
          active: runningTests > 0 ? 1 : 0, // 1 runner if tests running, 0 if idle
          total: 1, // We have 1 test execution service
        },
        database: {
          available: dbAvailability,
          responseTime: dbResponseTime,
          connections: {
            total: poolStats,
            active: poolActive,
            idle: poolIdle,
          },
        },
        runningTests,
      },
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      data: {
        status: 'down',
        testRunners: {
          active: 0,
          total: 8,
        },
        database: {
          available: 0,
        },
        runningTests: 0,
      },
    });
  }
};

export const stopTestRun = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if test run exists
    const runResult = await pool.query(
      'SELECT * FROM test_runs WHERE id = $1',
      [id]
    );

    if (runResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Test run not found',
      });
      return;
    }

    const testRun = runResult.rows[0];

    // Only allow stopping running or pending tests
    if (testRun.status !== 'running' && testRun.status !== 'pending') {
      res.status(400).json({
        success: false,
        error: 'Test run is not active',
      });
      return;
    }

    // Update test run status to failed (stopped)
    await pool.query(
      `UPDATE test_runs
       SET status = 'failed', completed_at = CURRENT_TIMESTAMP, duration = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) * 1000
       WHERE id = $1`,
      [id]
    );

    // Update all pending test results to skipped
    await pool.query(
      `UPDATE test_results
       SET status = 'skipped', completed_at = CURRENT_TIMESTAMP
       WHERE test_run_id = $1 AND status IN ('pending', 'running')`,
      [id]
    );

    // Update test cases to skipped
    await pool.query(
      `UPDATE test_cases
       SET status = 'skipped'
       WHERE id IN (
         SELECT test_case_id FROM test_results WHERE test_run_id = $1
       ) AND status IN ('pending', 'running')`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Test run stopped successfully',
    });
  } catch (error) {
    console.error('Stop test run error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};