#!/usr/bin/env node

// This script is designed to run only the email tests in isolation
// It avoids TypeScript module conflicts by running only the specific feature file and step definition

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a temporary directory for isolated testing
const tempDir = path.join(__dirname, 'temp-email-test');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Create subdirectories
const featuresDir = path.join(tempDir, 'features');
const stepsDir = path.join(tempDir, 'steps');
if (!fs.existsSync(featuresDir)) fs.mkdirSync(featuresDir);
if (!fs.existsSync(stepsDir)) fs.mkdirSync(stepsDir);

// Copy only the email feature file and step definition
const sourceFeature = path.join(__dirname, 'tests/features/Email_Module/DEV_926_Email_module.feature');
const sourceStep = path.join(__dirname, 'tests/steps/Email_Module/DEV_926_Email_module.ts');
const destFeature = path.join(featuresDir, 'email.feature');
const destStep = path.join(stepsDir, 'email-steps.ts');

fs.copyFileSync(sourceFeature, destFeature);
fs.copyFileSync(sourceStep, destStep);

// Create a simple package.json
const packageJson = {
  "name": "email-tests",
  "version": "1.0.0",
  "dependencies": {
    "@cucumber/cucumber": "*",
    "axios": "*",
    "dotenv": "*"
  }
};

fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));

try {
  // Run the email tests in isolation
  console.log('Running email tests in isolation...');
  
  // Change to the temp directory
  process.chdir(tempDir);
  
  const command = `npx cucumber-js features/email.feature --require steps/email-steps.ts`;
  
  console.log(`Running command: ${command}`);
  console.log('Base URL:', process.env.BASE_URL || 'http://3.133.216.212/app4/kredos/comm/messaging');
  
  // Run the command
  execSync(command, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      BASE_URL: process.env.BASE_URL || 'http://3.133.216.212/app4/kredos/comm/messaging',
      TIMEOUT: '10000'
    }
  });
  
  console.log('Email tests completed successfully!');
} catch (error) {
  console.error('Error running email tests:', error.message);
} finally {
  // Clean up
  process.chdir(__dirname);
  // Uncomment to clean up the temp directory:
  // fs.rmSync(tempDir, { recursive: true, force: true });
} 