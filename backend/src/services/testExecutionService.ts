import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import pool from '../config/database';
import fs from 'fs';

const execAsync = promisify(exec);

interface TestExecutionResult {
  testRunId: string;
  status: 'passed' | 'failed' | 'running';
  duration: number;
  testsPassed: number;
  testsFailed: number;
  testsPending: number;
  results: TestCaseResult[];
}

interface TestCaseResult {
  testCaseId: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  stackTrace?: string;
  logs?: string;
}

export class TestExecutionService {
  /**
   * Execute a test run
   */
  async executeTestRun(testRunId: string, testCaseIds: string[]): Promise<void> {
    try {
      // Update test run status to running
      await pool.query(
        `UPDATE test_runs SET status = 'running', started_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [testRunId]
      );

      // Get test cases details
      const testCasesResult = await pool.query(
        `SELECT tc.*, tf.path as file_path
         FROM test_cases tc
         JOIN test_files tf ON tc.test_file_id = tf.id
         WHERE tc.id = ANY($1)`,
        [testCaseIds]
      );

      const testCases = testCasesResult.rows;

      // Group test cases by file and type
      const testsByFile = this.groupTestsByFile(testCases);

      const allResults: TestCaseResult[] = [];
      const startTime = Date.now();

      // Execute tests by file
      for (const [filePath, cases] of Object.entries(testsByFile)) {
        const testType = cases[0].type;
        let results: TestCaseResult[] = [];

        try {
          if (testType === 'API') {
            results = await this.executeJestTests(filePath, cases);
          } else if (testType === 'LOAD') {
            results = await this.executeK6Tests(filePath, cases);
          } else if (testType === 'UI' || testType === 'E2E') {
            results = await this.executePlaywrightTests(filePath, cases);
          }

          allResults.push(...results);
        } catch (error) {
          console.error(`Error executing tests in ${filePath}:`, error);

          // Mark all cases as failed
          for (const testCase of cases) {
            allResults.push({
              testCaseId: testCase.id,
              status: 'failed',
              duration: 0,
              error: `Failed to execute test: ${error}`,
            });
          }
        }
      }

      const duration = Date.now() - startTime;

      // Save results to database
      await this.saveTestResults(testRunId, allResults, duration);
    } catch (error) {
      console.error('Test execution error:', error);

      // Update test run as failed
      await pool.query(
        `UPDATE test_runs SET status = 'failed', completed_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [testRunId]
      );
    }
  }

  /**
   * Group test cases by file path
   */
  private groupTestsByFile(testCases: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    for (const testCase of testCases) {
      const filePath = testCase.file_path;
      if (!grouped[filePath]) {
        grouped[filePath] = [];
      }
      grouped[filePath].push(testCase);
    }

    return grouped;
  }

