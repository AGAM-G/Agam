import { Request, Response } from 'express';
import pool from '../config/database';
import testScheduler from '../services/testSchedulerService';

/**
 * Get currently running tests and last N completed runs
 */
export const getActiveTests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { limit = '2' } = req.query;

    // Get currently running tests
    const runningTestsQuery = `
      SELECT 
        tr.id,
        tr.run_id,
        tr.name,
        tr.status,
        tr.duration,
        tr.started_at,
        tr.completed_at,
        tr.tests_passed,
        tr.tests_failed,
        tr.tests_pending,
        tr.total_tests,
        u.name as user_name,
        u.email as user_email,
        EXTRACT(EPOCH FROM (NOW() - tr.started_at))::integer as running_duration_seconds
      FROM test_runs tr
      LEFT JOIN users u ON tr.user_id = u.id
      WHERE tr.status = 'running'
      ORDER BY tr.started_at DESC
    `;

    const runningTests = await pool.query(runningTestsQuery);

    // Get last N completed test runs
    const lastRunsQuery = `
      SELECT 
        tr.id,
        tr.run_id,
        tr.name,
        tr.status,
        tr.duration,
        tr.started_at,
        tr.completed_at,
        tr.tests_passed,
        tr.tests_failed,
        tr.tests_pending,
        tr.total_tests,
        u.name as user_name,
        u.email as user_email
      FROM test_runs tr
      LEFT JOIN users u ON tr.user_id = u.id
      WHERE tr.status IN ('passed', 'failed', 'skipped')
      ORDER BY tr.completed_at DESC
      LIMIT $1
    `;

    const lastRuns = await pool.query(lastRunsQuery, [parseInt(limit as string)]);

    res.status(200).json({
      success: true,
      data: {
        runningTests: runningTests.rows,
        lastCompletedRuns: lastRuns.rows,
        runningCount: runningTests.rows.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get active tests error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get comprehensive system health status
 */
export const getSystemHealth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const healthChecks: any = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      services: {},
    };

    // Check Backend (this service)
    healthChecks.services.backend = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
    };

    // Check Database
    try {
      const dbStartTime = Date.now();
      await pool.query('SELECT 1');
      const dbResponseTime = Date.now() - dbStartTime;

      const dbStatsResult = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM test_runs WHERE status = 'running') as running_tests,
          (SELECT COUNT(*) FROM test_cases WHERE active = true) as total_test_cases,
          (SELECT COUNT(*) FROM scheduled_tests WHERE enabled = true) as active_schedules
      `);

      healthChecks.services.database = {
        status: 'healthy',
        responseTime: dbResponseTime,
        stats: dbStatsResult.rows[0],
      };
    } catch (dbError) {
      healthChecks.services.database = {
        status: 'unhealthy',
        error: dbError instanceof Error ? dbError.message : 'Connection failed',
      };
      healthChecks.overall = 'degraded';
    }

    // Check Test Scheduler
    const schedulerStatus = testScheduler.getStatus();
    healthChecks.services.scheduler = {
      status: schedulerStatus.isRunning ? 'healthy' : 'stopped',
      checkInterval: `${schedulerStatus.checkIntervalMs / 60000} minutes`,
    };

    if (!schedulerStatus.isRunning) {
      healthChecks.overall = 'degraded';
    }

    // Frontend check (placeholder - frontend needs to ping backend)
    // This would typically be updated by frontend health checks
    healthChecks.services.frontend = {
      status: 'unknown',
      note: 'Frontend should ping /api/monitoring/ping endpoint',
    };

    res.status(200).json({
      success: true,
      data: healthChecks,
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      data: {
        overall: 'unhealthy',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get system alerts based on current conditions
 */
export const getSystemAlerts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const alerts: any[] = [];

    // Check for long-running tests
    const longRunningResult = await pool.query(`
      SELECT 
        tr.id,
        tr.name,
        tr.run_id,
        EXTRACT(EPOCH FROM (NOW() - tr.started_at))::integer as duration_seconds
      FROM test_runs tr
      WHERE tr.status = 'running'
        AND tr.started_at < NOW() - INTERVAL '30 minutes'
      ORDER BY tr.started_at ASC
    `);

    longRunningResult.rows.forEach((test) => {
      alerts.push({
        id: `long-running-${test.id}`,
        type: 'warning',
        severity: 'medium',
        title: 'Long Running Test',
        message: `Test "${test.name}" has been running for ${Math.round(test.duration_seconds / 60)} minutes`,
        timestamp: new Date().toISOString(),
        data: {
          testRunId: test.id,
          runId: test.run_id,
          duration: test.duration_seconds,
        },
      });
    });

    // Check for recent failures
    const recentFailuresResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM test_runs
      WHERE status = 'failed'
        AND completed_at > NOW() - INTERVAL '1 hour'
    `);

    const recentFailures = parseInt(recentFailuresResult.rows[0].count);
    if (recentFailures >= 3) {
      alerts.push({
        id: 'high-failure-rate',
        type: 'error',
        severity: 'high',
        title: 'High Failure Rate',
        message: `${recentFailures} test runs have failed in the last hour`,
        timestamp: new Date().toISOString(),
        data: {
          failureCount: recentFailures,
          timeWindow: '1 hour',
        },
      });
    }

    // Check for stuck scheduled tests
    const stuckScheduledResult = await pool.query(`
      SELECT 
        st.id,
        st.name,
        st.next_run_at
      FROM scheduled_tests st
      WHERE st.enabled = true
        AND st.next_run_at IS NOT NULL
        AND st.next_run_at < NOW() - INTERVAL '5 minutes'
      LIMIT 5
    `);

    stuckScheduledResult.rows.forEach((schedule) => {
      alerts.push({
        id: `stuck-schedule-${schedule.id}`,
        type: 'warning',
        severity: 'medium',
        title: 'Scheduled Test Delayed',
        message: `Scheduled test "${schedule.name}" was supposed to run but hasn't started`,
        timestamp: new Date().toISOString(),
        data: {
          scheduleId: schedule.id,
          nextRunAt: schedule.next_run_at,
        },
      });
    });

    // Check database health
    try {
      await pool.query('SELECT 1');
    } catch (dbError) {
      alerts.push({
        id: 'database-unhealthy',
        type: 'error',
        severity: 'critical',
        title: 'Database Connection Issue',
        message: 'Unable to connect to the database',
        timestamp: new Date().toISOString(),
      });
    }

    // Check scheduler status
    const schedulerStatus = testScheduler.getStatus();
    if (!schedulerStatus.isRunning) {
      alerts.push({
        id: 'scheduler-stopped',
        type: 'warning',
        severity: 'high',
        title: 'Test Scheduler Not Running',
        message: 'The automatic test scheduler service is not running',
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      data: {
        alerts,
        count: alerts.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get system alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get test execution statistics for monitoring
 */
export const getExecutionStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { timeRange = '24h' } = req.query;

    let interval = '24 hours';
    if (timeRange === '1h') interval = '1 hour';
    if (timeRange === '7d') interval = '7 days';
    if (timeRange === '30d') interval = '30 days';

    const statsQuery = `
      SELECT 
        COUNT(*) as total_runs,
        COUNT(*) FILTER (WHERE status = 'passed') as passed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'running') as running,
        AVG(duration) FILTER (WHERE status IN ('passed', 'failed')) as avg_duration,
        MAX(duration) FILTER (WHERE status IN ('passed', 'failed')) as max_duration,
        MIN(duration) FILTER (WHERE status IN ('passed', 'failed')) as min_duration
      FROM test_runs
      WHERE started_at > NOW() - INTERVAL '${interval}'
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    const totalRuns = parseInt(stats.total_runs || 0);
    const successRate = totalRuns > 0 
      ? ((parseInt(stats.passed || 0) / totalRuns) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        timeRange: interval,
        totalRuns,
        passed: parseInt(stats.passed || 0),
        failed: parseInt(stats.failed || 0),
        running: parseInt(stats.running || 0),
        successRate: parseFloat(successRate as string),
        avgDuration: Math.round(parseFloat(stats.avg_duration || 0)),
        maxDuration: parseInt(stats.max_duration || 0),
        minDuration: parseInt(stats.min_duration || 0),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get execution stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Frontend ping endpoint for health checks
 */
export const ping = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
};

