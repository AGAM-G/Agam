import pool from '../config/database';

export interface ScheduledTest {
  id: string;
  name: string;
  testCaseId?: string;
  testFileId?: string;
  userId?: string;
  scheduleType: 'one-time' | 'daily' | 'weekly' | 'monthly';
  scheduledDate?: string;
  scheduledTime: string;
  timezone: string;
  recurrencePattern?: any;
  enabled: boolean;
  nextRunAt?: string;
  lastRunAt?: string;
  lastRunStatus?: 'passed' | 'failed' | 'skipped';
  runCount: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScheduledTestInput {
  name: string;
  testCaseId?: string;
  testFileId?: string;
  userId?: string;
  scheduleType: 'one-time' | 'daily' | 'weekly' | 'monthly';
  scheduledDate?: string;
  scheduledTime: string;
  timezone?: string;
  recurrencePattern?: any;
  description?: string;
}

export class ScheduledTestService {
  /**
   * Calculate next run time based on schedule configuration
   */
  private calculateNextRunTime(
    scheduleType: string,
    scheduledDate: string | undefined,
    scheduledTime: string,
    timezone: string,
    recurrencePattern?: any
  ): Date {
    const now = new Date();
    const timeParts = scheduledTime.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    if (scheduleType === 'one-time') {
      // For one-time, use the scheduled date and time
      const date = scheduledDate ? new Date(scheduledDate) : now;
      date.setHours(hours, minutes, 0, 0);
      
      // If the time has already passed today, return the exact time
      return date;
    }

    if (scheduleType === 'daily') {
      // For daily, set to today at scheduled time, or tomorrow if already passed
      const nextRun = new Date();
      nextRun.setHours(hours, minutes, 0, 0);
      
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      
      return nextRun;
    }

    if (scheduleType === 'weekly') {
      // For weekly, use recurrence pattern to determine next day
      const daysOfWeek = recurrencePattern?.days || [now.getDay()];
      const nextRun = new Date();
      nextRun.setHours(hours, minutes, 0, 0);
      
      // Find next occurrence of scheduled day
      let daysToAdd = 0;
      const currentDay = now.getDay();
      
      for (let i = 0; i < 7; i++) {
        const checkDay = (currentDay + i) % 7;
        if (daysOfWeek.includes(checkDay)) {
          if (i === 0 && nextRun > now) {
            // Today is the day and time hasn't passed
            daysToAdd = 0;
            break;
          } else if (i > 0) {
            daysToAdd = i;
            break;
          }
        }
      }
      
      nextRun.setDate(nextRun.getDate() + daysToAdd);
      return nextRun;
    }

    if (scheduleType === 'monthly') {
      // For monthly, run on specific day of month
      const dayOfMonth = recurrencePattern?.dayOfMonth || 1;
      const nextRun = new Date();
      nextRun.setDate(dayOfMonth);
      nextRun.setHours(hours, minutes, 0, 0);
      
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      
      return nextRun;
    }

    return now;
  }

