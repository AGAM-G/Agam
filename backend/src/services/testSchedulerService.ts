import scheduledTestService from './scheduledTestService';
import { TestExecutionService } from './testExecutionService';
import pool from '../config/database';
import { randomBytes } from 'crypto';

/**
 * Service that runs in the background and executes scheduled tests
 */
export class TestSchedulerService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private checkIntervalMs: number;
  private testExecutionService: TestExecutionService;

  constructor(checkIntervalMinutes: number = 1) {
    this.checkIntervalMs = checkIntervalMinutes * 60 * 1000;
    this.testExecutionService = new TestExecutionService();
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️  Test scheduler is already running');
      return;
    }

    console.log('🕐 Starting test scheduler...');
    console.log(`📅 Checking for scheduled tests every ${this.checkIntervalMs / 60000} minute(s)`);

    this.isRunning = true;

    // Run immediately on start
    this.checkAndExecuteScheduledTests();

    // Then run on interval
    this.intervalId = setInterval(() => {
      this.checkAndExecuteScheduledTests();
    }, this.checkIntervalMs);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Test scheduler stopped');
  }

  /**
   * Check for due scheduled tests and execute them
   */
  private async checkAndExecuteScheduledTests(): Promise<void> {
    try {
      // Get all scheduled tests that are due
      const dueTests = await scheduledTestService.getDueScheduledTests();

      if (dueTests.length === 0) {
        console.log(`✅ No scheduled tests due at ${new Date().toISOString()}`);
        return;
      }

      console.log(`📋 Found ${dueTests.length} scheduled test(s) to execute`);

      // Execute each scheduled test
      for (const scheduledTest of dueTests) {
        try {
          await this.executeScheduledTest(scheduledTest);
        } catch (error) {
          console.error(`❌ Error executing scheduled test ${scheduledTest.id}:`, error);
          // Continue with other scheduled tests even if one fails
        }
      }
    } catch (error) {
      console.error('❌ Error checking scheduled tests:', error);
    }
  }

  /**
   * Execute a single scheduled test
   */
  private async executeScheduledTest(scheduledTest: any): Promise<void> {
    try {
      console.log(`🚀 Executing scheduled test: ${scheduledTest.name} (ID: ${scheduledTest.id})`);

      // Determine what to run (test case or test file)
      const testCaseIds: string[] = [];

      if (scheduledTest.test_case_id) {
        // Single test case
        testCaseIds.push(scheduledTest.test_case_id);
      } else if (scheduledTest.test_file_id) {
        // All test cases in the file
        const result = await pool.query(
          'SELECT id FROM test_cases WHERE test_file_id = $1 AND active = true',
          [scheduledTest.test_file_id]
        );
        testCaseIds.push(...result.rows.map((row) => row.id));
      }

      if (testCaseIds.length === 0) {
        console.warn(`⚠️  No test cases found for scheduled test ${scheduledTest.id}`);
        await scheduledTestService.updateAfterRun(scheduledTest.id, 'skipped');
        return;
      }

      // Create a new test run
      const runId = `scheduled-${Date.now()}-${randomBytes(4).toString('hex')}`;
      const testRunName = `${scheduledTest.name} - ${new Date().toLocaleString()}`;

      const testRunResult = await pool.query(
        `INSERT INTO test_runs (
          run_id, name, status, user_id, total_tests
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [runId, testRunName, 'pending', scheduledTest.user_id, testCaseIds.length]
      );

      const testRunId = testRunResult.rows[0].id;

      // Execute the test run in background
      this.testExecutionService
        .executeTestRun(testRunId, testCaseIds)
        .then(async () => {
          // Get final status of the test run
          const statusResult = await pool.query(
            'SELECT status FROM test_runs WHERE id = $1',
            [testRunId]
          );

          const finalStatus = statusResult.rows[0]?.status || 'failed';
          const mappedStatus: 'passed' | 'failed' | 'skipped' =
            finalStatus === 'passed' ? 'passed' : 'failed';

          // Update scheduled test after execution
          await scheduledTestService.updateAfterRun(scheduledTest.id, mappedStatus);

          console.log(
            `✅ Scheduled test "${scheduledTest.name}" completed with status: ${finalStatus}`
          );
        })
        .catch(async (error) => {
          console.error(`❌ Error executing scheduled test "${scheduledTest.name}":`, error);
          await scheduledTestService.updateAfterRun(scheduledTest.id, 'failed');
        });

      console.log(`📝 Test run created: ${runId} (ID: ${testRunId})`);
    } catch (error) {
      console.error(`❌ Error setting up scheduled test execution:`, error);
      throw error;
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; checkIntervalMs: number } {
    return {
      isRunning: this.isRunning,
      checkIntervalMs: this.checkIntervalMs,
    };
  }
}

// Export singleton instance
export default new TestSchedulerService(0.5); // Check every 30 seconds

