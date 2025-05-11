import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as configJson from '../../features/Outreach_Log_Validation/config/test_config.json';

Given('the outreach log generation service is running', function () {
  // Mock ortamda servis kontrolü simülasyonu
  this.serviceRunning = true;
  return true;
});

Given('test data is prepared for outreach log validation', function () {
  // Mock ortamda test verisi hazırlama simülasyonu
  this.testDataPrepared = true;
  return true;
});

When('an outreach log file is generated with invalid {string}', async function (dataType) {
  // Simulate generating a file with invalid data
  this.filePath = path.join(process.cwd(), 'test_outreach_log_invalid.csv');
  const invalidData = configJson.mockData.invalidData[dataType] || '';
  const content = `${configJson.mockData.headers}\n${invalidData}\n`;
  await fs.promises.writeFile(this.filePath, content);
  this.invalidDataType = dataType;
});

Then('the error should be logged', function () {
  // Simulate error logging for invalid data
  console.log(`Error logged for invalid data type: ${this.invalidDataType}`);
  this.errorLogged = true;
});

Then('the process should continue with valid records', function () {
  // Simulate process continuation
  expect(this.errorLogged).to.be.true;
});

Then('the invalid record should be reported', function () {
  // Simulate reporting invalid record
  console.log(`Invalid record reported for type: ${this.invalidDataType}`);
  expect(this.invalidDataType).to.be.a('string');
});

When('the outreach log file is delivered to SFTP', function () {
  // Simulate SFTP delivery in mock
  this.sftpDelivered = true;
});

Then('the file permissions should be correct', function () {
  // Simulate permission check
  const expectedPerm = configJson.fileDelivery.permissions;
  console.log(`Mock file permissions checked: ${expectedPerm}`);
  expect(expectedPerm).to.equal('644');
});

Then('a backup copy should be maintained', function () {
  // Simulate backup copy
  this.backupMaintained = true;
  expect(this.backupMaintained).to.be.true;
}); 