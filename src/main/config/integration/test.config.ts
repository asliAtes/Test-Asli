import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const TEST_CONFIG = {
  // Test timeouts
  defaultTimeout: 30000,
  navigationTimeout: 15000,

  // Environment URLs
  baseURL: process.env.BASE_URL || 'https://staging.kredos.com',
  apiBaseURL: process.env.API_BASE_URL || 'https://api-staging.kredos.com',

  // Xray configuration
  xray: {
    clientId: process.env.XRAY_CLIENT_ID,
    clientSecret: process.env.XRAY_CLIENT_SECRET,
    uploadResults: process.env.UPLOAD_TO_XRAY === 'true',
  },

  // Browser configuration
  browser: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
  },

  // Screenshot configuration
  screenshot: {
    takeOnFailure: true,
    directory: 'screenshots',
  },

  // Report configuration
  report: {
    outputDir: 'reports',
    html: true,
    json: true,
  },
};

export default defineConfig({
  testDir: '../tests',
  timeout: TEST_CONFIG.defaultTimeout,
  expect: {
    timeout: TEST_CONFIG.navigationTimeout,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: TEST_CONFIG.report.outputDir }],
    ['json', { outputFile: `${TEST_CONFIG.report.outputDir}/test-results.json` }],
  ],
  use: {
    baseURL: TEST_CONFIG.baseURL,
    trace: 'on-first-retry',
    headless: TEST_CONFIG.browser.headless,
    screenshot: 'only-on-failure',
  },
}); 