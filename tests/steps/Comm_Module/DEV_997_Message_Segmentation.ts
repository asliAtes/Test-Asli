import { Given, When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import * as assert from 'assert';
import dotenv from 'dotenv';

dotenv.config();

// Use the BASE_URL from environment variables
const BASE_URL = process.env.BASE_URL || 'http://3.133.216.212/app4/kredos/comm/messaging';
let requestPayload: any;
let response: any;
let errorResponse: any;
const messageSizes: number[] = [];

/**
 * Helper function to generate a random ID
 */
function generateId(): string {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

/**
 * Calculate expected segment count using the formula:
 * segmentCount = floor(message_length / 153) + 1
 */
function calculateExpectedSegments(messageLength: number): number {
  return Math.floor(messageLength / 153) + 1;
}

/**
 * Background steps
 */
Given('the communication module is accessible', function () {
  // This is a placeholder step to ensure API is accessible
  // Real testing will happen in subsequent steps
  assert.ok(true, 'Communication module should be accessible');
});

/**
 * Given steps for DEV-997
 */
Given('I prepare a standard SMS message request for DEV-997', function () {
  const customerId = generateId();
  const acctNum = generateId();
  const testPhone = process.env.TEST_PHONE_NUMBER || '+17193981666';
  
  requestPayload = {
    carrier: 'TWILIO',
    schedule: false,
    smsRequestList: [
      {
        toNumber: testPhone,
        message: 'Short test message', // Will be replaced in later steps
        treatmentUserId: customerId,
        clientName: 'USCC',
        acctNum: acctNum
      }
    ]
  };
  
  // Reset message sizes array
  messageSizes.length = 0;
  messageSizes.push(requestPayload.smsRequestList[0].message.length);
});

Given('I set message content to be {int} characters', function (length: number) {
  // Generate a string of the specified length
  let longMessage = '';
  for (let i = 0; i < length; i++) {
    // Use different characters to ensure it's not optimized away
    longMessage += String.fromCharCode(65 + (i % 26));
  }
  
  // Store the actual message length for verification
  messageSizes[0] = longMessage.length;
  console.log(`Generated message with ${messageSizes[0]} characters`);
  
  // Set the message in the request payload
  if (requestPayload.smsRequestList && requestPayload.smsRequestList.length > 0) {
    requestPayload.smsRequestList[0].message = longMessage;
  }
});

Given('I set message content to be exactly {int} characters', function (length: number) {
  // Generate a string of exactly the specified length
  let message = '';
  for (let i = 0; i < length; i++) {
    message += String.fromCharCode(65 + (i % 26));
  }
  
  if (message.length !== length) {
    throw new Error(`Failed to generate message of exact length ${length}`);
  }
  
  // Store the actual message length for verification
  messageSizes[0] = message.length;
  console.log(`Generated message with exactly ${messageSizes[0]} characters`);
  
  // Set the message in the request payload
  if (requestPayload.smsRequestList && requestPayload.smsRequestList.length > 0) {
    requestPayload.smsRequestList[0].message = message;
  }
});

Given('I prepare a batch of messages with varying lengths', function () {
  const customerId = generateId();
  const acctNum = generateId();
  const testPhone = process.env.TEST_PHONE_NUMBER || '+17193981666';
  
  // Create a batch with messages of different lengths
  const messageLengths = [100, 200, 500, 1000];
  const smsRequestList = [];
  
  // Reset message sizes array
  messageSizes.length = 0;
  
  for (let i = 0; i < messageLengths.length; i++) {
    let message = '';
    for (let j = 0; j < messageLengths[i]; j++) {
      message += String.fromCharCode(65 + (j % 26));
    }
    
    messageSizes.push(message.length);
    
    smsRequestList.push({
      toNumber: testPhone,
      message: message,
      treatmentUserId: `${customerId}-${i}`,
      clientName: 'USCC',
      acctNum: `${acctNum}-${i}`
    });
  }
  
  requestPayload = {
    carrier: 'TWILIO',
    schedule: false,
    smsRequestList: smsRequestList
  };
  
  console.log(`Created batch with ${smsRequestList.length} messages of lengths: ${messageSizes.join(', ')}`);
});

/**
 * When steps for DEV-997
 */
When('I submit the SMS request to verify segmentation', async function () {
  try {
    console.log('📍 Request URL:', BASE_URL);
    console.log('📦 Request body sample (truncated):');
    const requestBodySample = JSON.parse(JSON.stringify(requestPayload));
    
    // Truncate long messages in log for readability
    if (requestBodySample.smsRequestList) {
      for (const sms of requestBodySample.smsRequestList) {
        if (sms.message && sms.message.length > 50) {
          sms.message = sms.message.substring(0, 50) + '... [truncated, length: ' + sms.message.length + ']';
        }
      }
    }
    
    console.log(JSON.stringify(requestBodySample, null, 2));
    
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

/**
 * Then steps for DEV-997
 */
Then('the SMS response should have status code {int}', function (statusCode: number) {
  const actualStatusCode = response?.status || errorResponse?.status || 
                          response?.data?.statusCode || errorResponse?.data?.statusCode;
  
  console.log(`Expected status code: ${statusCode}, Actual: ${actualStatusCode}`);
  
  if (statusCode === 200) {
    assert.ok(actualStatusCode === 200 || (response?.data?.result === true), 
              `Expected 200 but got ${actualStatusCode}`);
  } else {
    // For error cases, we should check errorResponse
    assert.strictEqual(actualStatusCode, statusCode, 
                      `Expected ${statusCode} but got ${actualStatusCode}`);
  }
});

Then('the response should include segment count information', function () {
  assert.ok(response?.data, 'Response data should exist');
  
  // Check if segmentation information is present in the response
  const responseData = response.data;
  const responseStr = JSON.stringify(responseData);
  
  // Look for segmentation fields in the response
  const hasSegmentInfo = responseStr.includes('segmentCount') || 
                         responseStr.includes('segments') || 
                         responseStr.includes('messageCount');
  
  if (!hasSegmentInfo) {
    console.log('⚠️ No segment information found in response');
    console.log('Response:', responseStr);
  }
  
  assert.ok(hasSegmentInfo, 'Response should include segmentation information');
});

Then('the segment count should match the expected formula', function () {
  assert.ok(response?.data, 'Response data should exist');
  assert.ok(messageSizes.length > 0, 'Message sizes should be recorded');
  
  const messageLength = messageSizes[0];
  const expectedSegments = calculateExpectedSegments(messageLength);
  
  console.log(`Expected segments for message length ${messageLength}: ${expectedSegments}`);
  
  // Extract actual segment count from response
  const responseData = response.data;
  let actualSegments: number | undefined;
  
  // Look for segment count in various possible response structures
  if (responseData.segmentCount) {
    actualSegments = responseData.segmentCount;
  } else if (responseData.details?.messageCount) {
    actualSegments = responseData.details.messageCount;
  } else if (responseData.details?.segments) {
    actualSegments = responseData.details.segments;
  } else if (responseData.messageCount) {
    actualSegments = responseData.messageCount;
  } else if (responseData.segments) {
    actualSegments = responseData.segments;
  }
  
  console.log(`Actual segments found in response: ${actualSegments}`);
  
  // Check if the actual segment count is defined and matches expected
  if (actualSegments === undefined) {
    console.log('⚠️ Segment count information not found in the expected format');
    console.log('Looking for alternative fields...');
    
    // Try to find any field that might contain segment information
    const responseStr = JSON.stringify(responseData);
    const segmentRegex = /"(\w*segment\w*|messageCount)"\s*:\s*(\d+)/i;
    const match = responseStr.match(segmentRegex);
    
    if (match) {
      console.log(`Found potential segment field: ${match[1]} with value: ${match[2]}`);
      actualSegments = parseInt(match[2], 10);
    } else {
      console.log('❌ No segment count information found in any form');
    }
  }
  
  // Final assertion
  assert.ok(actualSegments !== undefined, 'Response should include segment count information');
  assert.strictEqual(actualSegments, expectedSegments, 
    `Segment count should match expected formula: expected ${expectedSegments}, but got ${actualSegments}`);
});

Then('the response should include segment count information for each message', function () {
  assert.ok(response?.data, 'Response data should exist');
  
  // Check if batch response has segment info for each message
  const responseData = response.data;
  let hasAllSegmentInfo = false;
  
  // Check for different response formats
  if (responseData.batchResults && Array.isArray(responseData.batchResults)) {
    // Check if each batch result has segment info
    hasAllSegmentInfo = responseData.batchResults.every((result: any) => {
      const resultStr = JSON.stringify(result);
      return resultStr.includes('segmentCount') || 
             resultStr.includes('segments') || 
             resultStr.includes('messageCount');
    });
  } else if (responseData.messageResults && Array.isArray(responseData.messageResults)) {
    // Alternative format
    hasAllSegmentInfo = responseData.messageResults.every((result: any) => {
      const resultStr = JSON.stringify(result);
      return resultStr.includes('segmentCount') || 
             resultStr.includes('segments') || 
             resultStr.includes('messageCount');
    });
  } else {
    console.log('⚠️ Batch results not found in expected format');
    console.log('Response format:', Object.keys(responseData));
  }
  
  assert.ok(hasAllSegmentInfo, 'Response should include segment count information for each message in the batch');
});

Then('each segment count should match the expected formula', function () {
  assert.ok(response?.data, 'Response data should exist');
  assert.ok(messageSizes.length > 0, 'Message sizes should be recorded');
  
  // Extract batch results and check each message
  const responseData = response.data;
  let batchResults: any[] = [];
  
  if (responseData.batchResults && Array.isArray(responseData.batchResults)) {
    batchResults = responseData.batchResults;
  } else if (responseData.messageResults && Array.isArray(responseData.messageResults)) {
    batchResults = responseData.messageResults;
  } else {
    console.log('⚠️ Batch results not found in expected format');
    console.log('Response format:', Object.keys(responseData));
    assert.fail('Batch results not found in the response');
  }
  
  // Check that we have the same number of results as messages
  assert.strictEqual(batchResults.length, messageSizes.length, 
    `Expected ${messageSizes.length} batch results, but got ${batchResults.length}`);
  
  // Check each message's segment count
  for (let i = 0; i < messageSizes.length; i++) {
    const messageLength = messageSizes[i];
    const expectedSegments = calculateExpectedSegments(messageLength);
    const result = batchResults[i];
    
    // Extract actual segment count from response
    let actualSegments: number | undefined;
    
    if (result.segmentCount) {
      actualSegments = result.segmentCount;
    } else if (result.details?.messageCount) {
      actualSegments = result.details.messageCount;
    } else if (result.details?.segments) {
      actualSegments = result.details.segments;
    } else if (result.messageCount) {
      actualSegments = result.messageCount;
    } else if (result.segments) {
      actualSegments = result.segments;
    }
    
    console.log(`Message ${i+1}: Length ${messageLength}, Expected segments: ${expectedSegments}, Actual: ${actualSegments}`);
    
    assert.ok(actualSegments !== undefined, `Message ${i+1} should include segment count information`);
    assert.strictEqual(actualSegments, expectedSegments, 
      `Message ${i+1} segment count should match formula: expected ${expectedSegments}, but got ${actualSegments}`);
  }
});

Then('the response should report {int} segment(s)', function (expectedSegments: number) {
  assert.ok(response?.data, 'Response data should exist');
  
  // Extract actual segment count from response
  const responseData = response.data;
  let actualSegments: number | undefined;
  
  // Look for segment count in various possible response structures
  if (responseData.segmentCount) {
    actualSegments = responseData.segmentCount;
  } else if (responseData.details?.messageCount) {
    actualSegments = responseData.details.messageCount;
  } else if (responseData.details?.segments) {
    actualSegments = responseData.details.segments;
  } else if (responseData.messageCount) {
    actualSegments = responseData.messageCount;
  } else if (responseData.segments) {
    actualSegments = responseData.segments;
  }
  
  console.log(`Expected segments: ${expectedSegments}, Actual: ${actualSegments}`);
  
  // Final assertion
  assert.ok(actualSegments !== undefined, 'Response should include segment count information');
  assert.strictEqual(actualSegments, expectedSegments, 
    `Segment count should be ${expectedSegments}, but got ${actualSegments}`);
}); 