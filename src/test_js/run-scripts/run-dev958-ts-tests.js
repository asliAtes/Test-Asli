#!/usr/bin/env node

/**
 * Script to run Cucumber.js tests for DEV-958 with TypeScript support
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the reports directory exists
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Set environment variables if not already set
process.env.BASE_URL = process.env.BASE_URL || 'https://uscc-stg.kredosai.com';
process.env.API_BASE_URL = process.env.API_BASE_URL || 'https://uscc-stg.kredosai.com/api';
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'usccdevuser';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Kredos@1234';

// Optional environment variables with defaults
process.env.BROWSER = process.env.BROWSER || 'chrome';
process.env.HEADLESS = process.env.HEADLESS || 'true';

// Set a longer timeout for tests - 30 seconds instead of the default 5
process.env.CUCUMBER_TIMEOUT = '30000';

console.log('Starting DEV-958 TypeScript Tests');
console.log(`BASE_URL: ${process.env.BASE_URL}`);
console.log(`BROWSER: ${process.env.BROWSER}`);
console.log(`HEADLESS: ${process.env.HEADLESS}`);
console.log(`CUCUMBER_TIMEOUT: ${process.env.CUCUMBER_TIMEOUT}ms`);

try {
  // Run Cucumber tests with the dev-958-ts profile for TypeScript-specific feature
  const command = `npx cucumber-js --profile dev-958-ts tests/features/active/DEV-1003/DEV_1003_Create_RCS_Tab_TS.feature`;
  console.log(`Running command: ${command}`);
  
  execSync(command, {
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('Tests completed successfully');
  process.exit(0);
} catch (error) {
  console.error('Tests failed with error:', error.message);
  process.exit(1);
} 