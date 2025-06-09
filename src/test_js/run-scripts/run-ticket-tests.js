#!/usr/bin/env node

/**
 * Script to run automated tests grouped by ticket number
 * Usage: 
 *   node run-ticket-tests.js DEV-1045  (Run all tests for DEV-1045)
 *   node run-ticket-tests.js DEV-1045-TC1  (Run specific test case)
 *   node run-ticket-tests.js --ui  (Run all UI tests)
 *   node run-ticket-tests.js --api  (Run all API tests)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Please provide a ticket number or test tag.');
  console.log('Usage: node run-ticket-tests.js DEV-1045');
  console.log('       node run-ticket-tests.js DEV-1045-TC1');
  console.log('       node run-ticket-tests.js --ui');
  console.log('       node run-ticket-tests.js --api');
  process.exit(1);
}

// Define available tickets and their descriptions
const availableTickets = {
  'DEV-1045': 'RCS Tab Integration',
  'DEV-1046': 'Performance Reports Dashboard'
};

// Process tag from arguments
let tag = args[0];

// Handle special tag formats
if (tag.startsWith('--')) {
  // Handle type tags (--ui, --api, etc.)
  tag = tag.substring(2); // Remove -- prefix
} else if (!tag.startsWith('@')) {
  // Add @ prefix if not present (for cucumber tags)
  tag = '@' + tag;
}

console.log(`\n=== Running Kredos AI Tests ===\n`);

// Display information about the test run
if (Object.keys(availableTickets).some(ticket => tag.includes(ticket))) {
  const ticketNumber = Object.keys(availableTickets).find(ticket => tag.includes(ticket));
  console.log(`Running tests for ticket: ${ticketNumber}`);
  console.log(`Description: ${availableTickets[ticketNumber]}`);
} else {
  console.log(`Running tests with tag: ${tag}`);
}

// Build the cucumber command
const cucumberBin = path.join(__dirname, 'node_modules', '.bin', 'cucumber-js');
const args2 = [
  '--tags', tag,
  '--format', 'json:reports/cucumber_report.json',
  '--format', 'html:reports/cucumber_report.html',
  '--format', 'summary'
];

// Create reports directory if it doesn't exist
if (!fs.existsSync('reports')) {
  fs.mkdirSync('reports');
}

console.log(`\nCommand: ${cucumberBin} ${args2.join(' ')}\n`);

// Execute the cucumber tests
const cucumber = spawn(cucumberBin, args2, { stdio: 'inherit' });

cucumber.on('exit', code => {
  if (code === 0) {
    console.log('\n✅ All tests passed successfully!');
  } else {
    console.log('\n❌ Tests failed or encountered errors.');
  }
  
  console.log('\nTest reports generated at:');
  console.log(`- JSON Report: ${path.join(__dirname, 'reports', 'cucumber_report.json')}`);
  console.log(`- HTML Report: ${path.join(__dirname, 'reports', 'cucumber_report.html')}`);
  
  process.exit(code);
}); 

/**
 * Script to run automated tests grouped by ticket number
 * Usage: 
 *   node run-ticket-tests.js DEV-1045  (Run all tests for DEV-1045)
 *   node run-ticket-tests.js DEV-1045-TC1  (Run specific test case)
 *   node run-ticket-tests.js --ui  (Run all UI tests)
 *   node run-ticket-tests.js --api  (Run all API tests)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Please provide a ticket number or test tag.');
  console.log('Usage: node run-ticket-tests.js DEV-1045');
  console.log('       node run-ticket-tests.js DEV-1045-TC1');
  console.log('       node run-ticket-tests.js --ui');
  console.log('       node run-ticket-tests.js --api');
  process.exit(1);
}

// Define available tickets and their descriptions
const availableTickets = {
  'DEV-1045': 'RCS Tab Integration',
  'DEV-1046': 'Performance Reports Dashboard'
};

// Process tag from arguments
let tag = args[0];

// Handle special tag formats
if (tag.startsWith('--')) {
  // Handle type tags (--ui, --api, etc.)
  tag = tag.substring(2); // Remove -- prefix
} else if (!tag.startsWith('@')) {
  // Add @ prefix if not present (for cucumber tags)
  tag = '@' + tag;
}

console.log(`\n=== Running Kredos AI Tests ===\n`);

// Display information about the test run
if (Object.keys(availableTickets).some(ticket => tag.includes(ticket))) {
  const ticketNumber = Object.keys(availableTickets).find(ticket => tag.includes(ticket));
  console.log(`Running tests for ticket: ${ticketNumber}`);
  console.log(`Description: ${availableTickets[ticketNumber]}`);
} else {
  console.log(`Running tests with tag: ${tag}`);
}

// Build the cucumber command
const cucumberBin = path.join(__dirname, 'node_modules', '.bin', 'cucumber-js');
const args2 = [
  '--tags', tag,
  '--format', 'json:reports/cucumber_report.json',
  '--format', 'html:reports/cucumber_report.html',
  '--format', 'summary'
];

// Create reports directory if it doesn't exist
if (!fs.existsSync('reports')) {
  fs.mkdirSync('reports');
}

console.log(`\nCommand: ${cucumberBin} ${args2.join(' ')}\n`);

// Execute the cucumber tests
const cucumber = spawn(cucumberBin, args2, { stdio: 'inherit' });

cucumber.on('exit', code => {
  if (code === 0) {
    console.log('\n✅ All tests passed successfully!');
  } else {
    console.log('\n❌ Tests failed or encountered errors.');
  }
  
  console.log('\nTest reports generated at:');
  console.log(`- JSON Report: ${path.join(__dirname, 'reports', 'cucumber_report.json')}`);
  console.log(`- HTML Report: ${path.join(__dirname, 'reports', 'cucumber_report.html')}`);
  
  process.exit(code);
}); 