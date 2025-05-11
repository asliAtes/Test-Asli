import { Given, When, Then, BeforeAll } from '@cucumber/cucumber';
import axios from 'axios';
import assert from 'assert';
import { defineCommonAssertions } from '../shared/common_assertions';
import { generateTestId, generateFutureDate, config } from '../shared/utils';

// Initialize common assertions
let assertions: any;
BeforeAll(function () {
  assertions = defineCommonAssertions();
});

/**
 * Namespace for Infobip SMS channel tests (DEV-927)
 * Implements test scenarios for verifying the Infobip SMS channel functionality
 */
namespace InfobipSmsTests {
  // Configuration for test phone numbers
  const testPhoneConfig = {
    validPhoneNumber: process.env.TEST_PHONE_NUMBER || '+17193981666',
    invalidPhoneNumber: '123456',  // Not in E.164 format
  };

  // SMS request list for different test cases
  const smsRequestList: any = {};
  
  // Base URL for the communication module
  const baseUrl = process.env.API_BASE_URL || 'http://3.133.216.212/app4/kredos/comm';
  
  // Store responses for shared access across steps
  let responses: any = {};
  let errors: any = {};

  // Store test case IDs by scenario
  let currentTestCaseId: number = 0;

  /**
   * Set up test data for different scenarios
   */
  Given('I have message details for TC{int} - {string}', function (testCaseId: number, scenario: string) {
    // Store current test case ID for use in other steps
    currentTestCaseId = testCaseId;
    const currentTestCase = testCaseId;
    
    // Common test data
    const acctNum = generateTestId();
    const customerId = generateTestId();
    const testPhone = testPhoneConfig.validPhoneNumber;
    
    // Base request structure
    let requestData: any = {
      carrier: 'INFOBIP_SMS',
      schedule: false,
      smsRequestList: [
        {
          toNumber: testPhone,
          message: `Test message for ${scenario}`,
          treatmentUserId: customerId,
          clientName: 'USCC',
          acctNum: acctNum
        }
      ]
    };
    
    // Customize based on test case
    switch (currentTestCase) {
      case 1: // Basic SMS through Infobip
        // Use default setup
        break;
        
      case 2: // Customer-specific sender code
        requestData.smsRequestList[0].clientName = 'AT&T';
        requestData.smsRequestList[0].metadata = { 
          expectedSenderCode: 'ATTSENDER' 
        };
        break;
        
      case 3: // Different customer sender code
        requestData.smsRequestList[0].clientName = 'VERIZON';
        requestData.smsRequestList[0].metadata = { 
          expectedSenderCode: 'VZWSENDER' 
        };
        break;
        
      case 4: // Detailed logging verification
        requestData.smsRequestList[0].message = `Detailed logging test with ID: ${generateTestId()}`;
        requestData.logLevel = 'DETAILED';
        break;
        
      case 5: // Scheduled SMS message
        requestData.schedule = true;
        requestData.scheduleAt = generateFutureDate(24); // 24 hours in future
        requestData.zoneId = "America/New_York";
        break;
        
      case 6: // Empty message content
        requestData.smsRequestList[0].message = ''; // Empty message
        break;
        
      case 7: // Invalid phone number
        requestData.smsRequestList[0].toNumber = testPhoneConfig.invalidPhoneNumber;
        break;
        
      case 8: // Rapid message sending
        // Create 5 messages for quick succession sending
        requestData.smsRequestList = [];
        for (let i = 0; i < 5; i++) {
          requestData.smsRequestList.push({
            toNumber: testPhone,
            message: `Rapid message ${i+1} for throttling test`,
            treatmentUserId: `${customerId}-${i}`,
            clientName: 'USCC',
            acctNum: `${acctNum}-${i}`
          });
        }
        break;
        
      case 9: // Temporary failure scenario
        requestData.simulateTemporaryFailure = true;
        break;
        
      case 10: // Service unavailable
        requestData.simulateServiceUnavailable = true;
        break;
        
      case 11: // Template-based SMS
        // Set up template parameters
        requestData.smsRequestList[0].useTemplate = true;
        requestData.smsRequestList[0].templateId = 'WELCOME_TEMPLATE';
        requestData.smsRequestList[0].templateParams = {
          firstName: 'John',
          accountNumber: acctNum.substring(0, 4),
          amount: '$50.00'
        };
        // Template messages don't require the message field
        delete requestData.smsRequestList[0].message;
        break;
        
      default:
        throw new Error(`Test case TC${currentTestCase} is not implemented`);
    }
    
    // Store request for this test case
    smsRequestList[currentTestCase] = requestData;
    
    console.log(`Test data prepared for TC${currentTestCase} - ${scenario}`);
  });

