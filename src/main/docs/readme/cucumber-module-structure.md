# Modular Test Structure for Cucumber Framework

To fix the TypeScript module conflicts and maintain a proper Cucumber structure, here's a comprehensive guide:

## 1. Restructure the Project

First, restructure your test files to prevent namespace collisions:

```
tests/
├── features/                   # Feature files (unchanged)
│   ├── Comm_Module/
│   ├── Email_Module/
│   └── ...
├── support/                    # Shared support files
│   ├── env.ts                  # Environment setup
│   ├── types.ts                # Common type definitions 
│   └── utils.ts                # Shared helper functions
└── steps/                      # Step definitions with namespaces
    ├── comm-module/            # Each module in its own directory
    │   ├── rcs-steps.ts
    │   └── sms-steps.ts
    ├── email-module/
    │   └── email-steps.ts
    └── ...
```

## 2. Create a Shared Environment Setup

Create a `support/env.ts` file to share environment configuration:

```typescript
// tests/support/env.ts
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
```

## 3. Use Namespaces for Step Definitions

For each step file, use TypeScript namespaces to isolate variable scope:

```typescript
// Example: tests/steps/email-module/email-steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import assert from 'assert';
import { config, generateTestId } from '../../support/env';

// Use namespace to isolate variable scope
namespace EmailModuleSteps {
  // Module-specific variables
  let emailResponse: any;
  let emailData: any;

  // Step definitions
  export function defineSteps(): void {
    Given('email test data for {string}', function (scenario: string) {
      // Implementation
    });

    When('the email request is submitted to the communication module', async function () {
      // Implementation using emailData and emailResponse
    });

    Then('the email should be processed successfully', function () {
      // Implementation using emailResponse
    });

    Then('the email response should indicate {string}', function (expectedMessage: string) {
      // Implementation using emailResponse
    });
  }
}

// Initialize steps
EmailModuleSteps.defineSteps();
```

## 4. Use Unique Step Names

Make sure step definitions have unique names across modules:

```typescript
// Instead of:
Then('the response should indicate {string}', function(message) {});

// Use module-specific step names:
Then('the email response should indicate {string}', function(message) {});
Then('the SMS response should indicate {string}', function(message) {});
Then('the RCS response should indicate {string}', function(message) {});
```

## 5. Use Cucumber Tags for Test Selection

Add tags to your feature files to run specific test groups:

```gherkin
@email
Feature: Communication Module Email Functionality
  
  @basic
  Scenario: TC01 - Send email using SendGrid
    Given email test data for "TC01"
    When the email request is submitted to the communication module
    Then the email should be processed successfully
```

Then you can run specific test groups:

```bash
npx cucumber-js --tags "@email" # All email tests
npx cucumber-js --tags "@email and @basic" # Just basic email tests
```

## 6. Create a Dedicated Test Runner

Create a test runner script that properly sets up the environment for each module:

```typescript
// test-runner.js
const { execSync } = require('child_process');

const module = process.argv[2] || 'all';
const tag = process.argv[3] || '';

let command = '';
const baseOptions = '--require-module ts-node/register';

switch (module) {
  case 'email':
    command = `npx cucumber-js ${baseOptions} --tags "@email${tag ? ' and ' + tag : ''}" tests/features/Email_Module`;
    break;
  case 'rcs':
    command = `npx cucumber-js ${baseOptions} --tags "@rcs${tag ? ' and ' + tag : ''}" tests/features/Comm_Module/DEV_931_*`;
    break;
  // Add other modules as needed
  case 'all':
  default:
    command = `npx cucumber-js ${baseOptions} ${tag ? '--tags "' + tag + '"' : ''} tests/features`;
}

console.log(`Running command: ${command}`);

try {
  execSync(command, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      TS_NODE_PROJECT: 'tsconfig.json'
    }
  });
} catch (error) {
  console.error('Test execution failed:', error.message);
  process.exit(1);
}
```

Usage:
```bash
node test-runner.js email       # Run all email tests
node test-runner.js rcs @basic  # Run basic RCS tests
node test-runner.js all         # Run all tests
```

## 7. Update the Feature Files

Update your feature files to use the new step definitions:

```gherkin
# Original
Scenario: TC01 - Send email using SendGrid
  Given email test data for "TC01"
  When the email request is submitted to the communication module
  Then the response should indicate "success"

# Updated
Scenario: TC01 - Send email using SendGrid
  Given email test data for "TC01"
  When the email request is submitted to the communication module
  Then the email should be processed successfully
```

## 8. Configuration File for Cucumber

Create a `cucumber.js` configuration file in the project root:

```javascript
// cucumber.js
module.exports = {
  default: {
    paths: ['tests/features/**/*.feature'],
    require: ['tests/steps/**/*.ts', 'tests/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:reports/cucumber-report.html'],
    parallel: 5
  },
  email: {
    paths: ['tests/features/Email_Module/**/*.feature'],
    require: ['tests/steps/email-module/**/*.ts', 'tests/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:reports/email-report.html']
  },
  rcs: {
    paths: ['tests/features/Comm_Module/DEV_931_*.feature'],
    require: ['tests/steps/comm-module/rcs-steps.ts', 'tests/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:reports/rcs-report.html']
  }
}
```

Then you can run tests with:
```bash
npx cucumber-js --profile email
```

## Implementation Steps

1. Create the support directory and env.ts file
2. Refactor each test file to use namespaces and unique step names
3. Update feature files to use module-specific step names
4. Create the test runner script
5. Add tags to feature files
6. Create cucumber.js configuration file

This approach ensures:
1. Variable scope isolation through namespaces
2. Unique step definitions through module-specific naming
3. Flexible test execution through tags and profiles
4. Clean project structure through proper directory organization 