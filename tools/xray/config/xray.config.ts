import { TEST_CONFIG } from '../../config/test.config';

export const XRAY_CONFIG = {
  // Xray API endpoints
  baseUrl: 'https://xray.cloud.getxray.app/api/v2',
  
  // Authentication
  auth: {
    clientId: TEST_CONFIG.xray.clientId,
    clientSecret: TEST_CONFIG.xray.clientSecret,
  },

  // Test Execution Settings
  execution: {
    projectKey: 'KREDOS',
    testPlanKey: process.env.XRAY_TEST_PLAN_KEY,
    testEnvironments: ['Chrome'],
    testType: 'automated',
  },

  // Report Settings
  report: {
    evidencePath: '../reports/cucumber-report.json',
    screenshotPath: '../screenshots',
    includeScreenshots: true,
  },
};

export default XRAY_CONFIG; 