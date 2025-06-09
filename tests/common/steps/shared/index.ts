import { defineCommonAssertions } from './common_assertions';
import { Before } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import { CustomWorld } from '../../helpers/world';

/**
 * Initialize all shared step definitions
 * This should be called only once, from the main support file
 */
export function initializeSharedSteps(): void {
  // Initialize common assertions
  defineCommonAssertions();
  
  // Add other shared step definitions here as needed

  Before(async function(this: CustomWorld) {
    const browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false'
    });
    const context = await browser.newContext();
    this.page = await context.newPage();
  });
} 