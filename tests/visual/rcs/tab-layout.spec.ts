import { test, expect } from '@playwright/test';

test.describe('RCS Tab Layout Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/message-reports');
        await page.click('text=RCS');
    });

    test('tab layout matches baseline', async ({ page }) => {
        const pageContent = page.locator('body');
        await expect(pageContent).toHaveScreenshot('rcs-tab-layout.png', {
            mask: [page.locator('.dynamic-content')],
            maxDiffPixelRatio: 0.1
        });
    });

    test('metrics cards layout is consistent', async ({ page }) => {
        const metricsSection = page.locator('.metrics-section');
        await expect(metricsSection).toHaveScreenshot('metrics-cards.png', {
            maxDiffPixelRatio: 0.1
        });
    });

    test('responsive layout at different breakpoints', async ({ page }) => {
        // Mobile
        await page.setViewportSize({ width: 375, height: 667 });
        const mobileContent = page.locator('body');
        await expect(mobileContent).toHaveScreenshot('rcs-tab-mobile.png');

        // Tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        const tabletContent = page.locator('body');
        await expect(tabletContent).toHaveScreenshot('rcs-tab-tablet.png');

        // Desktop
        await page.setViewportSize({ width: 1440, height: 900 });
        const desktopContent = page.locator('body');
        await expect(desktopContent).toHaveScreenshot('rcs-tab-desktop.png');
    });
}); 