  /**
   * Execute Jest tests (API tests)
   */
  private async executeJestTests(filePath: string, testCases: any[]): Promise<TestCaseResult[]> {
    const results: TestCaseResult[] = [];

    try {
      // Convert absolute path to relative path from backend root
      const backendRoot = path.join(__dirname, '../..');
      const relativePath = path.relative(backendRoot, filePath).replace(/\\/g, '/');

      console.log('🧪 Running Jest test:', relativePath);

      // Run Jest with JSON reporter
      const jestCommand = `npx jest "${relativePath}" --json --testLocationInResults`;
      const { stdout, stderr } = await execAsync(jestCommand, {
        cwd: backendRoot,
        timeout: 30000,
      });

      // Parse Jest JSON output
      const jestResults = JSON.parse(stdout);

      // Map Jest results to our test cases
      if (jestResults.testResults && jestResults.testResults[0]) {
        const fileResults = jestResults.testResults[0];

        for (const testCase of testCases) {
          const jestTest = fileResults.assertionResults?.find(
            (result: any) => result.title === testCase.name
          );

          if (jestTest) {
            results.push({
              testCaseId: testCase.id,
              status: jestTest.status === 'passed' ? 'passed' : 'failed',
              duration: jestTest.duration || 0,
              error: jestTest.failureMessages?.join('\n') || undefined,
              stackTrace: jestTest.failureMessages?.join('\n') || undefined,
            });
          } else {
            // Test not found in results
            results.push({
              testCaseId: testCase.id,
              status: 'skipped',
              duration: 0,
            });
          }
        }
      }
    } catch (error: any) {
      // Jest returns non-zero exit code when ANY test fails
      // But we can still parse the JSON output to get individual results
      if (error.stdout) {
        try {
          const jestResults = JSON.parse(error.stdout);
          if (jestResults.testResults && jestResults.testResults[0]) {
            const fileResults = jestResults.testResults[0];

            for (const testCase of testCases) {
              const jestTest = fileResults.assertionResults?.find(
                (result: any) => result.title === testCase.name
              );

              if (jestTest) {
                results.push({
                  testCaseId: testCase.id,
                  status: jestTest.status === 'passed' ? 'passed' : 'failed',
                  duration: jestTest.duration || 0,
                  error: jestTest.failureMessages?.join('\n') || undefined,
                  stackTrace: jestTest.failureMessages?.join('\n') || undefined,
                });
              } else {
                // Test not found in results
                results.push({
                  testCaseId: testCase.id,
                  status: 'failed',
                  duration: 0,
                  error: 'Test not found in Jest output',
                });
              }
            }
          } else {
            // No test results found
            for (const testCase of testCases) {
              results.push({
                testCaseId: testCase.id,
                status: 'failed',
                duration: 0,
                error: 'No test results in Jest output',
              });
            }
          }
        } catch (parseError) {
          // Couldn't parse error output, mark all as failed
          for (const testCase of testCases) {
            results.push({
              testCaseId: testCase.id,
              status: 'failed',
              duration: 0,
              error: `Failed to parse Jest results: ${parseError}`,
              logs: error.stdout || error.stderr,
            });
          }
        }
      } else {
        throw error;
      }
    }

    return results;
  }

  /**
   * Execute K6 tests (Load tests)
   */
  private async executeK6Tests(filePath: string, testCases: any[]): Promise<TestCaseResult[]> {
    const results: TestCaseResult[] = [];

    try {
      // Check if k6 is installed
      try {
        await execAsync('k6 version');
      } catch {
        // K6 not installed, return error
        for (const testCase of testCases) {
          results.push({
            testCaseId: testCase.id,
            status: 'failed',
            duration: 0,
            error: 'K6 is not installed. Please install it from https://k6.io/docs/getting-started/installation/',
          });
        }
        return results;
      }

      // Convert absolute path to relative path from backend root
      const backendRoot = path.join(__dirname, '../..');
      const relativePath = path.relative(backendRoot, filePath).replace(/\\/g, '/');

      console.log('📊 Running K6 test:', relativePath);

      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(`k6 run "${relativePath}" --summary-export=k6-summary.json`, {
        cwd: backendRoot,
        timeout: 180000, // 3 minutes timeout for load tests
      });

      const duration = Date.now() - startTime;
      const logs = stdout + '\n' + stderr;

      // Try to read the summary JSON
      let summary: any = null;
      const summaryPath = path.join(__dirname, '../../k6-summary.json');
      if (fs.existsSync(summaryPath)) {
        summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
        fs.unlinkSync(summaryPath); // Clean up
      }

      // Parse k6 results
      const hasErrors = logs.includes('✗') || stderr.includes('ERRO');
      const status: 'passed' | 'failed' = hasErrors ? 'failed' : 'passed';

      for (const testCase of testCases) {
        results.push({
          testCaseId: testCase.id,
          status,
          duration,
          logs: JSON.stringify(summary || { output: logs }, null, 2),
        });
      }
    } catch (error: any) {
      for (const testCase of testCases) {
        results.push({
          testCaseId: testCase.id,
          status: 'failed',
          duration: 0,
          error: error.message,
          logs: error.stdout || error.stderr || '',
        });
      }
    }

    return results;
  }

