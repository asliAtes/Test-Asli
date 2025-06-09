import { chromium, Browser, BrowserContext, Page } from '@playwright/test';

export async function setupAuth(): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
  // Launch browser
  const browser = await chromium.launch({
    headless: process.env.HEADLESS === 'true'
  });

  // Create context
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to login page
  await page.goto(process.env.BASE_URL || 'https://uscc-stg.kredosai.com/');

  // Fill login form
  await page.fill('input[name="username"]', process.env.ADMIN_USERNAME || 'usccdevuser');
  await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || 'Kredos@1234');
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForLoadState('networkidle');

  // Save authentication state
  await context.storageState({ path: 'playwright/.auth/user.json' });

  return { browser, context, page };
} 