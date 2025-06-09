# DEV-928 Infobip SMS Test Mode

This directory contains test files for the Infobip SMS Test Mode implementation (DEV-928).

## Overview

The Infobip SMS Test Mode allows processing customer batches through MAB scoring and testing the communication module logic without sending messages to actual customers. This provides a controlled way to validate the Infobip SMS channel before migrating from Twilio.

## Files

- `DEV_928_Infobip_SMS_Test_Mode.feature`: Test scenarios for the Test Mode functionality
- `DEV_928_Infobip_SMS_Test_Mode.ts`: Step definitions implementing the test scenarios
- `README_Infobip_Test_Mode.md`: Detailed documentation on Test Mode usage and API

## Key Test Cases

1. **Message Limiting**: Verify only the first N messages (default: 5) are actually sent
2. **Test Phone Redirection**: Test messages are redirected to designated test phones
3. **Log-Only Mode**: Remaining messages beyond the limit are logged but not sent
4. **Carrier Consistency**: Test mode works with different carriers (SMS, RCS)
5. **Parameter Validation**: Proper validation of test mode parameters

## Running the Tests

To run the Infobip SMS Test Mode tests:

```bash
npx cucumber-js tests/features/Comm_Module/DEV_928/DEV_928_Infobip_SMS_Test_Mode.feature
```

## API Parameters

The Test Mode is activated by adding the following parameters to the API request:

```json
{
  "testMode": true,
  "testPhoneNumbers": ["+17193981666", "+12244195222"],
  "maxTestMessages": 5
}
```

For more details, see the README_Infobip_Test_Mode.md file. 