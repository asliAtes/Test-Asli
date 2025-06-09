# Email Module Test Suite

This test suite validates the email functionality of the Communication Module, specifically focusing on SendGrid integration for email delivery.

## Overview

The Communication Module's email capabilities allow applications to:
- Send transactional emails through the SendGrid provider
- Use templates with dynamic content
- Handle error validation for malformed requests
- Provide detailed delivery status information

This test suite verifies that the email endpoint properly processes requests, validates input, and handles errors appropriately.

## Test Cases

### Basic Functionality
1. **TC01** - Send email using SendGrid
   - Tests basic email delivery with template support
   - Includes HTML content and dynamic values
   - Verifies successful response structure

### Validation & Error Handling
2. **TC02** - Missing required email fields
   - Tests validation when required fields are missing (e.g., recipient email)
   - Verifies appropriate 400 Bad Request response
   
3. **TC03** - Invalid email format
   - Tests validation of email format standards
   - Confirms meaningful error messages for malformed email addresses

## Testing Limitations

The current implementation has some limitations:
- Only basic validation tests are implemented
- TypeScript module conflicts may require a separate project structure
- Real email delivery confirmation requires manual verification via SendGrid dashboard

## Test Environment Configuration

The test suite uses the following environment variables:

- `BASE_URL`: API endpoint for the Communication Module (automatically converts from messaging to email endpoint)
- `TIMEOUT`: Optional timeout configuration (defaults to 10000ms)

## Request Format

The Email API expects requests in the following format:

```json
{
  "mode": "SINGLE",
  "carrier": "SENDGRID",
  "singleRequest": {
    "to": "test@example.com",
    "subject": "Important Notice Regarding Your Account",
    "treatmentUserId": "12345",
    "clientName": "USCC",
    "templateId": "d-b240674a8e494851a0c5bb8f016cca5f",
    "firstName": "TEST",
    "lastName": "USER",
    "pastDue": "$187.50",
    "quickPayLink": "https://pay.example.com/quickpay",
    "payNumber": "+11234567890",
    "link": "https://www.example.com/account", 
    "paAmount": "$100.00",
    "paPayDate": "2025-04-10",
    "messageTemplateId": "TID_MMLO_20240615",
    "body": "<b>Hello TEST,</b><div><p><br>We're reaching out...</p></div>",
    "timeZone": "America/New_York",
    "callbackUrl": "https://api.example.com/email-status"
  }
}
```

## Running Tests

To run the email test suite:

```bash
npx ts-node -r tsconfig-paths/register ./node_modules/.bin/cucumber-js tests/features/Email_Module/DEV_926_Email_module.feature --require tests/steps/Email_Module/**/*.ts
```

To run specific tests by line numbers:

```bash
npx ts-node -r tsconfig-paths/register ./node_modules/.bin/cucumber-js tests/features/Email_Module/DEV_926_Email_module.feature:4-6 --require tests/steps/Email_Module/**/*.ts
```

## Post-Test Verification

After running the tests, you may need to:

1. Check the SendGrid dashboard to verify email delivery
2. Verify that the test emails were received at the designated test address
3. Confirm that template rendering occurred correctly
4. Check error handling was appropriate for invalid cases

## Implementation Notes

The test implementation uses:
- Different variable names (`emailResponse`, `emailData`) to avoid conflicts with SMS tests
- Custom generation of test IDs
- Specific endpoint URL conversion (from `/messaging` to `/email`)
- Flexible assertion handling for various responses

## Known Issues

1. **TypeScript Module Conflicts**
   - The email tests may experience TypeScript module conflicts with SMS tests
   - Consider creating a separate project structure if these conflicts persist

2. **SendGrid Template Availability**
   - Tests assume the existence of template ID `d-b240674a8e494851a0c5bb8f016cca5f`
   - If different templates are used, update the `templateId` in the test cases

## Future Enhancements

Potential improvements to the email test suite:
1. Add bulk email testing scenarios
2. Test email scheduling functionality
3. Implement webhook testing for delivery status updates
4. Add tests for email attachments
5. Create tests for email reply tracking 