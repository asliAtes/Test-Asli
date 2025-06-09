const axios = require('axios');

// Function to test the email endpoint
async function testEmailEndpoint() {
  const BASE_URL = 'http://3.133.216.212/app4/kredos/comm/email';
  
  console.log('Testing email endpoint:', BASE_URL);
  
  // Sample test data for SendGrid
  const testData = {
    mode: "SINGLE",
    carrier: "SENDGRID",
    singleRequest: {
      to: "test@example.com",
      subject: "Important Notice Regarding Your Account",
      treatmentUserId: "12345",
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
      body: "<b>Hello TEST,</b><div><p><br>We're reaching out regarding your past due balance.</p></div>",
      timeZone: "America/New_York",
      callbackUrl: "https://api.example.com/email-status"
    }
  };
  
  try {
    console.log('📦 Sending request with data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(BASE_URL, testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    console.log('✅ Response received:', response.status);
    console.log('📋 Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.result === true) {
      console.log('✅ Test PASSED: Email sent successfully');
    } else {
      console.log('❌ Test FAILED: Email not sent successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

// Missing required field test
async function testMissingFieldValidation() {
  const BASE_URL = 'http://3.133.216.212/app4/kredos/comm/email';
  
  console.log('\nTesting validation for missing required fields');
  
  // Data with missing fields
  const testData = {
    mode: "SINGLE",
    carrier: "SENDGRID",
    singleRequest: {
      // Missing 'to' field
      subject: "Test Subject",
      treatmentUserId: "12345",
      templateId: "d-template"
    }
  };
  
  try {
    console.log('📦 Sending request with missing fields');
    
    const response = await axios.post(BASE_URL, testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    console.log('Response (unexpected success):', response.data);
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Test PASSED: Server correctly returned 400 status for missing fields');
      console.log('📋 Error details:', error.response.data.message);
      return true;
    } else {
      console.error('❌ Test FAILED: Expected 400 status but got different error');
      console.error('Error:', error.message);
      return false;
    }
  }
}

// Invalid email format test
async function testInvalidEmailFormat() {
  const BASE_URL = 'http://3.133.216.212/app4/kredos/comm/email';
  
  console.log('\nTesting validation for invalid email format');
  
  // Data with invalid email
  const testData = {
    mode: "SINGLE",
    carrier: "SENDGRID",
    singleRequest: {
      to: "not-a-valid-email",
      subject: "Test Subject",
      treatmentUserId: "12345",
      clientName: "USCC",
      templateId: "d-template",
      body: "Test body"
    }
  };
  
  try {
    console.log('📦 Sending request with invalid email format');
    
    const response = await axios.post(BASE_URL, testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    console.log('Response (unexpected success):', response.data);
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Test PASSED: Server correctly returned 400 status for invalid email format');
      console.log('📋 Error details:', error.response.data.message);
      return true;
    } else {
      console.error('❌ Test FAILED: Expected 400 status but got different error');
      console.error('Error:', error.message);
      return false;
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('=== Email Module Direct Tests ===\n');
  
  // Test 1: Basic Email Send
  const test1Result = await testEmailEndpoint();
  
  // Test 2: Missing Field Validation
  const test2Result = await testMissingFieldValidation();
  
  // Test 3: Invalid Email Format
  const test3Result = await testInvalidEmailFormat();
  
  // Summary
  console.log('\n=== Test Results Summary ===');
  console.log('Test 1 (Basic Email Send):', test1Result ? 'PASSED ✅' : 'FAILED ❌');
  console.log('Test 2 (Missing Field Validation):', test2Result ? 'PASSED ✅' : 'FAILED ❌');
  console.log('Test 3 (Invalid Email Format):', test3Result ? 'PASSED ✅' : 'FAILED ❌');
  
  const totalTests = 3;
  const passedTests = [test1Result, test2Result, test3Result].filter(Boolean).length;
  
  console.log(`\nOverall Result: ${passedTests}/${totalTests} tests passed`);
}

// Execute the tests
runAllTests(); 