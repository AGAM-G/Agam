import { test, expect } from '@playwright/test';

test.describe('Wikipedia UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.wikipedia.org');
  });

  test('should display main page with logo', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Wikipedia/);
    
    // Check logo is visible
    const logo = page.locator('.central-featured-logo');
    await expect(logo).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    // Check search input exists
    const searchInput = page.locator('#searchInput');
    await expect(searchInput).toBeVisible();
    
    // Type in search
    await searchInput.fill('Playwright');
    
    // Check search suggestions appear
    const suggestions = page.locator('.suggestion-link');
    await expect(suggestions.first()).toBeVisible({ timeout: 5000 });
  });

  test('should switch languages', async ({ page }) => {
    // Find and click on Spanish language
    const spanishLink = page.locator('#js-link-box-es');
    await expect(spanishLink).toBeVisible();
    
    await spanishLink.click();
    
    // Verify navigation to Spanish Wikipedia
    await expect(page).toHaveURL(/es\.wikipedia\.org/);
  });

  test('should display multiple language options', async ({ page }) => {
    // Check for major languages
    const languages = [
      '#js-link-box-en',  // English
      '#js-link-box-es',  // Spanish
      '#js-link-box-de',  // German
      '#js-link-box-fr',  // French
      '#js-link-box-ja',  // Japanese
    ];
    
    for (const lang of languages) {
      await expect(page.locator(lang)).toBeVisible();
    }
  });

  test('should have footer links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check for footer presence
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

