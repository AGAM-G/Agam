import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';

/**
 * Get user notifications (based on recent test runs and alerts)
 * No database table needed - built from existing data
 */
export const getUserNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    const { limit = '10' } = req.query;

    const notifications: any[] = [];

    // Get recent test runs for this user
    const recentRunsQuery = `
      SELECT 
        tr.id,
        tr.run_id,
        tr.name,
        tr.status,
        tr.completed_at,
        tr.tests_passed,
        tr.tests_failed,
        tr.total_tests
      FROM test_runs tr
      WHERE tr.user_id = $1
        AND tr.status IN ('passed', 'failed')
        AND tr.completed_at > NOW() - INTERVAL '24 hours'
      ORDER BY tr.completed_at DESC
      LIMIT 5
    `;

    const recentRuns = await pool.query(recentRunsQuery, [userId]);

    // Convert test runs to notifications
    recentRuns.rows.forEach((run) => {
      const type = run.status === 'passed' ? 'success' : 'error';
      const icon = run.status === 'passed' ? '✓' : '✗';
      
      notifications.push({
        id: `run-${run.id}`,
        type,
        title: `Test Run ${run.status === 'passed' ? 'Completed' : 'Failed'}`,
        message: `${run.name}: ${run.tests_passed}/${run.total_tests} tests passed`,
        timestamp: run.completed_at,
        icon,
        link: `/test-results?runId=${run.id}`,
        metadata: {
          testRunId: run.id,
          status: run.status,
        },
      });
    });

    // Get scheduled tests that ran recently
    const scheduledRunsQuery = `
      SELECT 
        st.id,
        st.name,
        st.last_run_at,
        st.last_run_status
      FROM scheduled_tests st
      WHERE st.user_id = $1
        AND st.last_run_at > NOW() - INTERVAL '24 hours'
      ORDER BY st.last_run_at DESC
      LIMIT 5
    `;

    const scheduledRuns = await pool.query(scheduledRunsQuery, [userId]);

    // Convert scheduled runs to notifications
    scheduledRuns.rows.forEach((schedule) => {
      const type = schedule.last_run_status === 'passed' ? 'success' : 
                   schedule.last_run_status === 'failed' ? 'error' : 'info';
      
      notifications.push({
        id: `schedule-${schedule.id}`,
        type,
        title: 'Scheduled Test Executed',
        message: `${schedule.name} ran automatically and ${schedule.last_run_status}`,
        timestamp: schedule.last_run_at,
        icon: '📅',
        link: `/schedule`,
        metadata: {
          scheduledTestId: schedule.id,
          status: schedule.last_run_status,
        },
      });
    });

    // Check for long-running tests (warnings)
    const longRunningQuery = `
      SELECT 
        tr.id,
        tr.name,
        tr.started_at,
        EXTRACT(EPOCH FROM (NOW() - tr.started_at))::integer as duration_seconds
      FROM test_runs tr
      WHERE tr.user_id = $1
        AND tr.status = 'running'
        AND tr.started_at < NOW() - INTERVAL '30 minutes'
      LIMIT 3
    `;

    const longRunning = await pool.query(longRunningQuery, [userId]);

    longRunning.rows.forEach((run) => {
      notifications.push({
        id: `warning-${run.id}`,
        type: 'warning',
        title: 'Long Running Test',
        message: `"${run.name}" has been running for ${Math.round(run.duration_seconds / 60)} minutes`,
        timestamp: new Date().toISOString(),
        icon: '⏱️',
        link: `/test-results?runId=${run.id}`,
        metadata: {
          testRunId: run.id,
          duration: run.duration_seconds,
        },
      });
    });

    // Sort by timestamp (most recent first)
    notifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit results
    const limitedNotifications = notifications.slice(0, parseInt(limit as string));

    res.status(200).json({
      success: true,
      data: {
        notifications: limitedNotifications,
        total: notifications.length,
        unreadCount: notifications.length, // All are "unread" in this simple version
      },
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;

    // Count recent activity (last 24 hours)
    const countQuery = `
      SELECT 
        (SELECT COUNT(*) FROM test_runs 
         WHERE user_id = $1 
           AND status IN ('passed', 'failed') 
           AND completed_at > NOW() - INTERVAL '24 hours') as test_runs,
        (SELECT COUNT(*) FROM scheduled_tests 
         WHERE user_id = $1 
           AND last_run_at > NOW() - INTERVAL '24 hours') as scheduled_runs,
        (SELECT COUNT(*) FROM test_runs 
         WHERE user_id = $1 
           AND status = 'running' 
           AND started_at < NOW() - INTERVAL '30 minutes') as warnings
    `;

    const result = await pool.query(countQuery, [userId]);
    const counts = result.rows[0];

    const unreadCount = 
      parseInt(counts.test_runs || 0) + 
      parseInt(counts.scheduled_runs || 0) + 
      parseInt(counts.warnings || 0);

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

