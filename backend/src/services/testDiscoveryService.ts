import fs from 'fs';
import path from 'path';
import pool from '../config/database';

interface DiscoveredTest {
  name: string;
  path: string;
  type: 'API' | 'LOAD' | 'UI' | 'E2E';
  suite: string;
  testCases: {
    name: string;
    description: string;
  }[];
}

export class TestDiscoveryService {
  private testsDirectory: string;

  constructor() {
    this.testsDirectory = path.join(__dirname, '../../tests');
  }

  /**
   * Discover all tests in the tests directory
   */
  async discoverAllTests(): Promise<DiscoveredTest[]> {
    const discoveredTests: DiscoveredTest[] = [];

    // Discover API tests (Jest)
    const apiTests = await this.discoverJestTests('api');
    discoveredTests.push(...apiTests);

    // Discover Load tests (K6)
    const loadTests = await this.discoverK6Tests('load');
    discoveredTests.push(...loadTests);

    // Discover UI tests (Playwright)
    const uiTests = await this.discoverPlaywrightTests('ui');
    discoveredTests.push(...uiTests);

    // Discover E2E tests (Playwright)
    const e2eTests = await this.discoverPlaywrightTests('e2e');
    discoveredTests.push(...e2eTests);

    return discoveredTests;
  }

  /**
   * Discover Jest test files (API tests)
   */
  private async discoverJestTests(type: string): Promise<DiscoveredTest[]> {
    const testsPath = path.join(this.testsDirectory, type);
    const tests: DiscoveredTest[] = [];

    if (!fs.existsSync(testsPath)) {
      return tests;
    }

    const files = fs.readdirSync(testsPath);
    
    for (const file of files) {
      if (file.endsWith('.spec.ts') || file.endsWith('.test.ts')) {
        const filePath = path.join(testsPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const testCases = this.parseJestTestCases(content);
        const suite = this.extractSuiteName(content);

        tests.push({
          name: file,
          path: filePath,
          type: 'API',
          suite: suite || path.basename(file, path.extname(file)),
          testCases,
        });
      }
    }

    return tests;
  }

  /**
   * Discover K6 test files (Load tests)
   */
  private async discoverK6Tests(type: string): Promise<DiscoveredTest[]> {
    const testsPath = path.join(this.testsDirectory, type);
    const tests: DiscoveredTest[] = [];

    if (!fs.existsSync(testsPath)) {
      return tests;
    }

    const files = fs.readdirSync(testsPath);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(testsPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        tests.push({
          name: file,
          path: filePath,
          type: 'LOAD',
          suite: path.basename(file, '.js'),
          testCases: [{
            name: `Load Test - ${path.basename(file, '.js')}`,
            description: this.extractK6Description(content),
          }],
        });
      }
    }

    return tests;
  }

  /**
   * Discover Playwright test files (UI and E2E tests)
   */
  private async discoverPlaywrightTests(type: string): Promise<DiscoveredTest[]> {
    const testsPath = path.join(this.testsDirectory, type);
    const tests: DiscoveredTest[] = [];

    if (!fs.existsSync(testsPath)) {
      return tests;
    }

    const files = fs.readdirSync(testsPath);
    const testType = type === 'ui' ? 'UI' : 'E2E';
    
    for (const file of files) {
      if (file.endsWith('.spec.ts')) {
        const filePath = path.join(testsPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const testCases = this.parsePlaywrightTestCases(content);
        const suite = this.extractPlaywrightSuite(content);

        tests.push({
          name: file,
          path: filePath,
          type: testType as 'UI' | 'E2E',
          suite: suite || path.basename(file, path.extname(file)),
          testCases,
        });
      }
    }

    return tests;
  }

  /**
   * Parse Jest test cases from file content
   */
  private parseJestTestCases(content: string): { name: string; description: string }[] {
    const testCases: { name: string; description: string }[] = [];
    
    // Match test() or it() calls
    const testRegex = /(?:test|it)\s*\(\s*['"`](.*?)['"`]/g;
    let match;

    while ((match = testRegex.exec(content)) !== null) {
      testCases.push({
        name: match[1],
        description: match[1],
      });
    }

    return testCases;
  }

  /**
   * Parse Playwright test cases from file content
   */
  private parsePlaywrightTestCases(content: string): { name: string; description: string }[] {
    const testCases: { name: string; description: string }[] = [];
    
    // Match test() calls
    const testRegex = /test\s*\(\s*['"`](.*?)['"`]/g;
    let match;

    while ((match = testRegex.exec(content)) !== null) {
      testCases.push({
        name: match[1],
        description: match[1],
      });
    }

    return testCases;
  }

  /**
   * Extract suite name from describe() blocks
   */
  private extractSuiteName(content: string): string | null {
    const describeMatch = content.match(/describe\s*\(\s*['"`](.*?)['"`]/);
    return describeMatch ? describeMatch[1] : null;
  }

  /**
   * Extract Playwright suite from test.describe()
   */
  private extractPlaywrightSuite(content: string): string | null {
    const describeMatch = content.match(/test\.describe\s*\(\s*['"`](.*?)['"`]/);
    return describeMatch ? describeMatch[1] : null;
  }

  /**
   * Extract description from K6 test comments
   */
  private extractK6Description(content: string): string {
    const commentMatch = content.match(/\/\/\s*(.+)/);
    if (commentMatch) {
      return commentMatch[1];
    }
    
    // Try to extract from export const options
    const stagesMatch = content.match(/stages:\s*\[/);
    if (stagesMatch) {
      return 'Performance load test with staged virtual users';
    }
    
    return 'K6 load test';
  }

  /**
   * Register discovered tests in the database
   */
  async registerTests(tests: DiscoveredTest[]): Promise<void> {
    for (const test of tests) {
      try {
        // Check if test file already exists
        const existingFile = await pool.query(
          'SELECT id FROM test_files WHERE path = $1',
          [test.path]
        );

        let testFileId: string;

        if (existingFile.rows.length > 0) {
          // Update existing test file
          testFileId = existingFile.rows[0].id;
          await pool.query(
            `UPDATE test_files 
             SET name = $1, type = $2, suite = $3, modified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [test.name, test.type, test.suite, testFileId]
          );

          // Delete old test cases for this file
          await pool.query(
            'DELETE FROM test_cases WHERE test_file_id = $1',
            [testFileId]
          );
        } else {
          // Insert new test file
          const fileResult = await pool.query(
            `INSERT INTO test_files (name, path, type, suite, status, modified_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
             RETURNING id`,
            [test.name, test.path, test.type, test.suite, 'pending']
          );
          testFileId = fileResult.rows[0].id;
        }

        // Insert test cases
        for (const testCase of test.testCases) {
          await pool.query(
            `INSERT INTO test_cases (test_file_id, name, description, type, file_path, suite, status, active, modified_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
            [
              testFileId,
              testCase.name,
              testCase.description,
              test.type,
              test.path,
              test.suite,
              'pending',
              true,
            ]
          );
        }
      } catch (error) {
        console.error(`Error registering test ${test.name}:`, error);
      }
    }
  }

  /**
   * Discover and register all tests
   */
  async discoverAndRegisterAllTests(): Promise<{ success: boolean; count: number; tests: DiscoveredTest[] }> {
    try {
      const tests = await this.discoverAllTests();
      await this.registerTests(tests);
      
      return {
        success: true,
        count: tests.length,
        tests,
      };
    } catch (error) {
      console.error('Error discovering and registering tests:', error);
      throw error;
    }
  }
}

export const testDiscoveryService = new TestDiscoveryService();

