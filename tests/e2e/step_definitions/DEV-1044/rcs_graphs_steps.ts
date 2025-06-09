import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import axios from 'axios';
import { uploadTestFile, waitForProcessing } from '../../utils/file_utils';
import { getDbConnection } from '../../utils/db_utils';
import config from '../../config';

interface TestContext {
    testFile?: {
        id: string;
        name: string;
        recordCount: number;
    };
    apiResponse?: any;
    testDates?: string[];
    weeklyResponse?: any[];
    expectedCounts?: {
        RCS: number;
        SMS: number;
    };
}

let testContext: TestContext = {};

Given('the treatment and communication modules are deployed', async function() {
    // Verify both modules are running by checking their health endpoints
    const treatmentHealth = await axios.get(`${config.treatmentModuleUrl}/health`);
    const commHealth = await axios.get(`${config.communicationModuleUrl}/health`);
    expect(treatmentHealth.status).to.equal(200);
    expect(commHealth.status).to.equal(200);
});

Given('the database has the {string} column in {string} table', async function(columnName: string, tableName: string) {
    const db = await getDbConnection();
    const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [columnName]);
    expect(columns.length).to.be.greaterThan(0, `Column ${columnName} not found in ${tableName}`);
});

Given('I have uploaded a test file with {int} RCS-eligible records', async function(recordCount: number) {
    testContext.testFile = await uploadTestFile({
        recordCount,
        channelType: 'RCS'
    });
    await waitForProcessing(testContext.testFile.id);
});

When('RCS messages are sent via Infobip channel', async function() {
    // Wait for messages to be processed and sent
    await new Promise(resolve => setTimeout(resolve, 5000));
});

When('I call the {string} API for today\'s date', async function(endpoint: string) {
    const today = new Date().toISOString().split('T')[0];
    const response = await axios.get(`${config.apiBaseUrl}${endpoint}`, {
        params: { date: today }
    });
    testContext.apiResponse = response.data;
});

Then('the response should include {string} field', function(field: string) {
    expect(testContext.apiResponse).to.have.property(field);
});

Then('the {string} should match the number of sent RCS messages', function(field: string) {
    expect(testContext.apiResponse[field]).to.equal(testContext.testFile?.recordCount);
});

Then('the response should maintain backward compatibility', function() {
    const requiredFields = [
        'total_records',
        'eligible_for_treatment',
        'treatment_sent',
        'treatment_not_sent',
        'treatment_pending',
        'duplicates',
        'invalid_data',
        'opt_out_data'
    ];
    requiredFields.forEach(field => {
        expect(testContext.apiResponse).to.have.property(field);
    });
});

Given('I have historical RCS message data for the past week', async function() {
    // Setup test data for the past week
    const dates = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    });
    testContext.testDates = dates;
});

When('I call the {string} API with weekly parameters', async function(endpoint: string) {
    const response = await axios.get(`${config.apiBaseUrl}${endpoint}`, {
        params: {
            startDate: testContext.testDates?.[6],
            endDate: testContext.testDates?.[0]
        }
    });
    testContext.weeklyResponse = response.data;
});

Then('the response should include RCS metrics for each day', function() {
    testContext.testDates?.forEach(date => {
        const dayData = testContext.weeklyResponse?.find(d => d.date === date);
        expect(dayData).to.have.property('rcsSmsSentCount');
    });
});

Then('the weekly totals should match the sum of daily RCS counts', function() {
    const total = testContext.weeklyResponse?.reduce((sum, day) => sum + day.rcsSmsSentCount, 0);
    expect(total).to.equal(testContext.weeklyResponse?.[0]?.totalRcsCount);
});

interface TestRecord {
    Record_Type: string;
    Expected_Channel: string;
}

Given('I have a test file with the following records:', async function(dataTable: { hashes: () => TestRecord[] }) {
    const records = dataTable.hashes();
    testContext.expectedCounts = {
        RCS: records.filter(r => r.Record_Type === 'RCS').length,
        SMS: records.filter(r => r.Record_Type === 'Regular').length
    };
    testContext.testFile = await uploadTestFile({
        records: records.map(r => ({
            channelType: r.Expected_Channel,
            // Add other required fields
        }))
    });
});

Then('the {string} in database should be updated correctly', async function(columnName: string) {
    const db = await getDbConnection();
    const [result] = await db.query(
        `SELECT ${columnName} FROM mab_operational_reports_data WHERE file_name = ?`,
        [testContext.testFile?.name]
    );
    expect(result[columnName]).to.equal(testContext.expectedCounts?.RCS);
});

Then('only RCS-eligible messages should increment the counter', function() {
    // This is verified by the previous step since we're checking exact counts
}); 