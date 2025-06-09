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
            undelivered: 0
        };
    }

    async waitForChartUpdate(): Promise<void> {
        await this.page.waitForSelector('[data-testid="rcs-chart"][data-loading="false"]');
    }
} 