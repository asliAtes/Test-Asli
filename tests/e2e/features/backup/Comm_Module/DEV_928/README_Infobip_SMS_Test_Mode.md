# Infobip SMS Test Mode Test Suite

## Overview
This test suite verifies the implementation of a Test Mode for the Infobip SMS channel (DEV-928). The Test Mode allows system operators and developers to test the messaging functionality without sending messages to real customers or production phone numbers, reducing costs and preventing accidental message delivery during testing and development.

## Key Requirements
The Infobip SMS Test Mode implementation aims to satisfy the following requirements:

1. **Test Mode Activation**: Enable test mode via API parameter
2. **Message Limiting**: Configure how many messages get sent to test phones, with a default limit of 5
3. **Test Phone Configuration**: Allow specification of test phone numbers or fallback to defaults
4. **Preservation of Metadata**: Maintain original recipient information and tracking data in logs
5. **Cross-Channel Support**: Support test mode for both Infobip SMS and RCS channels
6. **Test Mode Response**: Return detailed information about test mode operation
7. **MAB Integration**: Support test mode when processing MAB data

## Test Cases
The test suite includes the following scenarios:

1. **TC01 - Enable Test Mode via API Parameter**: Verifies basic test mode activation
2. **TC02 - Test Mode Message Limiting (Default 5)**: Confirms the default limit of 5 messages
3. **TC03 - Custom Message Limit Setting**: Tests custom message limits
4. **TC04 - Small Batch Handling**: Verifies handling when batch size is less than limit
5. **TC05 - Default Test Phone Usage**: Tests fallback to default test phone numbers
6. **TC06 - Custom Test Phone Configuration**: Verifies custom test phone configuration
7. **TC07 - Test Phone Number Validation**: Tests validation of test phone numbers
8. **TC08 - Infobip SMS Carrier in Test Mode**: Verifies test mode with Infobip SMS
9. **TC09 - Infobip RCS Carrier in Test Mode**: Verifies test mode with Infobip RCS
10. **TC10 - Scheduled Message in Test Mode**: Tests scheduling functionality in test mode
11. **TC11 - Test Mode Response Format**: Verifies correct response format with statistics
12. **TC12 - Failed Message Handling**: Tests error handling in test mode
13. **TC13 - Test Mode with Empty Batch**: Verifies handling of empty message batches
14. **TC14 - Invalid Test Mode Configuration**: Tests validation of test mode parameters
15. **TC15 - MAB Scoring Integration**: Verifies test mode functionality with MAB scoring
16. **TC16 - Multi-Channel Test Mode**: Tests consistency across multiple channels
17. **TC17 - Test Mode Audit Trail**: Verifies proper audit logging of test mode usage

## Test Mode Implementation Details
The test mode implementation includes the following key components:

1. **Test Mode Flag**: A boolean parameter (`testMode: true`) that activates test mode
2. **Message Limit**: An optional parameter (`testModeLimit: number`) that specifies how many messages to process
3. **Test Phone Numbers**: An optional array of E.164 formatted phone numbers to use as test recipients
4. **Response Enhancement**: Additional details in the response about test mode operation, including:
   - Number of messages processed vs. skipped
   - Original recipient information (preserved for logging)
   - Test phone numbers used

## Testing Limitations
- Tests use controlled test phone numbers from environment variables
- Some scenarios may require manual verification of logs
- Test mode behavior may differ slightly between carriers

## Test Environment Configuration
To run these tests, the following environment variables should be set:
- `TEST_PHONE_NUMBER`: A valid test phone number in E.164 format (e.g., +1234567890)
- Additional test phone numbers can be configured in the test data setup

## Running the Tests
Execute the test suite with the following command:
```
npm run test:comm:infobip:test-mode
```

Or run specific tests with tags:
```
npm run test -- --tags "@infobip-test-mode"
```

## Expected Results
When the test mode is functioning correctly:
1. Messages are only sent to the configured test phone numbers
2. The number of messages processed is limited by the testModeLimit parameter
3. Original recipient information is preserved in logs
4. Detailed statistics about the test mode operation are returned in the response

## Known Issues
- None currently identified 