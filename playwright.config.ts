import { PlaywrightTestConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Default environment variables if not provided
const BASE_URL = process.env.BASE_URL || 'https://uscc-stg.kredosai.com';
const USERNAME = process.env.ADMIN_USERNAME || 'usccdevuser';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Kredos@1234';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e/features',
  timeout: 60000, // Global timeout for tests: 1 minute
  retries: 1,     // Retry failed tests once
  workers: 1,     // Run tests one at a time (increase for parallel tests)
  
  use: {
    baseURL: BASE_URL,
    headless: process.env.HEADLESS === 'true',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    
    // Authentication state is now created, enabling it
    storageState: 'playwright/.auth/user.json',
  },
  
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'WebKit',
      use: { browserName: 'webkit' },
    },
  ],
  
  outputDir: 'test-results/',
  
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
};

export default config; 