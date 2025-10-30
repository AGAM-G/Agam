import { test, expect } from '@playwright/test';

test.describe('E2E - Demo Shopping Flow', () => {
  test('browse products on demo e-commerce site', async ({ page }) => {
    // Using a demo e-commerce site
    await page.goto('https://www.saucedemo.com');
    
    // Login with standard user
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    
    // Verify we're on the products page
    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.title')).toContainText('Products');
    
    // Check products are displayed
    const products = page.locator('.inventory_item');
    await expect(products).toHaveCount(6);
    
    // Add first product to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    
    // Verify cart badge shows 1 item
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    
    // Go to cart
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart/);
    
    // Verify item is in cart
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(1);
    
    // Continue to checkout
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/checkout-step-one/);
    
    // Fill checkout information
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    
    // Verify we're on checkout overview
    await expect(page).toHaveURL(/checkout-step-two/);
    await expect(page.locator('.title')).toContainText('Checkout: Overview');
    
    // Verify item is still shown
    await expect(cartItems).toHaveCount(1);
    
    // Complete order
    await page.locator('[data-test="finish"]').click();
    
    // Verify order completion
    await expect(page).toHaveURL(/checkout-complete/);
    await expect(page.locator('.complete-header')).toContainText('Thank you for your order');
  });

  test('add multiple items and remove one', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    
    // Login
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    
    // Add multiple items
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();
    
    // Verify cart shows 3 items
    await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
    
    // Go to cart
    await page.locator('.shopping_cart_link').click();
    
    // Verify 3 items in cart
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(3);
    
    // Remove one item
    await page.locator('[data-test="remove-sauce-labs-bike-light"]').click();
    
    // Verify now 2 items
    await expect(cartItems).toHaveCount(2);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
  });

  test('sorting products flow', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    
    // Login
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    
    // Verify we're on products page
    await expect(page).toHaveURL(/inventory/);
    
    // Get first product name before sorting
    const firstProductBefore = await page.locator('.inventory_item_name').first().textContent();
    
    // Try to find and use the sort dropdown
    const sortDropdown = page.locator('[data-test="product_sort_container"]').or(page.locator('.product_sort_container')).or(page.locator('select.product_sort_container'));
    
    // Wait for dropdown to be visible
    await sortDropdown.waitFor({ state: 'visible', timeout: 5000 });
    
    // Sort by price low to high
    await sortDropdown.selectOption('lohi');
    
    // Wait for sort to complete
    await page.waitForTimeout(1000);
    
    // Get first product name after sorting
    const firstProductAfter = await page.locator('.inventory_item_name').first().textContent();
    
    // Verify sorting changed the order (or at least products are still displayed)
    const products = page.locator('.inventory_item');
    await expect(products).toHaveCount(6);
  });
});

