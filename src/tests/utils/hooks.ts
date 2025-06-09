// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

import { Before, After } from '@cucumber/cucumber';
import { chromium, firefox, Browser, BrowserContext, Page } from '@playwright/test';
import { KredosWorld } from './helpers/world';
import { RCSTestHelper } from './helpers/rcs-test-helper';
import { rcsReportMocks, mockApi } from '../mocks/api.mock';

// Set up browser options
async function setupBrowser(browserType: 'chromium' | 'firefox'): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
  const browser = browserType === 'firefox' ? await firefox.launch() : await chromium.launch({
    headless: process.env.HEADLESS === 'true'
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  return { browser, context, page };
}

// Set up browser and page objects before each scenario
Before({ tags: '@UI' }, async function(this: KredosWorld) {
  const browserType = process.env.BROWSER === 'firefox' ? 'firefox' : 'chromium';
  const { browser, context, page } = await setupBrowser(browserType);

  // Store browser objects in world
  this.browser = browser;
  this.context = context;
  this.page = page;

  // Set up request object for API calls
  this.request = await context.request;
});

// Clean up browser after UI tests
After({ tags: '@UI' }, async function(this: KredosWorld) {
  if (this.browser) {
    await this.browser.close();
  }
});

// Clean up after database tests
After({ tags: '@database' }, async function(this: KredosWorld) {
  if (this.dbConnection) {
    await this.dbConnection.disconnect();
  }
});

// RCS Report specific hooks
Before('@rcs-reports', async function() {
    // Initialize RCS test helper
    this.rcsTestHelper = new RCSTestHelper();
    
    // Setup test data for UI/DB tests
    if (this.currentTest.tags.includes('@ui') || this.currentTest.tags.includes('@database')) {
        await this.rcsTestHelper.setupTestData();
    }
    
    // Setup API mocks for API tests
    if (this.currentTest.tags.includes('@api')) {
        mockApi.onGet('/get-mabOperationalReportData').reply(200, rcsReportMocks.dailyReport.success);
        mockApi.onGet('/get-mabReportsData').reply(200, rcsReportMocks.weeklyReport.success);
    }

    console.log(`🚀 Starting RCS Report test: ${this.currentTest.title}`);
});

After('@rcs-reports', async function() {
    // Cleanup test data
    if (this.rcsTestHelper) {
        await this.rcsTestHelper.cleanupTestData();
        await this.rcsTestHelper.disconnect();
    }
    
    // Reset API mocks
    if (this.currentTest.tags.includes('@api')) {
        mockApi.reset();
    }

    console.log(`✅ Completed RCS Report test: ${this.currentTest.title}`);
});

// Specific hooks for staging environment
Before('@staging', function() {
    if (!process.env.STAGING_URL) {
        throw new Error('STAGING_URL environment variable is not set');
    }
    this.baseUrl = process.env.STAGING_URL;
}); 