import { Given, When, Then, After, Before } from '@cucumber/cucumber';
import { expect } from 'chai';
import { ApiService } from '@services/api.service';
import { DatabaseService } from '@services/database.service';
import { config } from '@config/config';
import { RcsTestContext } from '../common/rcs-test-context';
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

Given('I have access to the RCS service', function () {
    expect(rcsService).to.not.be.undefined;
});

Given('I have RCS messages in the system', async function () {
    testContext.services = {
        api: apiService,
        db: dbService
    };
});

When('I call the {string} API with parameters:', async function (endpoint: string, dataTable: any) {
    const params = dataTable.hashes()[0];
    const response = await apiService.callApi(endpoint, params);
    testContext.responses = {
        api: response
    };
});

Then('the API response should have correct format', function () {
    expect(testContext.responses?.api).to.be.an('object');
    expect(testContext.responses?.api).to.have.property('rcsSmsSentCount');
});

Then('the response should contain {string} field', function (field: string) {
    expect(testContext.responses?.api).to.have.property(field);
});

Then('the chartdata should contain:', function (dataTable: any) {
    const expectedData = dataTable.hashes()[0];
    const chartData = testContext.responses?.api?.chartdata;
    
    expect(chartData).to.be.an('object');
    Object.entries(expectedData).forEach(([key, value]) => {
        expect(chartData[key]).to.equal(parseInt(value as string));
    });
});

Then('the chartdata should match daily report data', function () {
    const dailyData = testContext.responses?.api?.chartdata;
    const weeklyData = testContext.responses?.api?.weeklyChartdata;
    
    expect(weeklyData).to.deep.equal(dailyData);
}); 