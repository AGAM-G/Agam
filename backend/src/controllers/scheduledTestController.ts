import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import scheduledTestService from '../services/scheduledTestService';

/**
 * Get all scheduled tests
 */
export const getAllScheduledTests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { enabled, scheduleType } = req.query;
    const authReq = req as AuthRequest;

    const filters: any = {};

    if (enabled !== undefined) {
      filters.enabled = enabled === 'true';
    }

    if (scheduleType) {
      filters.scheduleType = scheduleType as string;
    }

    // Optionally filter by user
    // filters.userId = authReq.user?.id;

    const scheduledTests = await scheduledTestService.getAllScheduledTests(filters);

    res.status(200).json({
      success: true,
      data: scheduledTests,
    });
  } catch (error) {
    console.error('Get scheduled tests error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get scheduled test by ID
 */
export const getScheduledTestById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const scheduledTest = await scheduledTestService.getScheduledTestById(id);

    if (!scheduledTest) {
      res.status(404).json({
        success: false,
        error: 'Scheduled test not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: scheduledTest,
    });
  } catch (error) {
    console.error('Get scheduled test by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Create new scheduled test
 */
export const createScheduledTest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const {
      name,
      testCaseId,
      testFileId,
      scheduleType,
      scheduledDate,
      scheduledTime,
      timezone,
      recurrencePattern,
      description,
    } = req.body;

    // Validation
    if (!name || !scheduleType || !scheduledTime) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, scheduleType, scheduledTime',
      });
      return;
    }

    if (!testCaseId && !testFileId) {
      res.status(400).json({
        success: false,
        error: 'Either testCaseId or testFileId must be provided',
      });
      return;
    }

    if (testCaseId && testFileId) {
      res.status(400).json({
        success: false,
        error: 'Cannot specify both testCaseId and testFileId',
      });
      return;
    }

    const validScheduleTypes = ['one-time', 'daily', 'weekly', 'monthly'];
    if (!validScheduleTypes.includes(scheduleType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid scheduleType. Must be one of: one-time, daily, weekly, monthly',
      });
      return;
    }

    if (scheduleType === 'one-time' && !scheduledDate) {
      res.status(400).json({
        success: false,
        error: 'scheduledDate is required for one-time schedules',
      });
      return;
    }

    const scheduledTest = await scheduledTestService.createScheduledTest({
      name,
      testCaseId,
      testFileId,
      userId: authReq.userId,
      scheduleType,
      scheduledDate,
      scheduledTime,
      timezone,
      recurrencePattern,
      description,
    });

    res.status(201).json({
      success: true,
      data: scheduledTest,
      message: 'Scheduled test created successfully',
    });
  } catch (error) {
    console.error('Create scheduled test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

/**
 * Update scheduled test
 */
export const updateScheduledTest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if scheduled test exists
    const existing = await scheduledTestService.getScheduledTestById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Scheduled test not found',
      });
      return;
    }

    const updatedScheduledTest = await scheduledTestService.updateScheduledTest(
      id,
      updates
    );

    res.status(200).json({
      success: true,
      data: updatedScheduledTest,
      message: 'Scheduled test updated successfully',
    });
  } catch (error) {
    console.error('Update scheduled test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

/**
 * Delete scheduled test
 */
export const deleteScheduledTest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if scheduled test exists
    const existing = await scheduledTestService.getScheduledTestById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Scheduled test not found',
      });
      return;
    }

    await scheduledTestService.deleteScheduledTest(id);

    res.status(200).json({
      success: true,
      message: 'Scheduled test deleted successfully',
    });
  } catch (error) {
    console.error('Delete scheduled test error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Toggle enabled status
 */
export const toggleScheduledTest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    if (enabled === undefined) {
      res.status(400).json({
        success: false,
        error: 'enabled field is required',
      });
      return;
    }

    // Check if scheduled test exists
    const existing = await scheduledTestService.getScheduledTestById(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Scheduled test not found',
      });
      return;
    }

    const updatedScheduledTest = await scheduledTestService.toggleEnabled(
      id,
      enabled
    );

    res.status(200).json({
      success: true,
      data: updatedScheduledTest,
      message: `Scheduled test ${enabled ? 'enabled' : 'disabled'} successfully`,
    });
  } catch (error) {
    console.error('Toggle scheduled test error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get due scheduled tests (for internal scheduler use)
 */
export const getDueScheduledTests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const dueTests = await scheduledTestService.getDueScheduledTests();

    res.status(200).json({
      success: true,
      data: dueTests,
    });
  } catch (error) {
    console.error('Get due scheduled tests error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

