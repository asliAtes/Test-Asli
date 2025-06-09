import { test, expect } from '@playwright/test';

test.describe('RCS Charts Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/message-reports');
        await page.click('text=RCS');
    });

    test('column chart layout matches baseline', async ({ page }) => {
        await page.click('text=Column');
        const chart = page.locator('.chart-container');
        await expect(chart).toHaveScreenshot('column-chart.png', {
            maxDiffPixelRatio: 0.1
        });
    });

    test('line chart layout matches baseline', async ({ page }) => {
        await page.click('text=Line');
        const chart = page.locator('.chart-container');
        await expect(chart).toHaveScreenshot('line-chart.png', {
            maxDiffPixelRatio: 0.1
        });
    });

    test('chart controls layout is consistent', async ({ page }) => {
        const controls = page.locator('.chart-controls');
        await expect(controls).toHaveScreenshot('chart-controls.png', {
            maxDiffPixelRatio: 0.1
        });
    });

    test('chart legends are properly aligned', async ({ page }) => {
        const legends = page.locator('.chart-legends');
        await expect(legends).toHaveScreenshot('chart-legends.png', {
            maxDiffPixelRatio: 0.1
        });
    });
}); 