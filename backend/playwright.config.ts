import { defineConfig, devices } from '@playwright/test';

// @ts-ignore - process is available in Node.js environment
const isCI = process?.env?.CI;

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/ui/**/*.spec.ts', '**/e2e/**/*.spec.ts'],
  fullyParallel: false, // Changed to false to prevent test conflicts within a file
  forbidOnly: !!isCI,
  retries: 0,
  workers: 1, // Run tests sequentially within each Playwright process
  reporter: [
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['html', { outputFolder: 'test-results/html' }]
  ],
  
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Add some randomness to avoid port conflicts when multiple browsers launch
    launchOptions: {
      slowMo: 50, // Add small delay to reduce resource contention
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Each browser instance gets isolated context
        contextOptions: {
          ignoreHTTPSErrors: true,
        },
      },
    },
  ],

  timeout: 30000,
  // Global timeout for the entire test run
  globalTimeout: 60000 * 5, // 5 minutes
});

