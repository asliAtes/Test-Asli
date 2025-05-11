# DEV-932: Customer Level RCS Flag Test Suite

## Overview
This test suite validates the implementation of a customer-level flag (`tryRCS`) that controls whether customers use RCS messaging or exclusively SMS. This allows for selective RCS adoption while maintaining SMS as a reliable fallback option.

## Key Requirements
The Customer Level RCS Flag implementation must satisfy the following requirements:

1. **Customer-Level Control**: A boolean flag (`tryRCS`) determines whether RCS should be attempted for a specific customer.

2. **RCS Prioritization**: When `tryRCS` is set to `true`, the system should attempt to deliver messages via RCS first (for supported devices).

3. **SMS Fallback**: If RCS delivery fails or the recipient device doesn't support RCS, the system should automatically fall back to SMS.

4. **SMS-Only Mode**: When `tryRCS` is set to `false`, the system should bypass RCS entirely and use the appropriate SMS channel.

5. **T-Mobile Exception**: Messages for T-Mobile customers should always route through BNE, regardless of the `tryRCS` setting.

6. **Global SMS Channel Integration**: When using SMS (either by customer preference or fallback), the channel used should follow the global SMS channel flag setting.

## Test Cases
The test suite includes the following scenarios:

1. **TC01**: Customer with tryRCS=true sends message via RCS
   - Verifies that when tryRCS is true, messages to RCS-capable devices are sent through RCS.

2. **TC02**: Customer with tryRCS=true sending to non-RCS device fails over to SMS
   - Verifies that when tryRCS is true but the device doesn't support RCS, the message falls back to SMS.

3. **TC03/TC04**: Customer with tryRCS=false always uses SMS
   - Verifies that when tryRCS is false, messages are sent via SMS using either Twilio or Infobip (depending on the global SMS channel flag).

4. **TC05/TC06**: T-Mobile customer always uses BNE
   - Verifies that T-Mobile customers always use BNE regardless of the tryRCS setting.

5. **TC07**: Invalid tryRCS flag value
   - Verifies that non-boolean tryRCS values are rejected with appropriate error responses.

6. **TC08**: Failover behavior on RCS failure
   - Verifies that when RCS delivery fails for a customer with tryRCS=true, the message properly falls back to SMS.

7. **TC09**: Mixed batch handling
   - Verifies that batches with both RCS-capable and non-RCS-capable devices are handled appropriately.

8. **TC10**: Integration with global SMS channel flag
   - Verifies that when tryRCS is false, the global SMS channel flag determines which SMS provider is used.

## Expected Behavior

1. **RCS-Capable Path**:
   - Customer has tryRCS=true
   - Message sent to RCS-capable device
   - Message delivered via RCS

2. **Fallback Path**:
   - Customer has tryRCS=true
   - Message sent to non-RCS device or RCS delivery fails
   - Message automatically falls back to SMS via the appropriate channel

3. **SMS-Only Path**:
   - Customer has tryRCS=false
   - Message sent directly via SMS, bypassing RCS
   - SMS channel determined by globalSMSChannel flag

4. **T-Mobile Path**:
   - T-Mobile customer (any tryRCS setting)
   - Message sent via BNE

## Test Environment
The tests are configured to run against the Kredos Communication Module API. The following environment variables should be set:

- `BASE_URL`: The base URL of the Communication Module API (default: http://3.133.216.212/app4/kredos/comm/messaging)
- `TEST_PHONE_NUMBER`: A valid phone number to use for testing (default: +17193981666)
- `RCS_CAPABLE_NUMBER`: A phone number known to support RCS (optional)
- `NON_RCS_CAPABLE_NUMBER`: A phone number known to not support RCS (optional)
- `TIMEOUT`: Optional timeout configuration (defaults to 10000ms)

## Running the Tests
To run the Customer Level RCS Flag tests, use the following command:

```bash
npm run test:customer
```

Or to run specific test cases:

```bash
npx cucumber-js --require-module ts-node/register --tags "@DEV-932 @TC01" tests/features/Comm_Module/DEV_932/DEV_932_Customer_level_RCS_flag.feature
```

## Implementation Details
The `tryRCS` flag should be included in the request payload or determined by customer configuration. The API should check:

1. If client is T-Mobile, use BNE
2. If tryRCS=false, use SMS via the appropriate channel (Twilio or Infobip based on globalSMSChannel)
3. If tryRCS=true, try RCS delivery first, with automatic fallback to SMS if needed

## Notes
- This feature is important for selective RCS adoption without forcing all customers to use it immediately.
- The integration with the global SMS channel flag ensures consistency in SMS delivery.
- The special case for T-Mobile ensures compatibility with existing integrations.
- The automatic failover from RCS to SMS provides reliability while allowing for new technology adoption. 