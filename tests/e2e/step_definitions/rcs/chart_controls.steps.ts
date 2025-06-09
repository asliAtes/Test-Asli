import { Then, When } from '@cucumber/cucumber';
import { expect } from 'chai';
import { Page } from 'playwright';

let page: Page;

Then('I should be able to select different timeframes', async function() {
    page = this.page;
    const selector = await page.locator('[data-testid="timeframe-selector"]');
    await expect(await selector.isEnabled()).to.be.true;
});

Then('I should be able to toggle between Column and Line views', async function() {
    const toggle = await page.locator('[data-testid="view-type-toggle"]');
    await expect(await toggle.isEnabled()).to.be.true;
});

Then('I should be able to toggle between # and % views', async function() {
    const toggle = await page.locator('[data-testid="metric-type-toggle"]');
    await expect(await toggle.isEnabled()).to.be.true;
});

When('I select {string} timeframe', async function(timeframe: string) {
    await page.click('[data-testid="timeframe-selector"]');
    await page.click(`text=${timeframe}`);
});

Then('the chart should update with {int} days of data', async function(days: number) {
    await page.waitForSelector('[data-testid="chart-data-point"]');
    const dataPoints = await page.locator('[data-testid="chart-data-point"]').count();
    expect(dataPoints).to.equal(days);
});

When('I toggle to {string} view', async function(viewType: string) {
    await page.click(`[data-testid="${viewType.toLowerCase()}-view-button"]`);
});

Then('the chart should display as a line graph', async function() {
    const chart = await page.locator('[data-testid="line-chart"]');
    await expect(await chart.isVisible()).to.be.true;
});

Then('the chart should display as a column graph', async function() {
    const chart = await page.locator('[data-testid="column-chart"]');
    await expect(await chart.isVisible()).to.be.true;
}); 