  /**
   * Create a new scheduled test
   */
  async createScheduledTest(input: CreateScheduledTestInput): Promise<ScheduledTest> {
    try {
      // Validate that either testCaseId or testFileId is provided
      if (!input.testCaseId && !input.testFileId) {
        throw new Error('Either testCaseId or testFileId must be provided');
      }

      if (input.testCaseId && input.testFileId) {
        throw new Error('Cannot specify both testCaseId and testFileId');
      }

      // Calculate next run time
      const nextRunAt = this.calculateNextRunTime(
        input.scheduleType,
        input.scheduledDate,
        input.scheduledTime,
        input.timezone || 'UTC',
        input.recurrencePattern
      );

      const query = `
        INSERT INTO scheduled_tests (
          name, test_case_id, test_file_id, user_id,
          schedule_type, scheduled_date, scheduled_time, timezone,
          recurrence_pattern, next_run_at, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        input.name,
        input.testCaseId || null,
        input.testFileId || null,
        input.userId || null,
        input.scheduleType,
        input.scheduledDate || null,
        input.scheduledTime,
        input.timezone || 'UTC',
        input.recurrencePattern ? JSON.stringify(input.recurrencePattern) : null,
        nextRunAt,
        input.description || null,
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Create scheduled test error:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled tests
   */
  async getAllScheduledTests(filters?: {
    enabled?: boolean;
    scheduleType?: string;
    userId?: string;
  }): Promise<ScheduledTest[]> {
    try {
      let query = `
        SELECT 
          st.*,
          tc.name as test_case_name,
          tf.name as test_file_name,
          u.name as user_name
        FROM scheduled_tests st
        LEFT JOIN test_cases tc ON st.test_case_id = tc.id
        LEFT JOIN test_files tf ON st.test_file_id = tf.id
        LEFT JOIN users u ON st.user_id = u.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramCount = 1;

      if (filters?.enabled !== undefined) {
        query += ` AND st.enabled = $${paramCount}`;
        params.push(filters.enabled);
        paramCount++;
      }

      if (filters?.scheduleType) {
        query += ` AND st.schedule_type = $${paramCount}`;
        params.push(filters.scheduleType);
        paramCount++;
      }

      if (filters?.userId) {
        query += ` AND st.user_id = $${paramCount}`;
        params.push(filters.userId);
        paramCount++;
      }

      query += ` ORDER BY st.next_run_at ASC NULLS LAST, st.created_at DESC`;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Get scheduled tests error:', error);
      throw error;
    }
  }

  /**
   * Get scheduled test by ID
   */
  async getScheduledTestById(id: string): Promise<ScheduledTest | null> {
    try {
      const query = `
        SELECT 
          st.*,
          tc.name as test_case_name,
          tf.name as test_file_name,
          u.name as user_name
        FROM scheduled_tests st
        LEFT JOIN test_cases tc ON st.test_case_id = tc.id
        LEFT JOIN test_files tf ON st.test_file_id = tf.id
        LEFT JOIN users u ON st.user_id = u.id
        WHERE st.id = $1
      `;

      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Get scheduled test by ID error:', error);
      throw error;
    }
  }

  /**
   * Update scheduled test
   */
  async updateScheduledTest(
    id: string,
    updates: Partial<CreateScheduledTestInput> & { enabled?: boolean }
  ): Promise<ScheduledTest> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updates.name !== undefined) {
        fields.push(`name = $${paramCount}`);
        values.push(updates.name);
        paramCount++;
      }

      if (updates.scheduleType !== undefined) {
        fields.push(`schedule_type = $${paramCount}`);
        values.push(updates.scheduleType);
        paramCount++;
      }

      if (updates.scheduledDate !== undefined) {
        fields.push(`scheduled_date = $${paramCount}`);
        values.push(updates.scheduledDate);
        paramCount++;
      }

      if (updates.scheduledTime !== undefined) {
        fields.push(`scheduled_time = $${paramCount}`);
        values.push(updates.scheduledTime);
        paramCount++;
      }

      if (updates.timezone !== undefined) {
        fields.push(`timezone = $${paramCount}`);
        values.push(updates.timezone);
        paramCount++;
      }

      if (updates.recurrencePattern !== undefined) {
        fields.push(`recurrence_pattern = $${paramCount}`);
        values.push(JSON.stringify(updates.recurrencePattern));
        paramCount++;
      }

      if (updates.enabled !== undefined) {
        fields.push(`enabled = $${paramCount}`);
        values.push(updates.enabled);
        paramCount++;
      }

      if (updates.description !== undefined) {
        fields.push(`description = $${paramCount}`);
        values.push(updates.description);
        paramCount++;
      }

