import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { RcsService } from '@services/rcs/rcs.service';
import { DatabaseService } from '@services/database.service';
import { UIService } from '@services/ui.service';
import { ApiService } from '@services/api.service';
import { Config } from '@config/config';
import { TestContext } from '@common/test-context';
import { configManager } from '@integration/index';

let rcsService: RcsService;
let dbService: DatabaseService;
let uiService: UIService;
let apiService: ApiService;
let testContext: TestContext;

Given('the RCS service is operational', async function() {
    const config = configManager.getEnvironmentConfig();
    rcsService = new RcsService(config);
    
    // Convert Config to DatabaseConfig
    const dbConfig = {
        host: config.database.host,
        port: config.database.port,
        user: config.database.username,
        password: config.database.password,
        database: config.database.name
    };
    
    dbService = DatabaseService.getInstance(dbConfig);
    uiService = new UIService(this.page);
    apiService = new ApiService(config);
    testContext = new TestContext();
    
    const status = await rcsService.checkServiceStatus();
    expect(status).to.equal('operational');
});

Given('test data is prepared for RCS message tracking', async function() {
    testContext.testData = {
        phoneNumber: '+1234567890',
        message: 'Test RCS message',
        clientId: 'TEST-CLIENT-001'
    };
});

When('I send an RCS message to a test number', async function() {
    const response = await rcsService.sendTestMessage(testContext.testData);
    testContext.messageId = response.messageId;
    expect(response.messageId).to.not.be.empty;
});

When('I wait for the message delivery confirmation', async function() {
    const message = await rcsService.waitForDeliveryConfirmation(testContext.messageId);
    testContext.messageStatus = message.status;
    testContext.rcsSmsSentCount = message.rcsSmsSentCount;
});

Then('the operational report should show the correct RCS SMS count', async function() {
    const report = await apiService.getMabOperationalReportData();
    expect(report.rcsSmsSentCount).to.equal(testContext.rcsSmsSentCount);
});

Then('the message status should be {string}', async function(status: string) {
    expect(testContext.messageStatus).to.equal(status);
});

Then('the RCS SMS sent count should be {int}', async function(count: number) {
    expect(testContext.rcsSmsSentCount).to.equal(count);
});

Given('there are RCS messages sent in the past week', async function() {
    const count = await dbService.getRcsMessageCount();
    expect(count).to.be.greaterThan(0);
});

When('I generate the weekly report', async function() {
    const report = await apiService.getMabReportsData();
    testContext.weeklyReport = report;
});

Then('the weekly report should show the total RCS SMS count', async function() {
    expect(testContext.weeklyReport.rcsMetrics).to.have.property('total');
    expect(testContext.weeklyReport.rcsMetrics.total).to.be.a('number');
});

Then('the count should match the database records', async function() {
    const dbCount = await dbService.getRcsMessageCount();
    expect(testContext.weeklyReport.rcsMetrics.total).to.equal(dbCount);
});

Given('there are RCS messages in the system', async function() {
    const metrics = await rcsService.getMetrics();
    expect(metrics.total).to.be.greaterThan(0);
});

When('I navigate to the metrics dashboard', async function() {
    await uiService.navigateTo('metrics-dashboard');
});

Then('I should see the RCS message count displayed', async function() {
    const displayedCount = await uiService.getDisplayedRcsCount();
    expect(displayedCount).to.be.a('number');
    expect(displayedCount).to.be.greaterThan(0);
});

Then('the graph should show RCS message delivery trends', async function() {
    await uiService.waitForChartUpdate();
    // Additional graph validation can be added here
});

Then('the metrics should match the database records', async function() {
    const displayedCount = await uiService.getDisplayedRcsCount();
    const dbCount = await dbService.getRcsMessageCount();
    expect(displayedCount).to.equal(dbCount);
}); 