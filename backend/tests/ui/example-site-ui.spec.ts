import { test, expect } from '@playwright/test';

test.describe('Example.com UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com');
  });

  test('should load the page successfully', async ({ page }) => {
    await expect(page).toHaveTitle('Example Domain');
  });

  test('should display main heading', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Example Domain');
  });

  test('should display paragraph content', async ({ page }) => {
    const paragraph = page.locator('p').first();
    await expect(paragraph).toBeVisible();
    await expect(paragraph).toContainText('This domain is for use in documentation examples');
  });

  test('should have "More information" link', async ({ page }) => {
    const link = page.locator('a');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('Learn more');
    await expect(link).toHaveAttribute('href', 'https://iana.org/domains/example');
  });

  test('should navigate to IANA page when clicking link', async ({ page }) => {
    const link = page.locator('a');
    await link.click();
    
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/iana\.org/);
  });

  test('should have proper page structure', async ({ page }) => {
    // Check for body
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for div
    const div = page.locator('div');
    await expect(div).toBeVisible();
  });

  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    const paragraph = page.locator('p').first();
    await expect(paragraph).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.reload();
    expect(errors).toHaveLength(0);
  });
});
