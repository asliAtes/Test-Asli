import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { test } from '../support/test-context';

// Background steps
Given('I am logged in to the application', async function () {
    // TODO: Implement login logic
    // This is a placeholder - implement actual login steps
    await test.page.goto(process.env.BASE_URL || 'http://localhost:3000');
    // Add login steps here
});

Given('I navigate to Message Reports page', async function () {
    // TODO: Implement navigation logic
    await test.page.click('text=Message Reports');
    // Wait for the page to load
    await test.page.waitForSelector('.message-reports-page');
});

// Tab interaction steps
When('I click on the RCS tab', async function () {
    await test.page.click('text=RCS');
    // Wait for tab content to load
    await test.page.waitForSelector('.rcs-tab-content');
});

When('I click on the SMS tab', async function () {
    await test.page.click('text=SMS');
    await test.page.waitForSelector('.sms-tab-content');
});

When('I click on the Email tab', async function () {
    await test.page.click('text=Email');
    await test.page.waitForSelector('.email-tab-content');
});

// Verification steps
Then('the RCS tab should be visible', async function () {
    const isVisible = await test.page.isVisible('text=RCS');
    expect(isVisible).toBe(true);
});

Then('RCS Delivery Metrics section should be displayed', async function () {
    const isVisible = await test.page.isVisible('.rcs-delivery-metrics');
    expect(isVisible).toBe(true);
});

Then('the {word} tab should be active', async function (tabName) {
    const activeTab = await test.page.getAttribute(`[data-tab="${tabName}"]`, 'aria-selected');
    expect(activeTab).toBe('true');
});

Then('I should see RCS Delivery Metrics section', async function () {
    await test.page.waitForSelector('.rcs-delivery-metrics');
    const isVisible = await test.page.isVisible('.rcs-delivery-metrics');
    expect(isVisible).toBe(true);
});

Then('I should see the timeframe selector', async function () {
    const isVisible = await test.page.isVisible('.timeframe-selector');
    expect(isVisible).toBe(true);
});

Then('I should see the Delivered metric card', async function () {
    const isVisible = await test.page.isVisible('.delivered-metric-card');
    expect(isVisible).toBe(true);
});

Then('I should be able to select different timeframes', async function () {
    await test.page.click('.timeframe-selector');
    const options = await test.page.$$('.timeframe-option');
    expect(options.length).toBeGreaterThan(0);
});

Then('I should be able to toggle between Column and Line views', async function () {
    const toggleButton = await test.page.isVisible('.view-toggle');
    expect(toggleButton).toBe(true);
});

Then('I should be able to toggle between # and % views', async function () {
    const toggleButton = await test.page.isVisible('.metric-type-toggle');
    expect(toggleButton).toBe(true);
});

Then('the tab should load within {int} seconds', async function (seconds) {
    const startTime = Date.now();
    await test.page.waitForSelector('.rcs-tab-content');
    const loadTime = (Date.now() - startTime) / 1000;
    expect(loadTime).toBeLessThan(seconds);
});

Then('no errors should be displayed', async function () {
    const errorMessages = await test.page.$$('.error-message');
    expect(errorMessages.length).toBe(0);
});

Then('I should see SMS failover metrics section', async function () {
    const isVisible = await test.page.isVisible('.sms-failover-metrics');
    expect(isVisible).toBe(true);
});

Then('the section should contain timeframe selector', async function () {
    const isVisible = await test.page.isVisible('.sms-failover-timeframe-selector');
    expect(isVisible).toBe(true);
});

Then('the section should show Total metrics', async function () {
    const isVisible = await test.page.isVisible('.total-metrics');
    expect(isVisible).toBe(true);
}); 