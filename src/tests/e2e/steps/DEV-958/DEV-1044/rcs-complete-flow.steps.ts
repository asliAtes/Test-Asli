import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from 'chai';
import { RcsService } from '@common/rcs.service';
import { DatabaseService } from '@services/database.service';
import { ApiService } from '@services/api.service';
import { chromium } from '@playwright/test';
import { RcsTestFile, RcsMessage, RcsMetrics } from '@common/rcs.service';
import { configManager } from '@integration/index';
import { DatabaseConfig } from '@common/types/database.types';

interface TestContext {
    browser?: any;
    page?: any;
    testFile?: RcsTestFile;
    message?: RcsMessage;
    metrics?: RcsMetrics;
    testData?: any;
    responses?: any;
}

const testContext: TestContext = {};
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

    // Set up browser for UI tests
    testContext.browser = await chromium.launch();
    testContext.page = await testContext.browser.newPage();
});

After(async function () {
    if (testContext.browser) {
        await testContext.browser.close();
    }
});

Given('the communication module is deployed and operational', async function() {
    // Skip communication module check for these tests
    return true;
});

Given('I am logged into the application', async function () {
    // Skip login for these tests
    return true;
});

Given('RCS messages have been sent and delivered', async function () {
    // Insert test data into staging database
    await dbService.query(
        'INSERT INTO rcs_messages (status, created_at) VALUES ($1, NOW()), ($2, NOW())',
        ['DELIVERED', 'DELIVERED']
    );
});

Given('I have a test file {string} with the following records:', function (filename: string, dataTable: any) {
    const records = dataTable.hashes();
    const csvContent = records.map(record => 
        `${record.phone_number},${record.message_text},${record.client_id}`
    ).join('\n');
    
    testContext.testFile = {
        id: 'test-file-1',
        name: filename,
        content: csvContent,
        type: 'text/csv'
    };
});

When('I upload the test file through the communication module', async function () {
    const fileId = await rcsService.uploadTestFile(testContext.testFile);
    expect(fileId).to.be.a('string');
});

Then('the file should be processed successfully', async function () {
    const status = await rcsService.checkFileProcessingStatus(testContext.testFile.id);
    expect(status).to.equal('PROCESSED');
});

Then('the messages should be sent through Infobip', async function () {
    const messages = await rcsService.getSentMessages(testContext.testFile.id);
    expect(messages).to.have.lengthOf(2);
});

Then('all messages should have delivery status {string}', async function (status: string) {
    const messages = await rcsService.getSentMessages(testContext.testFile.id);
    for (const message of messages) {
        expect(message.status).to.equal(status);
    }
});

Then('I should receive delivery confirmations from Infobip', async function () {
    const confirmations = await rcsService.getDeliveryConfirmations(testContext.testFile.id);
    expect(confirmations).to.have.lengthOf(2);
});

Then('the delivery events should be logged in bne_events_data table', async function () {
    const events = await dbService.query(
        'SELECT * FROM bne_events_data WHERE file_id = $1',
        [testContext.testFile.id]
    );
    expect(events).to.have.lengthOf(2);
}); 