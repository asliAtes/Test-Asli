import { Given, When, Then, After } from '@cucumber/cucumber';
import { expect } from 'chai';
import { RcsTestContext, RCS_SELECTORS } from '../common/rcs-test-context';
import { UIService } from '../../../../../../common/services/ui.service';
import { chromium, Page, Browser } from '@playwright/test';

let testContext: RcsTestContext = {};
let page: Page;
let browser: Browser;

Given('I am on the operational reports page', async function () {
    browser = await chromium.launch();
    page = await browser.newPage();
    testContext.services = {
        ui: new UIService(page)
    };
    await testContext.services.ui?.navigateTo('reports/operational');
    await page.waitForSelector(RCS_SELECTORS.REPORTS.OPERATIONAL.PAGE);
});

When('I view the RCS metrics section', async function () {
    await page.waitForSelector(RCS_SELECTORS.REPORTS.OPERATIONAL.RCS_SECTION);
});

When('I select the date range {string} to {string}', async function (startDate: string, endDate: string) {
    await page.click(RCS_SELECTORS.REPORTS.OPERATIONAL.DATE_PICKER);
    await page.fill('[data-testid="start-date"]', startDate);
    await page.fill('[data-testid="end-date"]', endDate);
    await page.click(RCS_SELECTORS.REPORTS.OPERATIONAL.APPLY_FILTER);
});

Then('I should see the RCS SMS count {string} displayed correctly', async function (expectedCount: string) {
    const countElement = await page.waitForSelector(RCS_SELECTORS.REPORTS.OPERATIONAL.RCS_COUNT);
    const displayedCount = await countElement.textContent();
    expect(displayedCount).to.equal(expectedCount);
});

Then('the delivery status chart should show:', async function (dataTable: any) {
    const expectedData = dataTable.hashes()[0];
    const chartElement = await page.waitForSelector(RCS_SELECTORS.REPORTS.OPERATIONAL.DELIVERY_CHART);
    const chartData = await chartElement.evaluate((el) => {
        // Get chart data from the element
        return JSON.parse(el.getAttribute('data-chart') || '{}');
    });
    
    expect(chartData[expectedData.status]).to.equal(parseInt(expectedData.count));
});

When('I navigate to the weekly reports page', async function () {
    await testContext.services.ui?.navigateTo('reports/weekly');
    await page.waitForSelector(RCS_SELECTORS.REPORTS.WEEKLY.PAGE);
});

Then('the weekly trend chart should include today\'s data', async function () {
    const trendChart = await page.waitForSelector(RCS_SELECTORS.REPORTS.WEEKLY.TREND_CHART);
    const chartData = await trendChart.evaluate((el) => {
        return JSON.parse(el.getAttribute('data-chart') || '{}');
    });
    
    const today = new Date().toISOString().split('T')[0];
    expect(chartData[today]).to.exist;
});

When('I navigate to the operational reports page', async function() {
    await page.goto('/reports/operational');
    await page.waitForSelector(RCS_SELECTORS.REPORTS.OPERATIONAL.RCS_COUNT);
});

After(async function () {
    if (browser) {
        await browser.close();
    }
}); 