import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { RcsService } from '@common/rcs.service';
import { validateGraphData, formatGraphData } from '@utils/graph-utils';
import { configManager } from '@integration/index';

let rcsService: RcsService;
let graphData: any;
let trendData: any;
let failureData: any;

Given('I have access to the RCS service', function () {
    rcsService = new RcsService(configManager.getEnvironmentConfig());
});

When('I request the graph data', async function () {
    graphData = await rcsService.getGraphData();
});

When('I request the delivery trends data', async function () {
    trendData = await rcsService.getDeliveryTrends();
});

When('I request graph data for the following timeframes:', async function (dataTable) {
    const timeframes = dataTable.hashes();
    graphData = [];
    for (const { startDate, endDate } of timeframes) {
        const data = await rcsService.getGraphData({ startDate, endDate });
        graphData.push({ startDate, endDate, data });
    }
});

When('I request the failure analysis data', async function () {
    failureData = await rcsService.getFailureAnalysis();
});

Then('the graph data should have valid structure', function () {
    const { isValid, errors } = validateGraphData(graphData);
    expect(isValid, `Graph data validation failed: ${errors.join(', ')}`).to.be.true;
});

Then('the graph data should contain all required metrics', function () {
    graphData.forEach(data => {
        expect(data).to.have.property('timestamp');
        expect(data).to.have.property('sent');
        expect(data).to.have.property('delivered');
        expect(data).to.have.property('failed');
        expect(data).to.have.property('pending');
    });
});

Then('the trend data should have valid structure', function () {
    const { isValid, errors } = validateGraphData(trendData);
    expect(isValid, `Trend data validation failed: ${errors.join(', ')}`).to.be.true;
});

Then('the trend data should be formatted correctly', function () {
    const formattedData = formatGraphData(trendData, { interval: 'day' });
    expect(formattedData.labels.length).to.equal(trendData.length);
    expect(formattedData.datasets).to.have.lengthOf(4); // Sent, Delivered, Failed, Pending
});

Then('the trend data should be consistent', function () {
    trendData.forEach(data => {
        expect(data.delivered + data.failed + data.pending).to.be.at.most(data.sent);
    });
});

Then('all data points should be within the specified timeframe', function () {
    graphData.forEach(({ startDate, endDate, data }) => {
        const minDate = new Date(startDate);
        const maxDate = new Date(endDate);
        
        data.forEach(point => {
            const date = new Date(point.timestamp);
            expect(date >= minDate && date <= maxDate).to.be.true;
        });
    });
});

Then('the failure data should have valid structure', function () {
    failureData.forEach(data => {
        expect(data).to.have.property('category');
        expect(data).to.have.property('count');
        expect(data).to.have.property('percentage');
        expect(data.percentage).to.be.a('number');
        expect(data.percentage).to.be.at.least(0);
        expect(data.percentage).to.be.at.most(100);
    });
});

Then('the failure percentages should total 100%', function () {
    const totalPercentage = failureData.reduce((sum, data) => sum + data.percentage, 0);
    expect(Math.round(totalPercentage)).to.equal(100);
}); 