  /**
   * Execute Playwright tests (UI and E2E tests)
   */
  private async executePlaywrightTests(filePath: string, testCases: any[]): Promise<TestCaseResult[]> {
    const results: TestCaseResult[] = [];
    
    // Variables declared outside try-catch for access in finally block
    const backendRoot = path.join(__dirname, '../..');
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const tempDir = path.join(backendRoot, `test-results/pw-${uniqueId}`);
    
    try {
      // Convert absolute path to relative path from backend root
      const relativePath = path.relative(backendRoot, filePath).replace(/\\/g, '/');
      
      console.log('🎭 Running Playwright test:', relativePath);

      // Run Playwright with isolated state to prevent conflicts
      // - JSON output goes to stdout (parsed from stdout)
      // - Unique user data directory for browser isolation
      // - Unique debugging port to avoid port conflicts
      const debugPort = 9222 + Math.floor(Math.random() * 1000);
      const playwrightCommand = `npx playwright test "${relativePath}" --reporter=json`;
      
      // Create temp directory for browser user data
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const { stdout, stderr } = await execAsync(playwrightCommand, {
        cwd: backendRoot,
        timeout: 60000, // 1 minute timeout per UI/E2E test file
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large test outputs
        env: {
          ...process.env,
          // Don't override browser path - use default installation
          // Instead, isolate user data directory
          PLAYWRIGHT_TEST_BASE_URL: process.env.PLAYWRIGHT_TEST_BASE_URL || '',
          PWDEBUG: '',
          PW_TEST_SCREENSHOT_NO_FONTS_READY: '1', // Speed up screenshots
        }
      });

      // Parse Playwright JSON output
      const playwrightResults = JSON.parse(stdout);

      // Map Playwright results to our test cases
      if (playwrightResults.suites) {
        console.log('✅ Found suites:', playwrightResults.suites.length);

        // Recursively collect all specs from nested suites
        const collectSpecs = (suites: any[]): any[] => {
          const allSpecs: any[] = [];
          for (const suite of suites) {
            if (suite.specs) {
              allSpecs.push(...suite.specs);
            }
            if (suite.suites) {
              allSpecs.push(...collectSpecs(suite.suites));
            }
          }
          return allSpecs;
        };

        const allSpecs = collectSpecs(playwrightResults.suites);
        console.log('📝 Playwright tests found:', allSpecs.map(s => s.title));
        console.log('🔍 Looking for tests:', testCases.map(tc => tc.name));

        for (const testCase of testCases) {
          const spec = allSpecs.find(s => s.title === testCase.name);

          if (spec) {
            const testRun = spec.tests?.[0];
            const result = testRun?.results?.[0];

            results.push({
              testCaseId: testCase.id,
              status: result?.status === 'passed' ? 'passed' : 'failed',
              duration: result?.duration || 0,
              error: result?.error?.message || undefined,
              stackTrace: result?.error?.stack || undefined,
            });
          } else {
            console.log(`❌ Test "${testCase.name}" not found in Playwright output`);
            results.push({
              testCaseId: testCase.id,
              status: 'failed',
              duration: 0,
              error: `Test not found. Expected: "${testCase.name}". Available: [${allSpecs.map(s => s.title).join(', ')}]`,
            });
          }
        }
      }

      // Cleanup temporary directory
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (error: any) {
      // Playwright returns non-zero exit code when ANY test fails
      // But we can still parse the JSON output to get individual results
      if (error.stdout) {
        try {
          const playwrightResults = JSON.parse(error.stdout);
          
          // Map Playwright results to our test cases (same logic as success case)
          if (playwrightResults.suites) {
            console.log('✅ Found suites (from error):', playwrightResults.suites.length);
            
            // Recursively collect all specs from nested suites
            const collectSpecs = (suites: any[]): any[] => {
              const allSpecs: any[] = [];
              for (const suite of suites) {
                if (suite.specs) {
                  allSpecs.push(...suite.specs);
                }
                if (suite.suites) {
                  allSpecs.push(...collectSpecs(suite.suites));
                }
              }
              return allSpecs;
            };
            
            const allSpecs = collectSpecs(playwrightResults.suites);
            console.log('📝 Playwright tests found (from error):', allSpecs.map(s => s.title));
            console.log('🔍 Looking for tests:', testCases.map(tc => tc.name));
            
            for (const testCase of testCases) {
              const spec = allSpecs.find(s => s.title === testCase.name);
              
              if (spec) {
                const testRun = spec.tests?.[0];
                const result = testRun?.results?.[0];
                
                results.push({
                  testCaseId: testCase.id,
                  status: result?.status === 'passed' ? 'passed' : 'failed',
                  duration: result?.duration || 0,
                  error: result?.error?.message || undefined,
                  stackTrace: result?.error?.stack || undefined,
                });
              } else {
                console.log(`❌ Test "${testCase.name}" not found in Playwright output`);
                results.push({
                  testCaseId: testCase.id,
                  status: 'failed',
                  duration: 0,
                  error: `Test not found. Expected: "${testCase.name}". Available: [${allSpecs.map(s => s.title).join(', ')}]`,
                });
              }
            }
          } else {
            // No suites found, mark all as failed
            for (const testCase of testCases) {
              results.push({
                testCaseId: testCase.id,
                status: 'failed',
                duration: 0,
                error: 'No test results in output',
                logs: error.stdout,
              });
            }
          }
        } catch (parseError) {
          // Couldn't parse JSON, mark all as failed
          for (const testCase of testCases) {
            results.push({
              testCaseId: testCase.id,
              status: 'failed',
              duration: 0,
              error: `Failed to parse test results: ${parseError}`,
              logs: error.stdout || error.stderr,
            });
          }
        }
      } else {
        // No stdout, complete failure
        for (const testCase of testCases) {
          results.push({
            testCaseId: testCase.id,
            status: 'failed',
            duration: 0,
            error: error.message,
          });
        }
      }
    } finally {
      // Ensure cleanup happens even if there's an error
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          console.log('🧹 Cleaned up temp directory:', tempDir);
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup temp directory:', cleanupError);
      }
    }

    return results;
  }