  /**
   * Submit the SMS request to the Infobip channel
   */
  When('I submit the SMS request', async function () {
    const currentTestCase = currentTestCaseId;
    const requestData = smsRequestList[currentTestCase];
    
    try {
      console.log(`Submitting request for TC${currentTestCase}...`);
      const response = await axios.post(`${baseUrl}/sms`, requestData);
      responses[currentTestCase] = response;
      
      // Store in world context for shared steps to access
      this.response = response;
      
      console.log(`Response received for TC${currentTestCase}`);
    } catch (error) {
      console.error(`Error in TC${currentTestCase}:`, error.message);
      errors[currentTestCase] = error.response || error;
      
      // Store in world context for shared steps to access
      this.response = error.response;
    }
  });

  /**
   * Submit the SMS request with template parameters
   */
  When('I submit the SMS request with template parameters', async function () {
    const currentTestCase = currentTestCaseId;
    const requestData = smsRequestList[currentTestCase];
    
    // Ensure we have template data
    if (!requestData.smsRequestList[0].useTemplate || !requestData.smsRequestList[0].templateId) {
      throw new Error('Template configuration is missing for the test case');
    }
    
    try {
      console.log(`Submitting template-based request for TC${currentTestCase}...`);
      console.log('Template ID:', requestData.smsRequestList[0].templateId);
      console.log('Template parameters:', requestData.smsRequestList[0].templateParams);
      
      const response = await axios.post(`${baseUrl}/sms`, requestData);
      responses[currentTestCase] = response;
      
      // Store in world context for shared steps to access
      this.response = response;
      
      console.log(`Response received for template-based message in TC${currentTestCase}`);
    } catch (error) {
      console.error(`Error in template-based message TC${currentTestCase}:`, error.message);
      errors[currentTestCase] = error.response || error;
      
      // Store in world context for shared steps to access
      this.response = error.response;
    }
  });

  /**
   * Verifies a successful response for Infobip SMS
   */
  Then('I should receive a successful response for Infobip SMS', function () {
    const currentTestCase = currentTestCaseId;
    const response = responses[currentTestCase];
    
    assert(response, `No response found for TC${currentTestCase}`);
    
    assertions.validateSuccessResponse(response);
    assertions.validateResponseContains(response, {
      data: {
        channel: 'INFOBIP',
        status: 'ACCEPTED'
      }
    });
    
    console.log(`Verified successful response for TC${currentTestCase}`);
  });

  /**
   * Verifies that the sender code matches the customer configuration
   */
  Then('the sender code should match the customer configuration', function () {
    const currentTestCase = currentTestCaseId;
    const response = responses[currentTestCase];
    const request = smsRequestList[currentTestCase];
    
    assert(response, `No response found for TC${currentTestCase}`);
    assert(request.smsRequestList[0].metadata.expectedSenderCode, `No expected sender code found for TC${currentTestCase}`);
    
    assertions.validateResponseContains(response, {
      data: {
        senderCode: request.smsRequestList[0].metadata.expectedSenderCode
      }
    });
    
    console.log(`Verified sender code matches customer configuration for TC${currentTestCase}`);
  });

  /**
   * Verifies that detailed logging information is present
   */
  Then('the logs should contain detailed request and response information', function () {
    const currentTestCase = currentTestCaseId;
    const response = responses[currentTestCase];
    
    assert(response, `No response found for TC${currentTestCase}`);
    
    // In an actual implementation, we might need to check the logs in a database or log file
    // For now, we'll just verify the response contains the expected log level
    assertions.validateResponseContains(response, {
      data: {
        logLevel: 'DETAILED'
      }
    });
    
    console.log(`Verified logs contain detailed information for TC${currentTestCase}`);
  });

