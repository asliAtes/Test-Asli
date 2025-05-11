#!/usr/bin/env node

/**
 * Cucumber Test Runner with Module Support
 * 
 * Usage:
 *   node test-runner.js [moduleType] [tag]
 * 
 * Examples:
 *   node test-runner.js email       - Run all email tests
 *   node test-runner.js rcs @basic  - Run basic RCS tests
 *   node test-runner.js test-mode   - Run Infobip SMS Test Mode tests
 *   node test-runner.js all         - Run all tests
 *   node test-runner.js customer    - Run customer flag tests
 *   node test-runner.js sms-flag    - Run global SMS channel flag tests
 *   node test-runner.js infobip     - Run Infobip SMS channel tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const moduleType = process.argv[2] || 'all';
const tag = process.argv[3] || '';

// Create a reports directory if it doesn't exist
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Create support directory if it doesn't exist
const supportDir = path.join(__dirname, 'tests/support');
if (!fs.existsSync(supportDir)) {
  fs.mkdirSync(supportDir, { recursive: true });
}

// Make sure the env.ts file exists
const envFile = path.join(supportDir, 'env.ts');
if (!fs.existsSync(envFile)) {
  console.error('Error: env.ts file is missing!');
  console.error('Please create the file at: ' + envFile);
  process.exit(1);
}

// Base options for all commands
const baseOptions = '--require-module ts-node/register';
const format = '--format progress-bar --format html:reports/report.html';
let command = '';

// Configure command based on module type
switch (moduleType.toLowerCase()) {
  case 'email':
    console.log('🔍 Running Email Module Tests');
    command = `npx cucumber-js ${baseOptions} ${format} tests/features/Email_Module ${tag ? `--tags "${tag}"` : ''}`;
    break;
    
  case 'rcs':
    console.log('🔍 Running RCS Module Tests');
    command = `npx cucumber-js ${baseOptions} ${format} tests/features/Comm_Module/DEV_931_* ${tag ? `--tags "${tag}"` : ''}`;
    break;
    
  case 'sms':
    console.log('🔍 Running SMS Module Tests');
    command = `npx cucumber-js ${baseOptions} ${format} tests/features/Comm_Module/DEV_926_* ${tag ? `--tags "${tag}"` : ''}`;
    break;
    
  case 'customer':
    console.log('🔍 Running Customer Flag Tests');
    command = `npx cucumber-js ${baseOptions} ${format} tests/features/Comm_Module/DEV_932_* ${tag ? `--tags "${tag}"` : ''}`;
    break;
    
  case 'test-mode':
    console.log('🔍 Running Infobip SMS Test Mode Tests');
    command = `npx cucumber-js ${baseOptions} ${format} tests/features/Comm_Module/DEV_928/DEV_928_Infobip_SMS_Test_Mode.feature ${tag ? `--tags "${tag}"` : ''}`;
    break;
    
  case 'sms-flag':
    console.log('🔍 Running Global SMS Channel Flag Tests');
    command = `npx cucumber-js ${baseOptions} ${format} tests/features/Comm_Module/DEV_929_Global_SMS_Channel_Flag.feature ${tag ? `--tags "${tag}"` : ''}`;
    break;
    
  case 'infobip':
    console.log('🔍 Running Infobip SMS Channel Tests');
    command = `npx cucumber-js ${baseOptions} ${format} tests/features/Comm_Module/DEV_927_Infobip_SMS_channel.feature ${tag ? `--tags "${tag}"` : ''}`;
    break;
    
  case 'all':
  default:
    console.log('🔍 Running All Tests');
    command = `npx cucumber-js ${baseOptions} ${format} tests/features ${tag ? `--tags "${tag}"` : ''}`;
}

console.log(`\n📋 Executing: ${command}\n`);

try {
  // Run the command
  execSync(command, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      TS_NODE_PROJECT: 'tsconfig.json',
      FORCE_COLOR: '1'
    }
  });
  
  console.log('\n✅ Tests completed successfully!');
  console.log(`📊 Report available at: ${path.join(reportsDir, 'report.html')}`);
} catch (error) {
  console.error('\n❌ Test execution failed!');
  
  if (error.status) {
    console.error(`Exit code: ${error.status}`);
  }
  
  console.log(`📊 Report available at: ${path.join(reportsDir, 'report.html')}`);
  process.exit(1);
} 