      // Recalculate next run time if schedule changed
      if (updates.scheduleType || updates.scheduledDate || updates.scheduledTime) {
        const current = await this.getScheduledTestById(id);
        if (current) {
          // Database returns snake_case fields
          const currentData = current as any;
          const nextRunAt = this.calculateNextRunTime(
            updates.scheduleType || currentData.schedule_type,
            updates.scheduledDate || currentData.scheduled_date,
            updates.scheduledTime || currentData.scheduled_time,
            updates.timezone || currentData.timezone || 'UTC',
            updates.recurrencePattern || currentData.recurrence_pattern
          );
          fields.push(`next_run_at = $${paramCount}`);
          values.push(nextRunAt);
          paramCount++;
        }
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);
      const query = `
        UPDATE scheduled_tests
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Update scheduled test error:', error);
      throw error;
    }
  }

  /**
   * Delete scheduled test
   */
  async deleteScheduledTest(id: string): Promise<void> {
    try {
      await pool.query('DELETE FROM scheduled_tests WHERE id = $1', [id]);
    } catch (error) {
      console.error('Delete scheduled test error:', error);
      throw error;
    }
  }

  /**
   * Get scheduled tests that are due to run
   */
  async getDueScheduledTests(): Promise<ScheduledTest[]> {
    try {
      const query = `
        SELECT 
          st.*,
          tc.id as test_case_id,
          tc.name as test_case_name,
          tc.file_path as test_case_path,
          tf.id as test_file_id,
          tf.name as test_file_name,
          tf.path as test_file_path
        FROM scheduled_tests st
        LEFT JOIN test_cases tc ON st.test_case_id = tc.id
        LEFT JOIN test_files tf ON st.test_file_id = tf.id
        WHERE st.enabled = true
          AND st.next_run_at IS NOT NULL
          AND st.next_run_at <= CURRENT_TIMESTAMP
        ORDER BY st.next_run_at ASC
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Get due scheduled tests error:', error);
      throw error;
    }
  }

  /**
   * Update last run information and calculate next run time
   */
  async updateAfterRun(
    id: string,
    status: 'passed' | 'failed' | 'skipped'
  ): Promise<void> {
    try {
      const scheduledTest = await this.getScheduledTestById(id);
      if (!scheduledTest) {
        throw new Error('Scheduled test not found');
      }

      // Database returns snake_case fields
      const scheduleType = (scheduledTest as any).schedule_type;
      const scheduledDate = (scheduledTest as any).scheduled_date;
      const scheduledTime = (scheduledTest as any).scheduled_time;
      const timezone = (scheduledTest as any).timezone || 'UTC';
      const recurrencePattern = (scheduledTest as any).recurrence_pattern;

      // Calculate next run time for recurring schedules
      let nextRunAt: Date | null = null;
      if (scheduleType !== 'one-time') {
        nextRunAt = this.calculateNextRunTime(
          scheduleType,
          scheduledDate,
          scheduledTime,
          timezone,
          recurrencePattern
        );
      } else {
        // For one-time schedules, disable after running
        await pool.query(
          `UPDATE scheduled_tests 
           SET enabled = false, last_run_at = CURRENT_TIMESTAMP, 
               last_run_status = $1, run_count = run_count + 1,
               next_run_at = NULL
           WHERE id = $2`,
          [status, id]
        );
        return;
      }

      await pool.query(
        `UPDATE scheduled_tests 
         SET last_run_at = CURRENT_TIMESTAMP, last_run_status = $1,
             run_count = run_count + 1, next_run_at = $2
         WHERE id = $3`,
        [status, nextRunAt, id]
      );
    } catch (error) {
      console.error('Update after run error:', error);
      throw error;
    }
  }

  /**
   * Toggle enabled status
   */
  async toggleEnabled(id: string, enabled: boolean): Promise<ScheduledTest> {
    try {
      const query = `
        UPDATE scheduled_tests
        SET enabled = $1
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [enabled, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Toggle enabled error:', error);
      throw error;
    }
  }
}

export default new ScheduledTestService();

