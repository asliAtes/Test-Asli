import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Base configurations
export const config = {
  baseUrl: process.env.BASE_URL || 'http://3.133.216.212/app4/kredos/comm/messaging',
  timeout: parseInt(process.env.TIMEOUT || '10000'),
  emailEndpoint: process.env.BASE_URL?.replace('/messaging', '/email') || 'http://3.133.216.212/app4/kredos/comm/email',
  testPhone: process.env.TEST_PHONE_NUMBER || '+17193981666',
  rcsCapablePhone: process.env.RCS_CAPABLE_PHONE || '+12244195222',
  nonRcsPhone: process.env.NON_RCS_PHONE || '+17027064712'
};

// Utility functions
export function generateTestId(): string {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

// HTTP utilities
export async function sendRequest(endpoint: string, data: any, timeout?: number) {
  const axios = require('axios');
  
  try {
    const response = await axios.post(endpoint, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: timeout || config.timeout,
    });
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      response: error.response,
      status: error.response?.status
    };
  }
}

// Test result reporting
export function logResults(testName: string, result: any) {
  console.log(`\n========== ${testName} ==========`);
  if (result.success) {
    console.log('✅ Status:', result.status);
    console.log('📋 Response:', JSON.stringify(result.data, null, 2));
  } else {
    console.error('❌ Error:', result.error);
    if (result.response) {
      console.error('📋 Response:', JSON.stringify(result.response.data, null, 2));
    }
  }
} 