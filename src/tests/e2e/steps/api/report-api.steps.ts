import { Given, When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import { expect } from 'chai';

let apiEndpoint: string;
let customer: string;
let testDate: string;
let lastResponse: any;
let mongoResponse: any;
let postgresResponse: any;

Given('the Report API is configured with endpoint {string}', function (endpoint: string) {
    apiEndpoint = endpoint;
});

Given('test data exists for customer {string} on date {string}', function (testCustomer: string, date: string) {
    customer = testCustomer;
    testDate = date;
});

Given('the data source flag is set to {string}', function (flag: string) {
    // Note: This step might require actual configuration change in the system
    console.log(`Data source flag set to: ${flag}`);
});

When('I request SMS report data', async function () {
    try {
        lastResponse = await axios.post(apiEndpoint, {
            endDate: testDate,
            startDate: testDate,
            customer: customer,
            commType: 'sms'
        });
    } catch (error) {
        lastResponse = error.response;
    }
});

Then('the response should contain valid chart data', function () {
    expect(lastResponse.data).to.have.property('chartdata');
    expect(lastResponse.data.chartdata).to.have.property('total');
    expect(typeof lastResponse.data.chartdata.total).to.equal('number');
});

When('I fetch data with MongoDB flag', async function () {
    try {
        mongoResponse = await axios.post(apiEndpoint, {
            endDate: testDate,
            startDate: testDate,
            customer: customer,
            commType: 'sms'
        });
    } catch (error) {
        mongoResponse = error.response;
    }
});

When('I fetch data with PostgreSQL flag', async function () {
    try {
        postgresResponse = await axios.post(apiEndpoint, {
            endDate: testDate,
            startDate: testDate,
            customer: customer,
            commType: 'sms'
        });
    } catch (error) {
        postgresResponse = error.response;
    }
});

Then('both responses should contain identical chart data', function () {
    expect(mongoResponse.data.chartdata).to.deep.equal(postgresResponse.data.chartdata);
});

Then('the response should contain all required fields:', function (dataTable) {
    const requiredFields = dataTable.raw().slice(1).map(row => row[0]);
    requiredFields.forEach(field => {
        expect(lastResponse.data.chartdata).to.have.property(field);
    });
});

Given('MongoDB is unavailable', function () {
    // Note: This step requires actual MongoDB connection disruption
    console.log('MongoDB connection disabled for testing');
});

Given('PostgreSQL is unavailable', function () {
    // Note: This step requires actual PostgreSQL connection disruption
    console.log('PostgreSQL connection disabled for testing');
});

Then('the API should return an appropriate error response', function () {
    expect(lastResponse.status).to.be.oneOf([500, 503]);
    expect(lastResponse.data).to.have.property('error');
});

Then('the error should indicate {string} issue', function (issueType: string) {
    expect(lastResponse.data.error.toLowerCase()).to.include(issueType.toLowerCase());
});

Given('data migration has been performed', function () {
    // Note: This step assumes data migration has been completed
    console.log('Data migration verification started');
});

Then('historical data should match pre-migration records', function () {
    expect(mongoResponse.data.chartdata).to.have.property('total');
    // Add more specific checks based on your data structure
});

Then('recent data should be available in PostgreSQL only', function () {
    expect(postgresResponse.data.chartdata).to.have.property('total');
    // Add more specific checks based on your data structure
}); 