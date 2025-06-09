# Infobip SMS Channel Test Mode - DEV-928

This documentation describes the test mode functionality for the Infobip SMS Channel as implemented in DEV-928.

## Overview

The test mode allows processing of customer batches through MAB scoring and testing the communication module logic without sending messages to actual customers. It provides a controlled way to validate the Infobip SMS integration before fully migrating from Twilio.

## Test Mode Functionality

When test mode is activated:

1. Only the first few messages (default: 5) in a batch are actually sent
2. These test messages are redirected to Kredos test phone numbers instead of the original recipients
3. The remaining messages are logged but not sent
4. Full tracking and reporting is maintained for all messages (sent and unsent)

## API Usage

To activate test mode, include the `testMode` parameter in your API request:

```json
{
  "carrier": "INFOBIP_SMS",
  "testMode": true,
  "smsRequestList": [...]
}
```

### Optional Parameters

- `testPhoneNumbers`: Array of phone numbers to use for test messages 
  - If not provided, system defaults will be used
  - Example: `"testPhoneNumbers": ["+17193981666", "+12244195222"]`

- `maxTestMessages`: Maximum number of messages to actually send
  - Default: 5
  - Example: `"maxTestMessages": 3`

## Response Format

When test mode is active, the API response includes test mode statistics:

```json
{
  "result": true,
  "statusCode": 200,
  "statusCodeDescription": "Success",
  "message": "Test mode active: 5 messages sent to test phones, 15 messages suppressed",
  "testModeDetails": {
    "enabled": true,
    "messagesSent": 5,
    "messagesLogged": 15,
    "testPhonesUsed": ["+17193981666", "+12244195222"]
  },
  "response": {...}
}
```

## Testing Considerations

1. **Test Phone Numbers**
   - Use valid test phone numbers that can receive messages
   - Consider testing with both SMS and RCS-capable devices

2. **Message Contents**
   - Test with a variety of message types and content
   - Ensure any customer-specific formatting is preserved

3. **Batch Sizes**
   - Test with batch sizes both smaller and larger than your `maxTestMessages` limit
   - Verify correct behavior with empty batches

4. **Validation**
   - Verify validation works similarly in test mode and production mode
   - Test invalid phone numbers, message content, etc.

## Examples

### Basic Test Mode

```json
{
  "carrier": "INFOBIP_SMS",
  "testMode": true,
  "smsRequestList": [
    {
      "toNumber": "+12064061911",
      "message": "Test message",
      "treatmentUserId": "12345",
      "clientName": "USCC",
      "acctNum": "1235"
    }
  ]
}
```

### Custom Test Configuration

```json
{
  "carrier": "INFOBIP_SMS",
  "testMode": true,
  "testPhoneNumbers": ["+17193981666", "+12244195222"],
  "maxTestMessages": 3,
  "smsRequestList": [
    /* Multiple messages */
  ]
}
```

## Limitations

1. **Actual Message Delivery**
   - The test mode only verifies successful API interaction, not physical receipt by devices
   - Manual verification of message receipt on test phones is recommended

2. **Billing**
   - Messages sent in test mode will still incur charges from the carrier
   - Only test messages (not logged messages) count for billing purposes

3. **MAB Integration**
   - When used with MAB scoring, ensure the MAB output is properly structured

## Running the Tests

To run the test suite for Infobip SMS test mode:

```bash
npx cucumber-js tests/features/Comm_Module/DEV_928_Infobip_SMS_Test_Mode.feature
``` 