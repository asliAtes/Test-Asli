import { Given, When, Then, After, Before } from '@cucumber/cucumber';
import { expect } from 'chai';
import { ApiService } from '@services/api.service';
import { DatabaseService } from '@services/database.service';
import { config } from '@config/config';
import { RcsTestContext } from '@steps/DEV-958/DEV-1044/steps/common/rcs-test-context';
import { RcsService } from '@common/rcs.service';
import { configManager } from '@integration/index';
import { DatabaseConfig } from '@common/types/database.types';

let testContext: RcsTestContext = {};
let rcsService: RcsService;
let dbService: DatabaseService;
let apiService: ApiService;

Before(async function () {
    const config = configManager.getEnvironmentConfig();
    rcsService = new RcsService(config);
    
    // Convert Config to DatabaseConfig
    const dbConfig: DatabaseConfig = {
        host: config.database.host,
        port: config.database.port,
        user: config.database.username,
        password: config.database.password,
        database: config.database.name
    };
    
    dbService = DatabaseService.getInstance(dbConfig);
    apiService = new ApiService(config);
});

// Clean up after each scenario
After(async function () {
    if (testContext.testData?.messageIds?.length) {
        await dbService.query(
            'DELETE FROM rcs_messages WHERE message_id IN (?)',
            [testContext.testData.messageIds]
        );
        console.log(`🧹 Cleaned up ${testContext.testData.messageIds.length} test records`);
    }
});

// Background steps
Given('the treatment and communication modules are deployed and operational', async function () {
    const treatmentStatus = await apiService.checkServiceStatus('treatment');
    const commStatus = await apiService.checkServiceStatus('communication');
    expect(treatmentStatus).to.equal('healthy');
    expect(commStatus).to.equal('healthy');
});

Given('I have test data in the system', async function () {
    testContext.testData = {
        messageIds: ['test-msg-1', 'test-msg-2'],
        expectedMetrics: {
            total: 2,
            delivered: 1,
            pending: 0,
            failed: 1,
            rcsSmsSentCount: 3
        },
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
    };

    // Insert test messages
    await dbService.query(`
        INSERT INTO rcs_messages (message_id, status, rcs_sms_sent_count, created_at)
        VALUES 
        (?, 'DELIVERED', 2, ?),
        (?, 'FAILED', 1, ?)
    `, [
        testContext.testData.messageIds[0], testContext.testData.startDate,
        testContext.testData.messageIds[1], testContext.testData.endDate
    ]);
});

Given('I have access to the RCS service', function () {
    expect(rcsService).to.not.be.undefined;
    });

When('I request the operational report data for RCS messages', async function () {
    const response = await apiService.getOperationalMetrics();
    expect(response).to.have.property('rcsSmsSentCount');
});

When('I request the weekly report data for RCS messages', async function () {
    const response = await apiService.getWeeklyMetrics();
    expect(response).to.have.property('rcsSmsSentCount');
});

Then('the API response should include RCS SMS sent count', function () {
    // Implementation will be added
});

Then('the RCS metrics should match the database values', async function () {
    // Implementation will be added
}); 