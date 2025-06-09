#!/usr/bin/env node

/**
 * Script to run all automated tests for DEV-958 and its sub-tasks
 * 
 * This script will execute all tests related to DEV-958, including:
 * - DEV-1003: Create RCS tab under "SMS/Email Reports"
 * - DEV-1004: Add RCS data to graphs under Message Reports > Status
 * - DEV-1005: Add RCS data to tables under Message Reports > Trends
 * - DEV-1006: Add 3 new metrics to Performance Reports > Summary Rates
 * - DEV-1007: Add 6 new counts to Performance Reports > Counts
 * - DEV-1044: Backend-change: Add RCS data to graphs under Message Reports > Status
 * - DEV-1045: Backend-change: Create RCS tab under "SMS/Email Reports"
 * - DEV-986: Verify performance reports calculation and logic
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Define the DEV-958 sub-tasks
const DEV958_TICKETS = [
  'DEV-1003',
  'DEV-1004',
  'DEV-1005',
  'DEV-1006',
  'DEV-1007',
  'DEV-1044',
  'DEV-1045',
  'DEV-986'
];

// Check if specific tickets are requested
const args = process.argv.slice(2);
const tickets = args.length > 0 ? args : DEV958_TICKETS;

console.log('\n=== Running DEV-958 Tests ===\n');
console.log('The following tickets will be tested:');
tickets.forEach(ticket => console.log(`- ${ticket}`));
console.log('');

// Create reports directory if it doesn't exist
if (!fs.existsSync('reports')) {
  fs.mkdirSync('reports');
}

// Create timestamp for report files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Run tests for each ticket
async function runTests() {
  const results = {};
  let allPassed = true;

  for (const ticket of tickets) {
    console.log(`\n=== Running tests for ${ticket} ===\n`);
    
    // Build the cucumber command
    const cucumberBin = path.join(__dirname, 'node_modules', '.bin', 'cucumber-js');
    const ticketTag = `@${ticket}`;
    const jsonReport = `reports/${ticket}_report_${timestamp}.json`;
    const htmlReport = `reports/${ticket}_report_${timestamp}.html`;
    
    const args = [
      '--tags', ticketTag,
      '--format', `json:${jsonReport}`,
      '--format', `html:${htmlReport}`,
      '--format', 'summary'
    ];
    
    console.log(`Command: ${cucumberBin} ${args.join(' ')}\n`);
    
    // Run the cucumber tests
    try {
      const exitCode = await new Promise((resolve) => {
        const cucumber = spawn(cucumberBin, args, { stdio: 'inherit' });
        cucumber.on('exit', (code) => resolve(code));
      });
      
      results[ticket] = exitCode === 0 ? 'PASSED' : 'FAILED';
      if (exitCode !== 0) allPassed = false;
      
    } catch (error) {
      console.error(`Error running tests for ${ticket}:`, error);
      results[ticket] = 'ERROR';
      allPassed = false;
    }
  }
  
  // Print summary
  console.log('\n=== DEV-958 Test Results Summary ===\n');
  Object.entries(results).forEach(([ticket, status]) => {
    const statusSymbol = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⚠️';
    console.log(`${statusSymbol} ${ticket}: ${status}`);
  });
  
  // Combine all reports into a master report
  console.log('\nTest reports have been generated in the reports directory.');
  console.log(`Master HTML report: reports/DEV958_master_report_${timestamp}.html`);
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Start the test run
runTests(); 

/**
 * Script to run all automated tests for DEV-958 and its sub-tasks
 * 
 * This script will execute all tests related to DEV-958, including:
 * - DEV-1003: Create RCS tab under "SMS/Email Reports"
 * - DEV-1004: Add RCS data to graphs under Message Reports > Status
 * - DEV-1005: Add RCS data to tables under Message Reports > Trends
 * - DEV-1006: Add 3 new metrics to Performance Reports > Summary Rates
 * - DEV-1007: Add 6 new counts to Performance Reports > Counts
 * - DEV-1044: Backend-change: Add RCS data to graphs under Message Reports > Status
 * - DEV-1045: Backend-change: Create RCS tab under "SMS/Email Reports"
 * - DEV-986: Verify performance reports calculation and logic
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Define the DEV-958 sub-tasks
const DEV958_TICKETS = [
  'DEV-1003',
  'DEV-1004',
  'DEV-1005',
  'DEV-1006',
  'DEV-1007',
  'DEV-1044',
  'DEV-1045',
  'DEV-986'
];

// Check if specific tickets are requested
const args = process.argv.slice(2);
const tickets = args.length > 0 ? args : DEV958_TICKETS;

console.log('\n=== Running DEV-958 Tests ===\n');
console.log('The following tickets will be tested:');
tickets.forEach(ticket => console.log(`- ${ticket}`));
console.log('');

// Create reports directory if it doesn't exist
if (!fs.existsSync('reports')) {
  fs.mkdirSync('reports');
}

// Create timestamp for report files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Run tests for each ticket
async function runTests() {
  const results = {};
  let allPassed = true;

  for (const ticket of tickets) {
    console.log(`\n=== Running tests for ${ticket} ===\n`);
    
    // Build the cucumber command
    const cucumberBin = path.join(__dirname, 'node_modules', '.bin', 'cucumber-js');
    const ticketTag = `@${ticket}`;
    const jsonReport = `reports/${ticket}_report_${timestamp}.json`;
    const htmlReport = `reports/${ticket}_report_${timestamp}.html`;
    
    const args = [
      '--tags', ticketTag,
      '--format', `json:${jsonReport}`,
      '--format', `html:${htmlReport}`,
      '--format', 'summary'
    ];
    
    console.log(`Command: ${cucumberBin} ${args.join(' ')}\n`);
    
    // Run the cucumber tests
    try {
      const exitCode = await new Promise((resolve) => {
        const cucumber = spawn(cucumberBin, args, { stdio: 'inherit' });
        cucumber.on('exit', (code) => resolve(code));
      });
      
      results[ticket] = exitCode === 0 ? 'PASSED' : 'FAILED';
      if (exitCode !== 0) allPassed = false;
      
    } catch (error) {
      console.error(`Error running tests for ${ticket}:`, error);
      results[ticket] = 'ERROR';
      allPassed = false;
    }
  }
  
  // Print summary
  console.log('\n=== DEV-958 Test Results Summary ===\n');
  Object.entries(results).forEach(([ticket, status]) => {
    const statusSymbol = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⚠️';
    console.log(`${statusSymbol} ${ticket}: ${status}`);
  });
  
  // Combine all reports into a master report
  console.log('\nTest reports have been generated in the reports directory.');
  console.log(`Master HTML report: reports/DEV958_master_report_${timestamp}.html`);
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Start the test run
runTests(); 