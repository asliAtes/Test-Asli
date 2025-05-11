import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import axios from 'axios';

let requestPayload: any;
let response: any;

const testConfig = {
  phoneNumbers: {
    rcsCapable: process.env.RCS_CAPABLE_PHONE || '+17193981666',
    nonRcsCapable: process.env.NON_RCS_PHONE || '+17193981666',
    tmobile: '+12144352325',
  }
};

Given('I prepare a message with carrier {string} to an RCS-capable device', function (carrier: string) {
  requestPayload = {
    carrier,
    schedule: false,
    smsRequestList: [
      {
        toNumber: testConfig.phoneNumbers.rcsCapable,
        message: 'Test message to RCS-capable device',
        treatmentUserId: 'rcsUser',
        clientName: 'USCC',
        acctNum: 'rcsAcct'
      }
    ]
  };
});

Given('I prepare a message with carrier {string} to a non-RCS-capable device', function (carrier: string) {
  requestPayload = {
    carrier,
    schedule: false,
    smsRequestList: [
      {
        toNumber: testConfig.phoneNumbers.nonRcsCapable,
        message: 'Test message to non-RCS-capable device',
        treatmentUserId: 'nonrcsUser',
        clientName: 'USCC',
        acctNum: 'nonrcsAcct'
      }
    ]
  };
});

Given('I prepare a message with carrier {string} to any device', function (carrier: string) {
  requestPayload = {
    carrier,
    schedule: false,
    smsRequestList: [
      {
        toNumber: testConfig.phoneNumbers.rcsCapable,
        message: 'Test message to any device',
        treatmentUserId: 'smsUser',
        clientName: 'USCC',
        acctNum: 'smsAcct'
      }
    ]
  };
});

Given('I prepare a message for a T-Mobile customer', function () {
  requestPayload = {
    carrier: 'BNE',
    bulkBneRequest: {
      bneBulkRequest: {
        correlationId: 'tmobileUser',
        messages: [
          {
            address: `tel:${testConfig.phoneNumbers.tmobile}`,
            language: 'en-US',
            dynamicTag: ['Test message for T-Mobile'],
            timezone: 'America/New_York'
          }
        ],
        deliveryExpiryTime: (() => {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}T23:59`;
        })()
      },
      serviceGrade: '3080'
    }
  };
});

Given('I prepare a message with an unknown parameter {string}', function (param: string) {
  requestPayload = {
    carrier: 'INFOBIP_SMS',
    schedule: false,
    smsRequestList: [
      {
        toNumber: testConfig.phoneNumbers.rcsCapable,
        message: 'Test message with unknown param',
        treatmentUserId: 'unknownUser',
        clientName: 'USCC',
        acctNum: 'unknownAcct'
      }
    ]
  };
  requestPayload[param] = 'someValue';
});

When('I submit the message to the communication module', async function () {
  try {
    const BASE_URL = process.env.BASE_URL || 'http://3.133.216.212/app4/kredos/comm/messaging';
    response = await axios.post(BASE_URL, requestPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: parseInt(process.env.TIMEOUT || '10000'),
    });
  } catch (error: any) {
    response = error.response;
  }
});

Then('it should be delivered through {string}', function (expected: string) {
  assert.ok(response?.data?.result === true || response?.data?.statusCode === 200, 'Expected successful delivery');
  if (expected === 'RCS') {
    assert.ok(response?.data?.message?.toLowerCase().includes('rcs') || response?.data?.carrier === 'INFOBIP_RCS', 'Expected RCS delivery');
  } else if (expected === 'SMS') {
    assert.ok(response?.data?.message?.toLowerCase().includes('sms') || response?.data?.carrier === 'INFOBIP_SMS', 'Expected SMS delivery');
  } else if (expected === 'BNE') {
    assert.ok(response?.data?.message?.toLowerCase().includes('bne') || response?.data?.carrier === 'BNE', 'Expected BNE delivery');
  }
});

Then('it should failover to {string}', function (expected: string) {
  assert.ok(response?.data?.result === true || response?.data?.statusCode === 200, 'Expected successful failover');
  assert.ok(response?.data?.message?.toLowerCase().includes('sms') || response?.data?.carrier === 'INFOBIP_SMS', 'Expected SMS failover');
});

Then('the response should indicate {string}', function (expectedMsg: string) {
  assert.ok(response?.data?.message?.includes(expectedMsg), `Expected error message: ${expectedMsg}`);
}); 