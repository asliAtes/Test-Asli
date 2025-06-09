#!/usr/bin/env node

/**
 * Script to run Playwright tests for DEV-1003, DEV-1004, and DEV-1005
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the test-results directory exists
const resultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Set environment variables if not already set
process.env.BASE_URL = process.env.BASE_URL || 'https://uscc-stg.kredosai.com';
process.env.API_BASE_URL = process.env.API_BASE_URL || 'https://uscc-stg.kredosai.com/api';
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'usccdevuser';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Kredos@1234';

// Optional environment variables with defaults
process.env.HEADLESS = process.env.HEADLESS || 'true';

console.log('Starting Playwright Tests');
console.log(`BASE_URL: ${process.env.BASE_URL}`);
console.log(`HEADLESS: ${process.env.HEADLESS}`);

// Function to run tests
async function runTests() {
  try {
    console.log('Setting up authentication state...');
    execSync('npx playwright test tests/playwright/auth.setup.ts --project=Chrome', {
      stdio: 'inherit',
      env: process.env
    });
    
    console.log('Running DEV-1003 tests (RCS Tab)...');
    execSync('npx playwright test tests/playwright/specs/rcs-tab.spec.ts --project=Chrome', {
      stdio: 'inherit',
      env: process.env
    });

    console.log('Running DEV-1004 tests (RCS Graphs)...');
    execSync('npx playwright test tests/playwright/specs/rcs-graphs.spec.ts --project=Chrome', {
      stdio: 'inherit',
      env: process.env
    });

    console.log('Running DEV-1005 tests (RCS Tables)...');
    execSync('npx playwright test tests/playwright/specs/rcs-tables.spec.ts --project=Chrome', {
      stdio: 'inherit',
      env: process.env
    });
    
    console.log('Tests completed successfully');
    return 0;
  } catch (error) {
    console.error('Tests failed with error:', error.message);
    return 1;
  }
}

// Run tests with specified feature or all tests
async function main() {
  const args = process.argv.slice(2);
  const feature = args.find(arg => arg.startsWith('--feature='));
  
  if (feature) {
    const featureNumber = feature.split('=')[1];
    if (featureNumber === '1003') {
      console.log('Running only DEV-1003 tests...');
      execSync('npx playwright test tests/playwright/specs/rcs-tab.spec.ts --project=Chrome', {
        stdio: 'inherit',
        env: process.env
      });
    } else if (featureNumber === '1004') {
      console.log('Running only DEV-1004 tests...');
      execSync('npx playwright test tests/playwright/specs/rcs-graphs.spec.ts --project=Chrome', {
        stdio: 'inherit',
        env: process.env
      });
    } else if (featureNumber === '1005') {
      console.log('Running only DEV-1005 tests...');
      execSync('npx playwright test tests/playwright/specs/rcs-tables.spec.ts --project=Chrome', {
        stdio: 'inherit',
        env: process.env
      });
    } else {
      console.log(`Unknown feature DEV-${featureNumber}. Running all tests...`);
      return await runTests();
    }
    return 0;
  } else {
    return await runTests();
  }
}

// Run tests and exit with appropriate code
main().then(code => process.exit(code)); 