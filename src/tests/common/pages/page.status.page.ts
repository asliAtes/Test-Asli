import { Page, Locator } from '@playwright/test';

export class StatusPage {
  readonly page: Page;
  readonly statusTab: Locator;
  readonly graphs: Locator;
  readonly legend: Locator;
  readonly timeframeDropdown: Locator;
  readonly customDatePicker: Locator;
  readonly applyButton: Locator;
  readonly exportButton: Locator;
  readonly dailyDeliveryGraph: Locator;
  readonly statusBreakdownGraph: Locator;

  constructor(page: Page) {
    this.page = page;
    this.statusTab = page.locator('button:has-text("Status")');
    this.graphs = page.locator('.chart-container');
    this.legend = page.locator('.chart-legend');
    this.timeframeDropdown = page.locator('select[aria-label="Select a Timeframe"]');
    this.customDatePicker = page.locator('.date-picker-container');
    this.applyButton = page.locator('button:has-text("Apply")');
    this.exportButton = page.locator('button:has-text("Export Data")');
    this.dailyDeliveryGraph = page.locator('.daily-delivery-chart');
    this.statusBreakdownGraph = page.locator('.status-breakdown-chart');
  }

  async clickStatusTab() {
    await this.statusTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectTimeframe(timeframe: string) {
    await this.timeframeDropdown.selectOption({ label: timeframe });
    await this.page.waitForLoadState('networkidle');
  }

  async selectCustomDateRange(startDate: string, endDate: string) {
    await this.timeframeDropdown.selectOption({ label: 'Custom' });
    await this.page.locator('input[name="startDate"]').fill(startDate);
    await this.page.locator('input[name="endDate"]').fill(endDate);
    await this.applyButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getLegendItems(): Promise<string[]> {
    const items = await this.legend.locator('.legend-item').all();
    const labels: string[] = [];
    
    for (const item of items) {
      const text = await item.textContent();
      if (text) labels.push(text.trim());
    }
    
    return labels;
  }

  async toggleLegendItem(itemName: string) {
    await this.legend.locator(`.legend-item:has-text("${itemName}")`).click();
    await this.page.waitForTimeout(500); // Wait for chart animation
  }

  async isDataSeriesVisible(seriesName: string): Promise<boolean> {
    // Check if the legend item has "active" class or similar indicator
    const legendItem = this.legend.locator(`.legend-item:has-text("${seriesName}")`);
    const className = await legendItem.getAttribute('class') || '';
    return !className.includes('inactive');
  }
  
  async hasColorIndicator(itemName: string): Promise<boolean> {
    const legendItem = this.legend.locator(`.legend-item:has-text("${itemName}")`);
    const colorIndicator = legendItem.locator('.color-indicator');
    return await colorIndicator.isVisible();
  }

  async exportData() {
    // Setup download listener
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    return await downloadPromise;
  }
} 