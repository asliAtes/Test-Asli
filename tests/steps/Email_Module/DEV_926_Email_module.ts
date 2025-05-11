import { Given, When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import assert from 'assert';
import dotenv from 'dotenv';

dotenv.config();

// Interface for email response
interface EmailResponse {
  data?: {
    result: boolean;
    statusCode: number;
    statusCodeDescription: string;
    message?: string;
    response?: any;
  };
}

// Use different variable names to avoid conflicts
let emailResponse: EmailResponse;
let emailData: any;

function generateEmailId(): string {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

Given('email test data for {string}', function (scenario: string) {
  const customerId = generateEmailId();
  const testEmail = "test@example.com";

  // Base template for required fields
  const baseTemplate = {
    mode: "SINGLE",
    carrier: "SENDGRID",
    singleRequest: {
      to: testEmail,
      subject: "Important Notice Regarding Your Account",
      treatmentUserId: customerId,
      clientName: "USCC",
      templateId: "d-b240674a8e494851a0c5bb8f016cca5f",
      firstName: "TEST",
      lastName: "USER",
      pastDue: "$187.50",
      quickPayLink: "https://pay.example.com/quickpay",
      payNumber: "+11234567890",
      link: "https://www.example.com/account",
      paAmount: "$100.00",
      paPayDate: "2025-04-10",
      messageTemplateId: "TID_MMLO_20240615",
      body: "<b>Hello TEST,</b><div><p>We're reaching out regarding your past due balance of $187.50.</p></div>",
      timeZone: "America/New_York",
      callbackUrl: "https://api.example.com/email-status"
    }
  };

  const testCases: Record<string, any> = {
    TC01: {
      ...baseTemplate, // Include all required fields for successful case
    },
    TC02: {
      mode: "SINGLE",
      carrier: "SENDGRID",
      singleRequest: {
        // Deliberately missing required fields for validation
        subject: "Important Notice Regarding Your Account",
        treatmentUserId: customerId,
        templateId: "d-b240674a8e494851a0c5bb8f016cca5f"
      }
    },
    TC03: {
      ...baseTemplate,
      singleRequest: {
        ...baseTemplate.singleRequest,
        to: "invalid-email", // Invalid email format for validation
      }
    }
  };

  emailData = testCases[scenario];
  console.log(`📦 Prepared test data for scenario ${scenario}:`, JSON.stringify(emailData, null, 2));
});

When('the email request is submitted to the communication module', async function () {
  try {
    const BASE_URL = process.env.BASE_URL?.replace('/messaging', '/email') || 'http://localhost:8080/email';
    console.log('📍 Email Request URL:', BASE_URL);
    
    emailResponse = await axios.post(BASE_URL, emailData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: parseInt(process.env.TIMEOUT || '10000'),
      validateStatus: (status) => true // Allow any status code for validation
    });

    console.log('✅ Email Response:', {
      statusCode: emailResponse.data?.statusCode,
      message: emailResponse.data?.message,
      result: emailResponse.data?.result
    });
  } catch (error: any) {
    console.error('❌ Email Request Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
    
    if (error.response) {
      emailResponse = { data: error.response.data };
    } else {
      throw error; // Re-throw network or configuration errors
    }
  }
});

Then('the email should be processed successfully', function () {
  const response = emailResponse?.data;
  console.log('🔍 Validating successful email processing:', response);

  try {
    assert.strictEqual(response?.statusCode, 200, 'Expected status code 200');
    assert.strictEqual(response?.result, true, 'Expected result to be true');
    console.log('✅ Email successfully processed');
  } catch (error: any) {
    console.error('❌ Email processing validation failed:', {
      expected: { statusCode: 200, result: true },
      actual: { statusCode: response?.statusCode, result: response?.result },
      message: response?.message
    });
    throw error;
  }
});

Then('the email response should indicate {string}', function (expectedMessage: string) {
  const response = emailResponse?.data;
  console.log('🔍 Validating email error response:', {
    expected: expectedMessage,
    actual: response
  });

  try {
    switch (expectedMessage) {
      case "400 Bad Request":
        assert.strictEqual(response?.statusCode, 400, 'Expected status code 400');
        break;
        
      case "Invalid email format":
        assert.strictEqual(response?.statusCode, 400, 'Expected status code 400');
        assert.ok(
          response?.message?.toLowerCase().includes('invalid') &&
          response?.message?.toLowerCase().includes('email'),
          'Expected error message to indicate invalid email format'
        );
        break;
        
      default:
        assert.ok(
          response?.message?.toLowerCase().includes(expectedMessage.toLowerCase()) ||
          response?.statusCodeDescription?.includes(expectedMessage),
          `Expected response to include "${expectedMessage}"`
        );
    }
    console.log('✅ Email error response validation passed');
  } catch (error: any) {
    console.error('❌ Email error response validation failed:', {
      expected: expectedMessage,
      actual: {
        statusCode: response?.statusCode,
        message: response?.message,
        description: response?.statusCodeDescription
      }
    });
    throw error;
  }
}); 