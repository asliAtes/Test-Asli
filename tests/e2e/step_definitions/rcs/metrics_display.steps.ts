import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { Page } from 'playwright';

let page: Page;

Then('I should see RCS Delivery Metrics section', async function() {
    page = this.page;
    const section = await page.locator('[data-testid="rcs-delivery-metrics"]');
    await expect(await section.isVisible()).to.be.true;
});

Then('I should see the timeframe selector', async function() {
    const selector = await page.locator('[data-testid="timeframe-selector"]');
    await expect(await selector.isVisible()).to.be.true;
});

Then('I should see the Delivered metric card', async function() {
    const card = await page.locator('[data-testid="delivered-metric-card"]');
    await expect(await card.isVisible()).to.be.true;
});

Then('I should see SMS failover metrics section', async function() {
    const section = await page.locator('[data-testid="sms-failover-metrics"]');
    await expect(await section.isVisible()).to.be.true;
});

Then('the section should contain timeframe selector', async function() {
    const selector = await page.locator('[data-testid="failover-timeframe-selector"]');
    await expect(await selector.isVisible()).to.be.true;
});

Then('the section should show Total metrics', async function() {
    const metrics = await page.locator('[data-testid="total-metrics"]');
    await expect(await metrics.isVisible()).to.be.true;
}); 