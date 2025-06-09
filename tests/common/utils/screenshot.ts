import { Page } from '@playwright/test';
import path from 'path';

export async function takeScreenshot(page: Page, name: string) {
  const screenshotPath = path.join('screenshots', `${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
} 