import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { Page } from 'playwright';

let page: Page;

Given('I am logged in to the application', async function() {
    page = this.page;
    // Login implementation will be added later
});

Given('I navigate to Message Reports page', async function() {
    await page.goto('/message-reports');
});

When('I click on the {string} tab', async function(tabName: string) {
    await page.click(`text=${tabName}`);
});

Then('the {string} tab should be visible', async function(tabName: string) {
    const tab = await page.locator(`[data-testid="${tabName.toLowerCase()}-tab"]`);
    await expect(await tab.isVisible()).to.be.true;
});

Then('the {string} tab should be active', async function(tabName: string) {
    const tab = await page.locator(`[data-testid="${tabName.toLowerCase()}-tab"]`);
    const isActive = await tab.getAttribute('aria-selected');
    expect(isActive).to.equal('true');
});

Then('RCS Delivery Metrics section should be displayed', async function() {
    const section = await page.locator('[data-testid="rcs-delivery-metrics"]');
    await expect(await section.isVisible()).to.be.true;
});

Then('the tab should load within {int} seconds', async function(seconds: number) {
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="rcs-tab-content"]');
    const loadTime = Date.now() - startTime;
    expect(loadTime).to.be.lessThan(seconds * 1000);
});

Then('no errors should be displayed', async function() {
    const errorMessages = await page.locator('[data-testid="error-message"]').count();
    expect(errorMessages).to.equal(0);
}); 