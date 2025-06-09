# Email Module Test Suite Documentation

## Overview
This test suite validates the email functionality of the Communication Module, specifically focusing on SendGrid integration for email delivery. The tests cover basic email sending functionality and various validation scenarios.

## Test Structure
- **Feature File**: `DEV_926_Email_module.feature`
- **Step Definitions**: `tests/steps/Email_Module/DEV_926_Email_module.ts`
- **Test Runner**: `run-email-tests.js`

## Test Scenarios

### TC01 - Send an email using SendGrid
- **Tags**: `@basic @sendgrid`
- **Purpose**: Validates successful email sending through SendGrid
- **Expected Outcome**: Email is processed successfully with status code 200
- **Required Fields**:
  - to: Recipient email address
  - subject: Email subject
  - treatmentUserId: Unique identifier
  - clientName: Client identifier (e.g., "USCC")
  - templateId: SendGrid template ID
  - body: Email content
  - Other metadata fields (firstName, lastName, etc.)

### TC02 - Missing required email fields
- **Tags**: `@validation @error`
- **Purpose**: Validates error handling when required fields are missing
- **Expected Outcome**: 400 Bad Request with appropriate validation messages
- **Test Conditions**: Omits mandatory fields like recipient email, client name, etc.

### TC03 - Invalid email format
- **Tags**: `@validation @error`
- **Purpose**: Validates email format validation
- **Expected Outcome**: 400 Bad Request with "Invalid email format" message
- **Test Conditions**: Uses an invalid email format in the 'to' field

## Running the Tests

### Prerequisites
- Node.js and npm installed
- Required environment variables set in `.env`:
  - BASE_URL: API endpoint URL
  - TIMEOUT: Request timeout in milliseconds (default: 10000)

### Commands
```bash
# Run all email module tests
node run-email-tests.js

# Run specific scenarios using tags
npx cucumber-js --tags "@email and @sendgrid" tests/features/Email_Module/DEV_926_Email_module.feature
```

## Test Data Structure
```typescript
interface EmailRequest {
  mode: "SINGLE";
  carrier: "SENDGRID";
  singleRequest: {
    to: string;
    subject: string;
    treatmentUserId: string;
    clientName: string;
    templateId: string;
    firstName?: string;
    lastName?: string;
    pastDue?: string;
    body: string;
    // ... other optional fields
  };
}
```

## Response Format
```typescript
interface EmailResponse {
  result: boolean;
  statusCode: number;
  statusCodeDescription: string;
  message?: string;
  response?: {
    communicationStatus: string | null;
    commId: string | null;
    treatmentUserId: string | null;
    eventTime: number;
    bulkId: string | null;
    acctNum: string | null;
    segmentCount: number;
  };
}
```

## Error Handling
- Network errors are logged with detailed error information
- Validation errors (400) include specific field validation messages
- Timeout errors occur after the configured timeout period
- All errors are logged with appropriate context for debugging

## Best Practices
1. Always run tests in isolation using the provided test runner
2. Check logs for detailed request/response information
3. Ensure all required environment variables are set
4. Use appropriate tags to run specific test subsets
5. Review error logs for validation failures

## Known Limitations
- Tests require a running instance of the Communication Module
- SendGrid integration must be properly configured
- Some scenarios may require specific environment setup 