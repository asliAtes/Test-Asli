# Communication Module Test Suite

This test suite validates the functionality of the Communication Module for SMS message routing through multiple carriers.

## Overview

The communication module is designed to route SMS messages through various carriers:
- Twilio
- Infobip
- BNE (Business Network Exchange)

The tests verify proper message routing, validation, error handling, and support for different message content.

## Test Cases

### Basic Functionality
1. **TC01** - Send SMS using Twilio
2. **TC02** - Send SMS using Infobip
3. **TC03** - Send SMS using BNE (Currently failing)
4. **TC10** - Specific carrier override (globalSMSChannel parameter)

### Validation
5. **TC04** - Empty message body
6. **TC05** - Unsupported carrier type
7. **TC06** - Missing carrier field
8. **TC07** - Missing phone number
9. **TC08** - Invalid phone number format
10. **TC09** - Malformed JSON

### Edge Cases
11. **TC11** - Large message content (>1600 characters)
12. **TC12** - Special characters and non-Latin scripts
13. **TC13** - Multiple recipients in single request
14. **TC14** - Mixed valid and invalid requests
15. **TC15** - Scheduled message with future timestamp
16. **TC16** - Security testing with injection attempt
17. **TC17** - HTML content in message
18. **TC18** - URL content in message

## Known Issues/Bugs

### 1. BNE Integration Failing with 500 Error
- BNE integration consistently returns 500 error
- Issue persists regardless of date format used for `deliveryExpiryTime` field
- Multiple date formats were tested:
  - Fixed dates (e.g., "2023-04-30T22:00:00Z")
  - Dynamic future dates (24 hours from now)
  - ISO 8601 format with timezone 
- Assessment: Likely an internal issue with the BNE integration implementation itself, not related to the request format

### 2. Malformed JSON Returns 500 Instead of 400
- API returns 500 error with stack trace details when receiving invalid JSON
- Response exposes internal implementation details (e.g., `com.vassarlabs.communication.pojo.SmsRequestPayload`)
- Security concern: Internal class names and stack traces are exposed to the client
- Recommendation: Implement proper JSON validation at the API gateway level and return a clean 400 Bad Request error

### 3. Large Message Content Handling
- Messages exceeding SMS length limits (1600+ characters) cause 500 errors
- Best practice would be to return a 400 Bad Request with clear validation message about message length limits
- The API should validate message length before attempting to send

### 4. Scheduling Parameters
- The API requires specific parameter names for scheduled messages:
  - `scheduleAt` (not `scheduledTime`)
  - `zoneId` (timezone information)
- The error messages returned are clear, but API documentation should be updated to reflect these requirements

## Test Environment

- Base URL: http://3.133.216.212/app4/kredos/comm/messaging
- Testing phone number: Configured in environment variables
- Tests run using Cucumber.js with TypeScript

## Running Tests

To run the full test suite:
```bash
npx ts-node -r tsconfig-paths/register ./node_modules/.bin/cucumber-js tests/features/Comm_Module/DEV_926_Comm_module_as_a_separate_service.feature --require tests/steps/Comm_Module/**/*.ts
```

To run specific tests by line numbers (e.g., just TC01-TC03):
```bash
npx ts-node -r tsconfig-paths/register ./node_modules/.bin/cucumber-js tests/features/Comm_Module/DEV_926_Comm_module_as_a_separate_service.feature:4-16 --require tests/steps/Comm_Module/**/*.ts
``` 