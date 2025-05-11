const axios = require('axios');

const BASE_URL = 'http://3.133.216.212/app4/kredos/comm/messaging';

// Create a random ID for the test
const generateTestId = () => {
  return Math.floor(Math.random() * 1000000000).toString();
};

// Format the phone number
const formatPhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  return `+${phoneNumber}`;
};

// User-provided test phone number
const testPhone = formatPhoneNumber('17472920712');

// Function to send a test message
async function sendTestMessage() {
  const acctNum = generateTestId();
  const customerId = generateTestId();
  
  const timestamp = new Date().toISOString();
  const message = `RCS failover test to ${testPhone} at ${timestamp}`;
  
  const data = {
    carrier: 'INFOBIP_RCS',
    schedule: false,
    smsRequestList: [
      {
        toNumber: testPhone,
        message: message,
        treatmentUserId: customerId,
        clientName: 'USCC',
        acctNum: acctNum
      }
    ]
  };
  
  console.log('📍 Request URL:', BASE_URL);
  console.log('📦 Request body:', JSON.stringify(data, null, 2));
  
  try {
    const response = await axios.post(BASE_URL, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
    
    // Check if the message was successfully processed
    if (response.data.result === true) {
      console.log('✅ Message successfully processed!');
      
      // Log the message details for verification on the recipient side
      console.log(`\n📱 VERIFICATION INSTRUCTIONS 📱`);
      console.log(`1. Check the phone at number ${testPhone}`);
      console.log(`2. You should have received a message with text: "${message}"`);
      console.log(`3. Note whether the message was received as:`);
      console.log(`   - RCS message (usually in your default messaging app with rich features)`);
      console.log(`   - Regular SMS (plain text message)`);
      console.log(`\nAPI response does NOT indicate if failover occurred. You must check the phone.`);
      
      // Print the message details that would help with verification
      if (response.data.response && response.data.response.successfulMessages) {
        const msg = response.data.response.successfulMessages[0];
        if (msg) {
          console.log('\n📋 Message Details for Verification:');
          console.log('Message ID:', msg.messageId || 'Not provided');
          console.log('Recipient:', msg.to || testPhone);
          console.log('Timestamp:', new Date().toLocaleString());
        }
      }
    } else {
      console.log('❌ Message processing failed.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('❌ Response data:', error.response.data);
    }
  }
}

// Run the test
sendTestMessage(); 