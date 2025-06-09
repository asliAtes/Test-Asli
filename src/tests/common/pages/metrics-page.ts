import { Page, expect } from '@playwright/test';

export class RCSMetricsPage {
    private page: Page;
    
    // Tab selectors
    readonly rcsTabSelector = 'button.nav-link[ngbnavlink][role="tab"]:has-text("RCS")';
    readonly smsTabSelector = 'button.nav-link[ngbnavlink][role="tab"]:has-text("SMS")';
    readonly emailTabSelector = 'button.nav-link[ngbnavlink][role="tab"]:has-text("Email")';
    
    // Metrics selectors
    readonly metricsContainer = '[data-testid="metrics-container"]';
    readonly tableViewButton = '[data-testid="table-view-button"]';
    readonly graphViewButton = '[data-testid="graph-view-button"]';
    readonly dateRangePicker = '[data-testid="date-range-picker"]';
    readonly exportButton = '[data-testid="export-button"]';
    readonly errorMessage = '[data-testid="error-message"]';

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToRCSTab(): Promise<void> {
        try {
            // Wait for the page to be fully loaded
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForLoadState('domcontentloaded');
            
            console.log('Waiting for RCS tab to be visible...');
            
            // First check if the tab exists
            const tabExists = await this.page.locator(this.rcsTabSelector).count() > 0;
            if (!tabExists) {
                console.log('RCS tab not found, taking screenshot...');
                await this.page.screenshot({ path: 'rcs-tab-not-found.png' });
                throw new Error('RCS tab not found in the page');
            }
            
            // Wait for the tab to be visible and clickable
            const tab = await this.page.locator(this.rcsTabSelector).first();
            await tab.waitFor({ state: 'visible', timeout: 60000 }); // Increased timeout to 60 seconds
            
            // Ensure the tab is in the viewport
            await tab.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(2000); // Small wait after scroll
            
            console.log('Clicking RCS tab...');
            await tab.click();
            
            // Wait for metrics container with increased timeout
            console.log('Waiting for metrics container...');
            await this.page.waitForSelector(this.metricsContainer, { 
                state: 'visible', 
                timeout: 60000 
            });
            
            // Verify that we're actually on the RCS tab
            const isSelected = await tab.getAttribute('aria-selected');
            if (isSelected !== 'true') {
                console.log('RCS tab not selected after click, taking screenshot...');
                await this.page.screenshot({ path: 'rcs-tab-not-selected.png' });
                throw new Error('Failed to select RCS tab');
            }
            
            console.log('Successfully navigated to RCS tab');
            
        } catch (error) {
            console.error('Error navigating to RCS tab:', error.message);
            await this.page.screenshot({ path: 'rcs-tab-navigation-error.png' });
            throw error;
        }
    }

    async clickTab(tabName: string): Promise<void> {
        const tab = this.page.getByRole('tab', { name: tabName });
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded();
        await tab.click();
        await expect(tab).toHaveAttribute('aria-selected', 'true');
        await this.page.waitForLoadState('networkidle');
    }

    async selectView(view: 'table' | 'graph'): Promise<void> {
        const button = view === 'table' ? this.tableViewButton : this.graphViewButton;
        await this.page.click(button);
        await this.page.waitForLoadState('networkidle');
    }

    async selectTimeframe(timeframe: string) {
        await this.page.click('[data-testid="timeframe-selector"]');
        await this.page.click(`[data-testid="timeframe-${timeframe}"]`);
    }

    async setCustomDateRange(startDate: string, endDate: string) {
        await this.page.click('[data-testid="timeframe-Custom Range"]');
        await this.page.fill('[data-testid="start-date"]', startDate);
        await this.page.fill('[data-testid="end-date"]', endDate);
        await this.page.click('[data-testid="apply-date-range"]');
    }

    async toggleBreakdownView() {
        await this.page.click('[data-testid="view-breakdown"]');
        await this.page.waitForSelector('[data-testid="breakdown-chart"]');
    }

    async exportMetrics(format: 'CSV' | 'PDF'): Promise<void> {
        await this.page.click(this.exportButton);
        await this.page.click(`[data-testid="${format.toLowerCase()}-export"]`);
        // Wait for download to start
        await this.page.waitForEvent('download');
    }

    async hasErrors(): Promise<boolean> {
        try {
            const errorElement = this.page.locator(this.errorMessage);
            return await errorElement.isVisible({ timeout: 5000 });
        } catch {
            return false;
        }
    }

    async getMetricsData(): Promise<{ [key: string]: string }> {
        const metrics = await this.page.locator('[data-testid="metric-value"]').all();
        const result: { [key: string]: string } = {};
        
        for (const metric of metrics) {
            const key = await metric.getAttribute('data-metric-name') || '';
            const value = await metric.textContent() || '';
            if (key) result[key] = value.trim();
        }
        
        return result;
    }

    async getGraphData() {
        const graph = await this.page.locator('[data-testid="metrics-graph"]').first();
        const series = await this.page.locator('[data-testid="graph-series"]').all();
        const dataPoints = await this.page.locator('circle').all();
        const legendItems = await this.page.locator('[data-testid="graph-legend-item"]').all();
        
        return {
            series: series,
            dataPoints: dataPoints,
            legend: legendItems
        };
    }
} 