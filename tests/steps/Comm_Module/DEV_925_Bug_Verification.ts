import { Given, When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import * as assert from 'assert';
import dotenv from 'dotenv';

dotenv.config();

// Use the BASE_URL from environment variables (the same used by other tests)
const BASE_URL = process.env.BASE_URL || 'http://3.133.216.212/app4/kredos/comm/messaging';
let requestPayload: any;
let response: any;
let errorResponse: any;

// Helper function to generate a test ID
function generateId(): string {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

/**
 * Common steps
 */
Given('I prepare a standard SMS message request', function () {
  const customerId = generateId();
  const acctNum = generateId();
  const testPhone = process.env.TEST_PHONE_NUMBER || '+17193981666';
  
  requestPayload = {
    carrier: 'TWILIO',
    schedule: false,
    smsRequestList: [
      {
        toNumber: testPhone,
        message: 'Bug verification test message',
        treatmentUserId: customerId,
        clientName: 'USCC',
        acctNum: acctNum
      }
    ]
  };
});

Given('I prepare a standard message request', function () {
  const customerId = generateId();
  const acctNum = generateId();
  const testPhone = process.env.TEST_PHONE_NUMBER || '+17193981666';
  
  requestPayload = {
    schedule: false,
    smsRequestList: [
      {
        toNumber: testPhone,
        message: 'RCS bug verification test message',
        treatmentUserId: customerId,
        clientName: 'USCC',
        acctNum: acctNum
      }
    ]
  };
});

Given('I set the carrier to {string}', function (carrier: string) {
  requestPayload.carrier = carrier;
  
  // Special case for BNE which has a different format
  if (carrier === 'BNE') {
    // Convert the standard SMS payload to BNE format
    const phone = requestPayload.smsRequestList[0].toNumber;
    const message = requestPayload.smsRequestList[0].message;
    const customerId = requestPayload.smsRequestList[0].treatmentUserId;
    
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Format as YYYY-MM-DDT23:59
    const deliveryExpiry = `${year}-${month}-${day}T23:59`;
    
    requestPayload = {
      carrier: 'BNE',
      bulkBneRequest: {
        bneBulkRequest: {
          correlationId: customerId,
          messages: [
            {
              address: `tel:${phone}`,
              language: 'en-US',
              dynamicTag: [
                message
              ],
              timezone: 'America/New_York'
            }
          ],
          // Use current day with 23:59 time as specified
          deliveryExpiryTime: deliveryExpiry
        },
        serviceGrade: '3080'
      }
    };
  }
});

Given('I set a valid phone number', function () {
  const testPhone = process.env.TEST_PHONE_NUMBER || '+17193981666';
  
  if (requestPayload.smsRequestList) {
    requestPayload.smsRequestList[0].toNumber = testPhone;
  }
});

Given('I set a valid T-Mobile phone number {string}', function (phoneNumber: string) {
  if (requestPayload.bulkBneRequest) {
    requestPayload.bulkBneRequest.bneBulkRequest.messages[0].address = `tel:${phoneNumber}`;
  } else if (requestPayload.smsRequestList) {
    requestPayload.smsRequestList[0].toNumber = phoneNumber;
  }
});

Given('I prepare a malformed JSON message request', function () {
  // This is intentionally malformed JSON to test error handling
  requestPayload = {
    malformed: true,
    payload: '{\"carrier\": \"TWILIO\"' // Intentionally malformed
  };
});

Given('I set message content exceeding {int} characters', function (length: number) {
  // Generate a string longer than the specified length
  let longMessage = '';
  for (let i = 0; i < length + 100; i++) {
    longMessage += 'A';
  }
  
  if (requestPayload.smsRequestList) {
    requestPayload.smsRequestList[0].message = longMessage;
  }
});

Given('I set schedule=true without scheduleAt parameter', function () {
  requestPayload.schedule = true;
  // Intentionally not setting scheduleAt parameter
});

/**
 * When steps
 */
When('I submit the request to the communication module', async function () {
  try {
    console.log('📍 Request URL:', BASE_URL);
    console.log('📦 Request body:', requestPayload);
    
    response = await axios.post(BASE_URL, requestPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: parseInt(process.env.TIMEOUT || '10000'),
    });
    
    console.log('✅ Axios response:', response.data);
  } catch (error: any) {
    console.error('❌ Axios error:', error.message);
    errorResponse = error.response;
    
    if (errorResponse) {
      console.log('Error response:', errorResponse.data);
    }
  }
});

When('I submit the invalid request to the communication module', async function () {
  try {
    console.log('📍 Request URL:', BASE_URL);
    console.log('📦 Malformed payload:', requestPayload.payload);
    
    // Send malformed JSON explicitly
    response = await axios.post(
      BASE_URL, 
      requestPayload.payload, 
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: parseInt(process.env.TIMEOUT || '10000'),
      }
    );
    
    console.log('✅ Axios response:', response.data);
  } catch (error: any) {
    console.error('❌ Axios error:', error.message);
    errorResponse = error.response;
    
    if (errorResponse) {
      console.log('Error response:', errorResponse.data);
    }
  }
});

