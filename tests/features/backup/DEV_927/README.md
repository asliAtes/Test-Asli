# DEV-927 Infobip SMS Channel

This directory contains test files for the Infobip SMS channel implementation (DEV-927).

## Overview

The Infobip SMS channel provides an alternative to Twilio for sending SMS messages through the communication module. These tests verify the functionality of the Infobip SMS integration, including customer-specific configurations, detailed logging, and feature parity with Twilio SMS.

## Files

- `Infobip_SMS_channel.feature`: Test scenarios for the Infobip SMS channel
- `Infobip_SMS_channel.ts`: Step definitions implementing the test scenarios

## Key Test Cases

1. **Basic SMS Functionality**: Verify basic SMS sending through Infobip
2. **Customer-Specific Configuration**: Test sender ID/short code selection based on customer
3. **Detailed Logging**: Verify appropriate logging for outgoing messages
4. **Feature Parity**: Ensure consistent behavior with Twilio for validation, scheduling, etc.

## Running the Tests

To run the Infobip SMS channel tests:

```bash
npx cucumber-js tests/features/Comm_Module/DEV_927/Infobip_SMS_channel.feature
```

## Note

The original test files were deleted, but they covered the following scenarios:
- Basic SMS delivery via Infobip
- Customer-specific sender configurations
- Scheduled message delivery
- Message validation (empty/long content)
- Retry logic for failures
- Message throttling
- Error handling 