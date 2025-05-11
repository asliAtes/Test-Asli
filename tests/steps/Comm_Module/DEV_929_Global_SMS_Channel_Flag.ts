import { Given, When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import assert from 'assert';
import dotenv from 'dotenv';

dotenv.config();

let response: any;
let data: any;

function generateId(): string {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

Given('the Communication Module is deployed and accessible', function () {
  // Placeholder for deployment check
  assert.ok(true, 'Communication Module is accessible');
});

Given('customer {string} is configured', function (customerName: string) {
  console.log(`Customer ${customerName} is configured`);
});

When('I send an SMS message for {string} customer', async function (customerName: string) {
  const acctNum = generateId();
  const customerId = generateId();
  let testPhone = process.env.TEST_PHONE_NUMBER;
  if (customerName === 'T-Mobile') {
    testPhone = '+12144352325';
  }
  let carrier = 'TWILIO';
  if (customerName === 'T-Mobile') {
    carrier = 'BNE';
  } else if (customerName === 'USCC' || customerName === 'NewCustomer') {
    carrier = 'INFOBIP_SMS';
  }
  data = {
    schedule: false,
    carrier: carrier,
    smsRequestList: [
      {
        toNumber: testPhone,
        message: `Test message for ${customerName}`,
        treatmentUserId: customerId,
        clientName: customerName,
        acctNum: acctNum
      }
    ]
  };
  try {
    const BASE_URL = process.env.BASE_URL || 'http://3.133.216.212/app4/kredos/comm/messaging';
    response = await axios.post(BASE_URL, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: parseInt(process.env.TIMEOUT || '10000'),
    });
  } catch (error: any) {
    response = error.response;
  }
});

When('I send an SMS message for {string} customer with an invalid carrier', async function (customerName: string) {
  const acctNum = generateId();
  const customerId = generateId();
  let testPhone = process.env.TEST_PHONE_NUMBER;
  data = {
    schedule: false,
    carrier: 'INVALID_CARRIER',
    smsRequestList: [
      {
        toNumber: testPhone,
        message: `Test message for ${customerName}`,
        treatmentUserId: customerId,
        clientName: customerName,
        acctNum: acctNum
      }
    ]
  };
  try {
    const BASE_URL = process.env.BASE_URL || 'http://3.133.216.212/app4/kredos/comm/messaging';
    response = await axios.post(BASE_URL, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: parseInt(process.env.TIMEOUT || '10000'),
    });
  } catch (error: any) {
    response = error.response;
  }
});

Then('the message should be routed to {string}', function (expectedCarrier: string) {
  const actualCarrier = response?.data?.carrier || response?.data?.providerResponse?.carrier;
  assert.ok(
    actualCarrier === expectedCarrier ||
    (actualCarrier === 'INFOBIP_SMS' && expectedCarrier === 'Infobip') ||
    (actualCarrier === 'TWILIO' && expectedCarrier === 'Twilio') ||
    (actualCarrier === 'BNE' && expectedCarrier === 'BNE'),
    `Expected carrier ${expectedCarrier}, but was ${actualCarrier}`
  );
});

Then('the response should indicate successful message acceptance', function () {
  assert.ok(
    response?.data?.result === true ||
    response?.data?.statusCode === 200 ||
    response?.data?.response?.successfulMessages?.length > 0,
    'Expected successful message acceptance'
  );
});

Then('the response should indicate {string} for carrier', function (expectedMessage: string) {
  const actualMessage = response?.data?.message || '';
  assert.ok(
    actualMessage.includes(expectedMessage) ||
    response?.data?.statusCodeDescription?.includes(expectedMessage) ||
    (expectedMessage === '400 Bad Request' && response?.data?.statusCode === 400)
  );
});

Then('the error message should contain {string}', function (expectedErrorText: string) {
  const errorMessage = response?.data?.message || response?.data?.error?.message || response?.data?.error || '';
  assert.ok(
    errorMessage.toLowerCase().includes(expectedErrorText.toLowerCase()),
    `Expected error message to contain "${expectedErrorText}", but got "${errorMessage}"`
  );
}); 