import { Page, Locator, expect } from '@playwright/test';

export class RCSTabPage {
  readonly page: Page;
  readonly channelTabs: Locator;
  readonly rcsTab: Locator;
  readonly smsTab: Locator;
  readonly emailTab: Locator;
  readonly activeTab: Locator;
  readonly metricsSection: Locator;
  readonly timeframeDropdown: Locator;
  readonly chartContainer: Locator;
  readonly metricCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.channelTabs = page.locator('.channel-tabs');
    this.rcsTab = page.locator('button:has-text("RCS")');
    this.smsTab = page.locator('button:has-text("SMS")');
    this.emailTab = page.locator('button:has-text("Email")');
    this.activeTab = page.locator('.active-tab');
    this.metricsSection = page.locator('.metrics-summary');
    this.timeframeDropdown = page.locator('select[aria-label="Select a Timeframe"]');
    this.chartContainer = page.locator('.chart-container');
    this.metricCards = page.locator('.metric-card');
  }

  /**
   * Navigate to Message Reports page
   */
  async navigateToMessageReports() {
    await this.page.click('a:has-text("Message Reports")');
    await this.page.waitForSelector('h1:has-text("Message Reports")');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get all tabs as text array
   */
  async getAllTabs(): Promise<string[]> {
    const tabElements = await this.channelTabs.locator('button').all();
    const tabNames: string[] = [];
    
    for (const tab of tabElements) {
      const text = await tab.textContent();
      if (text) tabNames.push(text.trim());
    }
    
    return tabNames;
  }

  /**
   * Get the text of the currently active tab
   */
  async getActiveTabText(): Promise<string> {
    return (await this.activeTab.textContent() || '').trim();
  }

  /**
   * Click on a specific tab
   */
  async clickTab(tabName: string) {
    const tab = this.page.locator(`button:has-text("${tabName}")`);
    await tab.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if heading with specific text exists
   */
  async hasHeading(headingText: string): Promise<boolean> {
    return await this.page.locator(`h2:has-text("${headingText}")`).isVisible();
  }

  /**
   * Get metric labels from metric cards
   */
  async getMetricLabels(): Promise<string[]> {
    const labels: string[] = [];
    const labelElements = await this.metricCards.locator('.metric-label').all();
    
    for (const label of labelElements) {
      const text = await label.textContent();
      if (text) labels.push(text.trim());
    }
    
    return labels;
  }

  /**
   * Check if metrics section is displayed
   */
  async isMetricsSectionDisplayed(): Promise<boolean> {
    return await this.metricsSection.isVisible();
  }

  /**
   * Check if timeframe dropdown is displayed
   */
  async isTimeframeDropdownDisplayed(): Promise<boolean> {
    return await this.timeframeDropdown.isVisible();
  }

  /**
   * Check if chart container is displayed
   */
  async isChartDisplayed(): Promise<boolean> {
    return await this.chartContainer.isVisible();
  }

  /**
   * Select a timeframe from the dropdown
   */
  async selectTimeframe(timeframe: string) {
    await this.timeframeDropdown.selectOption({ label: timeframe });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check for loading errors on the page
   */
  async hasLoadingErrors(): Promise<boolean> {
    return await this.page.locator('.error-message, .alert-danger').isVisible();
  }

  /**
   * Resize page for responsive testing
   */
  async resizeTo(width: number, height: number) {
    await this.page.setViewportSize({ width, height });
    // Wait for layout to adjust
    await this.page.waitForTimeout(1000);
  }
} 