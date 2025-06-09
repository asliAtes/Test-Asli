# RCS Failover Message Test Suite

This test suite validates the RCS failover functionality where an RCS message automatically falls back to SMS delivery when RCS delivery fails or is not available.

## Overview

Infobip RCS APIs support automatic failover to SMS when:
- The recipient device does not support RCS
- RCS delivery fails for any reason
- The RCS service is temporarily unavailable

This test suite verifies that the Communication Module properly implements this failover mechanism, ensuring that messages are delivered regardless of RCS availability.

## Test Cases

### Basic Functionality
1. **TC01** - Send RCS message to RCS-capable device
2. **TC02** - RCS message to non-RCS device should failover to SMS
3. **TC06** - Multiple recipients with mixed device capabilities

### RCS Content Handling
4. **TC03** - RCS message with long content
5. **TC04** - RCS message with special characters
6. **TC10** - RCS message with HTML content
7. **TC14** - Extreme character limit for RCS (2500+ characters)

### Scheduling
8. **TC05** - RCS scheduled message

### Validation & Error Handling
9. **TC07** - Empty message content for RCS
10. **TC08** - Invalid phone number format for RCS
11. **TC09** - Missing required field in RCS request
12. **TC13** - Malformed RCS payload (JSON syntax error)

### Edge Cases & Reliability
13. **TC11** - Network timeout handling for RCS
14. **TC12** - Large batch of RCS messages (10 recipients using controlled test phone numbers)
15. **TC15** - RCS with rapid sequential messages (rate limiting/throttling)

## Testing Limitations

Since the actual delivery channel (RCS vs SMS failover) can only be confirmed through the Infobip dashboard or logs, these tests primarily verify:

1. Messages are accepted by the Communication Module
2. The module correctly processes RCS message requests
3. Basic validation occurs for invalid requests
4. Appropriate error handling for edge cases
5. Resilience to failure scenarios

To fully verify the failover functionality, manual checks in the Infobip dashboard are required after test execution to confirm which messages were delivered via RCS and which failover to SMS.

## Test Environment Configuration

The test suite uses the following environment variables:

- `TEST_PHONE_NUMBER`: Default test phone number for general tests
- `RCS_CAPABLE_PHONE`: Phone number known to support RCS
- `NON_RCS_PHONE`: Phone number known to not support RCS
- `BASE_URL`: API endpoint for the Communication Module

If these environment variables are not set, the tests use default values defined in the code.

**IMPORTANT**: All test cases only use controlled phone numbers specified in the environment variables. No random phone numbers are generated for testing to prevent accidental messaging to real users.

## Running Tests

To run the RCS failover test suite:

```bash
npx ts-node -r tsconfig-paths/register ./node_modules/.bin/cucumber-js tests/features/Comm_Module/DEV_931_RCS_Failover_message.feature --require tests/steps/Comm_Module/**/*.ts
```

To run specific tests by line numbers:

```bash
npx ts-node -r tsconfig-paths/register ./node_modules/.bin/cucumber-js tests/features/Comm_Module/DEV_931_RCS_Failover_message.feature:4-6 --require tests/steps/Comm_Module/**/*.ts
```

## Post-Test Verification

After running the tests, check the Infobip dashboard to verify:

1. Messages to RCS-capable phones were delivered via RCS
2. Messages to non-RCS phones correctly failed over to SMS
3. Mixed recipient test cases show the appropriate delivery channel for each number
4. Error scenarios were handled gracefully
5. Batch and sequential messaging performed as expected

## Edge Case Testing Considerations

The edge case tests (TC11-TC15) are designed to verify system resilience and error handling:

1. **Network timeout** - Tests whether short timeouts are handled properly
2. **Large batches** - Verifies the system can handle bulk messaging using controlled test phone numbers
3. **Malformed payload** - Ensures the API returns proper validation for syntax errors
4. **Extreme message length** - Tests boundary conditions of message size
5. **Rapid sequential messages** - Validates throttling and rate limit handling

Some of these tests may produce expected failures under certain conditions. The test assertions are designed to accommodate these scenarios while still providing useful feedback. 