  /**
   * Verifies that the scheduled time is properly set
   */
  Then('the scheduled time should be properly set', function () {
    const currentTestCase = currentTestCaseId;
    const response = responses[currentTestCase];
    const request = smsRequestList[currentTestCase];
    
    assert(response, `No response found for TC${currentTestCase}`);
    assert(request.scheduleAt, `No scheduled time found for TC${currentTestCase}`);
    
    assertions.validateResponseContains(response, {
      data: {
        scheduledTime: request.scheduleAt
      }
    });
    
    console.log(`Verified scheduled time is properly set for TC${currentTestCase}`);
  });

  /**
   * Verifies an error response for empty message
   */
  Then('I should receive an error response for empty message', function () {
    const currentTestCase = currentTestCaseId;
    const response = responses[currentTestCase];
    
    assert(response, `No response found for TC${currentTestCase}`);
    
    assertions.validateErrorResponse(response, 400, 'Bad Request');
    assertions.validateErrorResponseContains(response, 'Message content cannot be empty');
    
    console.log(`Verified error response for empty message in TC${currentTestCase}`);
  });

  /**
   * Verifies an error response for invalid phone number
   */
  Then('I should receive an error response for invalid phone number', function () {
    const currentTestCase = currentTestCaseId;
    const response = responses[currentTestCase];
    
    assert(response, `No response found for TC${currentTestCase}`);
    
    assertions.validateErrorResponse(response, 400, 'Bad Request');
    assertions.validateErrorResponseContains(response, 'Invalid E.164 phone number format');
    
    console.log(`Verified error response for invalid phone number in TC${currentTestCase}`);
  });

  /**
   * Verifies that all messages in a batch are processed correctly with throttling
   */
  Then('all messages should be processed correctly with throttling', function () {
    const currentTestCase = currentTestCaseId;
    const response = responses[currentTestCase];
    
    assert(Array.isArray(response), `No batch responses found for TC${currentTestCase}`);
    
    // Verify all responses were successful
    response.forEach((response: any, index: number) => {
      assertions.validateSuccessResponse(response);
      assertions.validateResponseContains(response, {
        data: {
          channel: 'INFOBIP',
          status: 'ACCEPTED'
        }
      });
    });
    
    console.log(`Verified all ${response.length} messages were processed correctly for TC${currentTestCase}`);
  });

  /**
   * Verifies that the system retries and eventually succeeds
   */
  Then('the system should retry and eventually succeed', function () {
    const currentTestCase = currentTestCaseId;
    const response = responses[currentTestCase];
    
    assert(response, `No response found for TC${currentTestCase}`);
    
    assertions.validateSuccessResponse(response);
    assertions.validateResponseContains(response, {
      data: {
        channel: 'INFOBIP',
        status: 'ACCEPTED',
        attemptNumber: 2
      }
    });
    
    console.log(`Verified system retry succeeded for TC${currentTestCase}`);
  });

  /**
   * Verifies that the system handles service unavailable error appropriately
   */
  Then('the system should handle the error appropriately', function () {
    const currentTestCase = currentTestCaseId;
    const error = errors[currentTestCase];
    
    assert(error, `No error found for TC${currentTestCase}`);
    
    assertions.validateErrorResponse(error, 503, 'Service Unavailable');
    
    console.log(`Verified service unavailable error handling for TC${currentTestCase}`);
  });

  /**
   * Verifies the template was properly populated
   */
  Then('the template should be properly populated', function () {
    const currentTestCase = currentTestCaseId;
    const response = responses[currentTestCase];
    const request = smsRequestList[currentTestCase];
    
    assert(response, `No response found for TC${currentTestCase}`);
    
    // Verify template information is included in the response
    assertions.validateResponseContains(response, {
      data: {
        templateId: request.smsRequestList[0].templateId
      }
    });
    
    // Check if templated content is in the response
    if (response.data && response.data.processedContent) {
      // Verify each parameter was substituted
      Object.entries(request.smsRequestList[0].templateParams).forEach(([key, value]) => {
        assert(
          response.data.processedContent.includes(value.toString()),
          `Template parameter ${key}=${value} was not included in the processed content`
        );
      });
    }
    
    console.log(`Verified template was properly populated for TC${currentTestCase}`);
  });
}

// Initialize the steps for Infobip SMS tests
InfobipSmsTests; 