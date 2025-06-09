import { Page, Locator } from '@playwright/test';

export class TrendsPage {
  readonly page: Page;
  readonly trendsTab: Locator;
  readonly trendsTable: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly exportButton: Locator;
  readonly columnSorters: Locator;

  constructor(page: Page) {
    this.page = page;
    this.trendsTab = page.locator('button:has-text("Trends")');
    this.trendsTable = page.locator('.trends-table, table');
    this.tableHeaders = page.locator('thead th, th');
    this.tableRows = page.locator('tbody tr, tr:not(:first-child)');
    this.exportButton = page.locator('button:has-text("Export CSV"), button:has-text("Download")');
    this.columnSorters = page.locator('th.sortable, th[role="columnheader"]');
  }

  async clickTrendsTab() {
    await this.trendsTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getColumnHeaders(): Promise<string[]> {
    const headers = await this.tableHeaders.all();
    const headerTexts: string[] = [];
    
    for (const header of headers) {
      const text = await header.textContent();
      if (text) headerTexts.push(text.trim());
    }
    
    return headerTexts;
  }

  async getColumnIndex(columnName: string): Promise<number> {
    const headers = await this.getColumnHeaders();
    return headers.findIndex(header => header.includes(columnName));
  }

  async clickColumnHeader(columnName: string) {
    const headerIndex = await this.getColumnIndex(columnName);
    if (headerIndex === -1) {
      throw new Error(`Column "${columnName}" not found`);
    }
    
    await this.tableHeaders.nth(headerIndex).click();
    await this.page.waitForTimeout(500);
  }

  async getColumnValues(columnName: string): Promise<string[]> {
    const columnIndex = await this.getColumnIndex(columnName);
    if (columnIndex === -1) {
      throw new Error(`Column "${columnName}" not found`);
    }
    
    const rows = await this.tableRows.all();
    const values: string[] = [];
    
    for (const row of rows) {
      const cells = await row.locator('td').all();
      if (cells.length > columnIndex) {
        const text = await cells[columnIndex].textContent();
        if (text) values.push(text.trim());
      }
    }
    
    return values;
  }

  async getNumericColumnValues(columnName: string): Promise<number[]> {
    const textValues = await this.getColumnValues(columnName);
    
    return textValues.map(value => {
      // Remove commas, percentage signs, etc. and convert to number
      const cleanValue = value.replace(/[,%$]/g, '');
      return parseFloat(cleanValue);
    });
  }

  async isSortedAscending(values: number[]): Promise<boolean> {
    for (let i = 1; i < values.length; i++) {
      if (values[i] < values[i-1]) {
        return false;
      }
    }
    return true;
  }

  async isSortedDescending(values: number[]): Promise<boolean> {
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i-1]) {
        return false;
      }
    }
    return true;
  }

  async exportData() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    return await downloadPromise;
  }
} 