import { test, expect } from '@playwright/test';
import { RcsService } from '@common/services/rcs/rcs.service';
import { validateGraphData, formatGraphData } from '@common/utils/graph-utils';
import { configManager } from '@integration/index';

test.describe('RCS Graphs API Tests @DEV-1044 @rcs @graphs @api', () => {
    let rcsService: RcsService;

    test.beforeEach(async () => {
        rcsService = new RcsService(configManager.getEnvironmentConfig());
    });

    test('Verify RCS graph data structure and values @DEV-1044-TC1 @TC1 @api', async () => {
        const graphData = await rcsService.getGraphData();
        const { isValid, errors } = validateGraphData(graphData);
        expect(isValid, `Graph data validation failed: ${errors.join(', ')}`).toBeTruthy();

        // Verify data structure
        expect(graphData.length).toBeGreaterThan(0);
        graphData.forEach(data => {
            expect(data).toHaveProperty('timestamp');
            expect(data).toHaveProperty('sent');
            expect(data).toHaveProperty('delivered');
            expect(data).toHaveProperty('failed');
            expect(data).toHaveProperty('pending');
        });
    });

    test('Verify daily delivery trends data @DEV-1044-TC2 @TC2 @api', async () => {
        const trendData = await rcsService.getDeliveryTrends();
        const { isValid, errors } = validateGraphData(trendData);
        expect(isValid, `Trend data validation failed: ${errors.join(', ')}`).toBeTruthy();

        // Verify data formatting
        const formattedData = formatGraphData(trendData, { interval: 'day' });
        expect(formattedData.labels.length).toBe(trendData.length);
        expect(formattedData.datasets).toHaveLength(4); // Sent, Delivered, Failed, Pending

        // Verify data consistency
        trendData.forEach(data => {
            expect(data.delivered + data.failed + data.pending).toBeLessThanOrEqual(data.sent);
        });
    });

    test('Verify timeframe filtering in API @DEV-1044-TC3 @TC3 @api', async () => {
        // Test different timeframes
        const testCases = [
            { startDate: '2025-01-01', endDate: '2025-01-07' },
            { startDate: '2025-01-01', endDate: '2025-01-31' },
            { startDate: '2025-01-01', endDate: '2025-03-01' }
        ];

        for (const { startDate, endDate } of testCases) {
            const graphData = await rcsService.getGraphData({ startDate, endDate });
            const { isValid } = validateGraphData(graphData);
            expect(isValid).toBeTruthy();

            // Verify date range
            const dates = graphData.map(d => new Date(d.timestamp));
            const minDate = new Date(startDate);
            const maxDate = new Date(endDate);
            
            dates.forEach(date => {
                expect(date >= minDate && date <= maxDate).toBeTruthy();
            });
        }
    });

    test('Verify failure analysis data @DEV-1044-TC4 @TC4 @api', async () => {
        const failureData = await rcsService.getFailureAnalysis();
        
        // Verify data structure
        failureData.forEach(data => {
            expect(data).toHaveProperty('category');
            expect(data).toHaveProperty('count');
            expect(data).toHaveProperty('percentage');
            expect(typeof data.percentage).toBe('number');
            expect(data.percentage).toBeGreaterThanOrEqual(0);
            expect(data.percentage).toBeLessThanOrEqual(100);
        });

        // Verify total percentage
        const totalPercentage = failureData.reduce((sum, data) => sum + data.percentage, 0);
        expect(Math.round(totalPercentage)).toBe(100);
    });
}); 