  /**
   * Save test results to database
   */
  private async saveTestResults(testRunId: string, results: TestCaseResult[], totalDuration: number): Promise<void> {
    let testsPassed = 0;
    let testsFailed = 0;
    let testsPending = 0;

    // Save each test result
    for (const result of results) {
      await pool.query(
        `UPDATE test_results
         SET status = $1, duration = $2, error = $3, stack_trace = $4, logs = $5, completed_at = CURRENT_TIMESTAMP
         WHERE test_run_id = $6 AND test_case_id = $7`,
        [
          result.status,
          result.duration,
          result.error || null,
          result.stackTrace || null,
          result.logs || null,
          testRunId,
          result.testCaseId,
        ]
      );

      // Update test case status
      await pool.query(
        `UPDATE test_cases SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [result.status, result.testCaseId]
      );

      if (result.status === 'passed') testsPassed++;
      else if (result.status === 'failed') testsFailed++;
      else testsPending++;
    }

    // Update test run with final results
    const finalStatus = testsFailed > 0 ? 'failed' : 'passed';

    await pool.query(
      `UPDATE test_runs
       SET status = $1, duration = $2, tests_passed = $3, tests_failed = $4, tests_pending = $5, completed_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [finalStatus, totalDuration, testsPassed, testsFailed, testsPending, testRunId]
    );
  }

  /**
   * Execute a single test file
   */
  async executeTestFile(testFileId: string): Promise<void> {
    try {
      // Get test file and its test cases
      const fileResult = await pool.query(
        `SELECT * FROM test_files WHERE id = $1`,
        [testFileId]
      );

      if (fileResult.rows.length === 0) {
        throw new Error('Test file not found');
      }

      const testFile = fileResult.rows[0];

      // Get test cases for this file
      const casesResult = await pool.query(
        `SELECT * FROM test_cases WHERE test_file_id = $1 AND active = true`,
        [testFileId]
      );

      const testCaseIds = casesResult.rows.map((tc: any) => tc.id);

      // Create a test run
      const runId = `test-run-${Date.now()}`;
      const runResult = await pool.query(
        `INSERT INTO test_runs (run_id, name, status, total_tests, user_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [runId, `Run - ${testFile.name}`, 'pending', testCaseIds.length, null]
      );

      const testRunId = runResult.rows[0].id;

      // Create test results entries
      for (const testCaseId of testCaseIds) {
        await pool.query(
          `INSERT INTO test_results (test_run_id, test_case_id, status)
           VALUES ($1, $2, $3)`,
          [testRunId, testCaseId, 'pending']
        );
      }

      // Execute the test run
      await this.executeTestRun(testRunId, testCaseIds);
    } catch (error) {
      console.error('Error executing test file:', error);
      throw error;
    }
  }
}

export const testExecutionService = new TestExecutionService();

