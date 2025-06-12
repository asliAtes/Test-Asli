import { Page } from '@playwright/test';
import { RcsMetrics } from '../types/rcs.types';

export class UIService {
    constructor(private page: Page) {}

    async navigateTo(path: string) {
        await this.page.goto(`${process.env.BASE_URL}/${path}`);
    }

    async getDisplayedRcsCount(): Promise<number> {
        const element = await this.page.locator('[data-testid="rcs-count"]');
        const text = await element.textContent();
        return parseInt(text || '0', 10);
    }

    async getRcsMetrics(): Promise<RcsMetrics> {
        const total = await this.getDisplayedRcsCount();
        return {
            total,
            delivered: 0,
            pending: 0,
            failed: 0
        };
    }

    async waitForChartUpdate(): Promise<void> {
        await this.page.waitForSelector('[data-testid="rcs-chart"][data-loading="false"]');
    }

    async getLastDownloadedCsvRows(): Promise<string[][]> {
        // TODO: Implement logic to fetch and parse the last downloaded CSV file
        // For now, return a stub header row for testing
        return [['Date', 'RCS SMS Sent', 'Delivered Count', 'Pending Count', 'Failed Count']];
    }

    async getRcsChartMetrics(): Promise<{ total: number; delivered: number; pending: number; failed: number }> {
        // TODO: Implement logic to fetch chart metrics from the UI
        // For now, return stub data for testing
        return { total: 0, delivered: 0, pending: 0, failed: 0 };
    }
} 