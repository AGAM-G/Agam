import { test, expect } from '@playwright/test';

test.describe('Wikipedia E2E - Search Flow', () => {
  test('complete search and navigation flow', async ({ page }) => {
    // Step 1: Go to Wikipedia homepage
    await page.goto('https://www.wikipedia.org');
    await expect(page).toHaveTitle(/Wikipedia/);
    
    // Step 2: Select English Wikipedia
    await page.locator('#js-link-box-en').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/en\.wikipedia\.org/);
    
    // Step 3: Search for a topic
    const searchInput = page.locator('input[name="search"]').first();
    await searchInput.fill('Automation testing');
    await searchInput.press('Enter');
    
    // Step 4: Wait for search results
    await page.waitForLoadState('networkidle');
    
    // Step 5: Verify we're on a results or article page
    const url = page.url();
    expect(url).toContain('wikipedia.org');
    
    // Step 6: Check page has content
    const content = page.locator('#content');
    await expect(content).toBeVisible();
  });

  test('multi-language navigation flow', async ({ page }) => {
    // Start at main Wikipedia page
    await page.goto('https://www.wikipedia.org');
    
    // Navigate to Spanish
    await page.locator('#js-link-box-es').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/es\.wikipedia\.org/);
    
    // Verify Spanish page loaded
    const spanishContent = page.locator('#content, body');
    await expect(spanishContent).toBeVisible();
    
    // Go back and navigate to German
    await page.goto('https://www.wikipedia.org');
    await page.locator('#js-link-box-de').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/de\.wikipedia\.org/);
    
    // Verify German page loaded
    const germanContent = page.locator('#content, body');
    await expect(germanContent).toBeVisible();
    
    // Verify both navigations worked
    expect(page.url()).toContain('de.wikipedia.org');
  });
});

test.describe('Wikipedia E2E - Article Interaction', () => {
  test('read article and navigate sections', async ({ page }) => {
    // Navigate to a specific article
    await page.goto('https://en.wikipedia.org/wiki/Software_testing');
    
    // Verify article loaded
    await expect(page.locator('#firstHeading')).toContainText('Software testing');
    
    // Check table of contents exists
    const toc = page.locator('#toc, .vector-toc');
    await expect(toc).toBeVisible();
    
    // Scroll through article
    await page.evaluate(() => window.scrollBy(0, 500));
    
    // Check for references section
    await page.evaluate(() => {
      const referencesHeading = Array.from(document.querySelectorAll('h2'))
        .find(h => h.textContent?.includes('References'));
      if (referencesHeading) {
        referencesHeading.scrollIntoView();
      }
    });
    
    // Verify we're still on the same article
    expect(page.url()).toContain('Software_testing');
  });

  test('use random article feature', async ({ page }) => {
    await page.goto('https://en.wikipedia.org/wiki/Main_Page');
    
    // Look for random article link (may vary by Wikipedia version)
    const randomLink = page.locator('a:has-text("Random article")').first();
    
    if (await randomLink.isVisible()) {
      await randomLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify we landed on an article page
      const heading = page.locator('#firstHeading');
      await expect(heading).toBeVisible();
    }
  });
});

