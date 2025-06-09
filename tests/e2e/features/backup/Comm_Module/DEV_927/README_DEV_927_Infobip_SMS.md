# DEV-927: Infobip SMS Channel Test Suite

## Overview
This test suite validates the implementation of the Infobip SMS channel in the Kredos Communication Module. The tests ensure that the Infobip SMS channel meets all requirements, including customer-specific configurations, detailed logging, and feature parity with the existing Twilio SMS implementation.

## Key Requirements
The test suite covers the following key requirements for the Infobip SMS channel:

1. **Customer-Specific Sender Codes**: The system must support customer-specific sender codes/short codes when sending SMS messages through Infobip.
   - TC02 and TC03 validate this functionality with different customer configurations.

2. **Detailed Logging**: The system must provide detailed logging for Infobip SMS messages, including request and response details.
   - TC04 verifies the logging capabilities with verbose log level.

3. **Feature Parity with Twilio SMS**: The Infobip SMS channel must provide the same functionality as the existing Twilio SMS channel.
   - Multiple test cases (TC01, TC05-TC10) verify various features such as scheduling, validation, error handling, and retry logic.

## Test Cases
The test suite includes the following test cases:

1. **TC01**: Basic SMS message sending through Infobip
   - Verifies that a basic SMS message can be sent successfully through the Infobip channel.

2. **TC02**: Customer-specific sender code
   - Verifies that the system uses the correct sender code for a specific customer (customer1).

3. **TC03**: Different customer-specific sender code
   - Verifies that the system uses a different sender code for another customer (customer2).

4. **TC04**: Detailed logging verification
   - Verifies that the system logs detailed information about the request and response for Infobip SMS.

5. **TC05**: Scheduled SMS message
   - Verifies that SMS messages can be scheduled for future delivery through Infobip.

6. **TC06**: Empty message content handling
   - Verifies that the system properly validates and rejects empty message content.

7. **TC07**: Invalid phone number format handling
   - Verifies that the system validates phone numbers and rejects those not in E.164 format.

8. **TC08**: Rapid message sending (throttling)
   - Verifies that the system can handle multiple SMS requests sent in quick succession.

9. **TC09**: Retry logic for temporary failures
   - Verifies that the system implements proper retry logic for temporary failures.

10. **TC10**: Service unavailable error handling
    - Verifies that the system properly handles service unavailable errors.

## Test Environment
The tests are configured to run against the Kredos Communication Module API. The following environment variables can be used to configure the tests:

- `API_BASE_URL`: The base URL of the Communication Module API (default: http://3.133.216.212/app4/kredos/comm)
- `TEST_PHONE_NUMBER`: A valid phone number to use for testing (default: +17193981666)

## Running the Tests
To run the Infobip SMS channel tests, use the following command:

```bash
npm run test:infobip
```

Or to run specific test cases:

```bash
npm run test -- --tags "@DEV-927 @TC01"
```

## Expected Results
When the tests are run successfully:

1. All basic functionality tests (TC01, TC02, TC03, TC04, TC05) should pass, indicating that the Infobip SMS channel is correctly implemented.
2. Validation tests (TC06, TC07) should verify that the system properly validates input data.
3. Advanced functionality tests (TC08, TC09, TC10) should verify that the system can handle complex scenarios like throttling, retry logic, and error handling.

## Known Issues
- The tests assume that the Infobip API credentials are properly configured in the system.
- The tests do not validate the actual delivery of SMS messages to end users; they only verify the communication with the Infobip API.