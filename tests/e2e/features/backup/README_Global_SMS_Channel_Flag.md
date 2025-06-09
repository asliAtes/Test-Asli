# DEV-929: Global SMS Channel Flag Test Suite

## Overview
This test suite validates the implementation of a global SMS channel flag that controls which SMS provider (Twilio or Infobip) is used for message delivery. The flag provides a simple way to switch all customers from one SMS provider to another without requiring code changes.

## Key Requirements
The global SMS channel flag implementation must satisfy the following requirements:

1. **Global Control**: A single flag (`globalSMSChannel`) should determine which SMS provider is used for all customers except for specific exceptions.

2. **Default Provider**: When the flag is set to "Twilio" or is not set, all messages should route through Twilio.

3. **Provider Switching**: When the flag is set to "Infobip", all messages should route through Infobip SMS.

4. **T-Mobile Exception**: Messages for T-Mobile customers should always route through BNE, regardless of the global flag setting.

5. **Error Handling**: Invalid flag values should be rejected with appropriate error messages.

## Test Cases
The test suite includes the following scenarios:

1. **TC01**: Default flag setting uses Twilio for SMS
   - Verifies that when the flag is set to "Twilio", messages are routed through Twilio.

2. **TC02**: Switching flag to Infobip routes all SMS through Infobip
   - Verifies that when the flag is set to "Infobip", messages are routed through Infobip.

3. **TC03**: BNE channel is used for T-Mobile regardless of global flag (Twilio setting)
   - Verifies that T-Mobile messages always use BNE even when flag is set to "Twilio".

4. **TC04**: BNE channel is used for T-Mobile regardless of global flag (Infobip setting)
   - Verifies that T-Mobile messages always use BNE even when flag is set to "Infobip".

5. **TC05**: Invalid global SMS channel flag value
   - Verifies that invalid flag values are rejected with appropriate error responses.

6. **TC06**: Changing flag impacts USCC messages
   - Verifies that USCC customer messages follow the global flag setting.

7. **TC07**: Changing flag impacts all non-T-Mobile customers
   - Verifies that new customers' messages follow the global flag setting.

8. **TC08**: Missing global SMS channel flag defaults to Twilio
   - Verifies that when the flag is not set, messages default to Twilio.

## Test Results

### Successful Tests
- The core functionality of directing messages to the appropriate carrier based on the global flag works as expected for most scenarios.
- Default functionality (flag set to "Twilio" or not set) correctly routes through Twilio.
- When flag is set to "Infobip", standard customers like USCC are correctly routed through Infobip.
- The special case for T-Mobile customers is identified correctly, attempting to route through BNE regardless of flag setting.

### Known Issues

1. **BNE Integration Failure (TC03, TC04)**:
   - The BNE integration is currently failing with 500 Internal Server errors.
   - The correct routing decision is made (T-Mobile customers are directed to BNE), but the BNE service itself is returning errors.
   - **Action Item**: Fix the BNE integration to properly handle T-Mobile customer messages.

2. **Missing Flag Validation (TC05)**:
   - Invalid flag values (e.g., "Invalid") are accepted without validation.
   - The system should return a 400 Bad Request with an appropriate error message.
   - Currently, it processes the request with the default carrier (Twilio).
   - **Action Item**: Implement validation for the `globalSMSChannel` flag to reject invalid values.

3. **New Customer Error (TC07)**:
   - Messages for new customers are failing with 500 errors when the Infobip flag is set.
   - **Action Item**: Investigate and fix the error handling for new/unknown customers.

4. **Response Enhancement**:
   - The response doesn't explicitly include the carrier information, making validation more difficult.
   - **Action Item**: Enhance the API to include the carrier used in the response for easier validation and troubleshooting.

## Test Environment
The tests are configured to run against the Kredos Communication Module API. The following environment variables should be set:

- `BASE_URL`: The base URL of the Communication Module API (default: http://3.133.216.212/app4/kredos/comm/messaging)
- `TEST_PHONE_NUMBER`: A valid phone number to use for testing (default: +17193981666)
- `TIMEOUT`: Optional timeout configuration (defaults to 10000ms)

## Running the Tests
To run the Global SMS Channel Flag tests, use the following command:

```bash
npm run test:sms-flag
```

Or to run specific test cases:

```bash
npx cucumber-js --require-module ts-node/register --tags "@DEV-929 @TC01" tests/features/Comm_Module/DEV_929_Global_SMS_Channel_Flag.feature
```

## Implementation Details
The `globalSMSChannel` flag should be included in the request payload as a top-level parameter. For example:

```json
{
  "globalSMSChannel": "Infobip",
  "schedule": false,
  "smsRequestList": [
    {
      "toNumber": "+1234567890",
      "message": "Test message",
      "treatmentUserId": "12345",
      "clientName": "USCC",
      "acctNum": "67890"
    }
  ]
}
```

The valid values for the flag are:
- "Twilio" (default if not set)
- "Infobip"

## Notes
- This feature is important for migrating customers from Twilio to Infobip without requiring code changes.
- The special case for T-Mobile ensures compatibility with existing integrations.
- The API needs to implement proper validation for the flag values.
- The BNE integration needs to be fixed to ensure T-Mobile customers receive messages properly. 