/**
 * Then steps
 */
Then('the response should have status code {int}', function (statusCode: number) {
  const actualStatusCode = response?.status || errorResponse?.status || 
                          response?.data?.statusCode || errorResponse?.data?.statusCode;
  
  console.log(`Expected status code: ${statusCode}, Actual: ${actualStatusCode}`);
  
  if (statusCode === 200) {
    if (actualStatusCode === 200 || (response?.data?.result === true)) {
      assert.ok(true, 'Status code 200 or successful result confirmed');
    } else {
      assert.fail(`Expected 200 but got ${actualStatusCode}`);
    }
  } else {
    // For error cases, we should check errorResponse
    if (actualStatusCode === statusCode) {
      assert.ok(true, `Error status code ${statusCode} confirmed`);
    } else if (statusCode === 400 && actualStatusCode === 500) {
      console.log('⚠️ KNOWN ISSUE: API returning 500 instead of 400');
      assert.ok(false, `API still returning 500 instead of 400 - bug not fixed`);
    } else {
      assert.fail(`Expected ${statusCode} but got ${actualStatusCode}`);
    }
  }
});

Then('the message should be routed to BNE', function () {
  // For BNE test case which is known to fail with 500
  if (response?.data?.statusCode === 500) {
    console.log('⚠️ KNOWN ISSUE: BNE integration is still failing with 500 error');
    assert.ok(false, 'BNE integration bug is not fixed');
    return;
  }
  
  // Check for successful response
  assert.ok(response?.data?.result, 'Expected successful result');
  
  // Check for BNE routing indicators 
  // With new response format, we need to check carrier in request and successful response
  const isBneRouted = 
    response?.data?.message?.includes('BNE') || 
    response?.data?.carrier?.includes('BNE') ||
    (requestPayload?.carrier === 'BNE' && response?.data?.result === true && response?.data?.statusCode === 200);
  
  assert.ok(isBneRouted, 'Response should indicate BNE routing');
  
  console.log('✅ SUCCESS: BNE integration is now working with the updated date format!');
});

Then('the response should not contain stack trace information', function () {
  const responseBody = JSON.stringify(errorResponse?.data || {});
  
  if (responseBody.includes('at ') || 
      responseBody.includes('.java:') || 
      responseBody.includes('com.vassarlabs')) {
    console.log('⚠️ KNOWN ISSUE: Response still contains stack trace information');
    assert.ok(false, 'Stack trace information bug is not fixed');
  } else {
    assert.ok(true, 'No stack trace information in the response');
  }
});

Then('the response should indicate message length limit exceeded', function () {
  const responseData = errorResponse?.data || {};
  
  if (responseData.statusCode === 500) {
    console.log('⚠️ KNOWN ISSUE: Large message content still causes 500 error instead of 400');
    assert.ok(false, 'Large message handling bug is not fixed');
    return;
  }
  
  assert.ok(responseData.message?.includes('length') || 
            responseData.message?.includes('size') ||
            responseData.message?.includes('too large'), 
            'Response should mention message length limits');
});

Then('the response should clearly indicate scheduleAt parameter is required', function () {
  const responseData = errorResponse?.data || {};
  
  if (!responseData.message?.includes('scheduleAt') && 
      !responseData.message?.includes('schedule parameter')) {
    console.log('⚠️ KNOWN ISSUE: Scheduling parameter requirements not clearly indicated');
    assert.ok(false, 'Scheduling parameter requirement bug is not fixed');
  } else {
    assert.ok(true, 'Response correctly indicates scheduleAt parameter is required');
  }
}); 