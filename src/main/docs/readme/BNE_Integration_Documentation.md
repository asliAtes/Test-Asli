# BNE Integration and Messaging System Documentation

## Overview
This document summarizes the findings, investigations, and known issues related to the BNE integration and messaging system. It consolidates information from various tests, developer communications, and system behaviors to provide a comprehensive understanding of the current state.

## Table of Contents
1. [BNE Integration](#bne-integration)
2. [Message Length Handling](#message-length-handling)
3. [API Design and Parameters](#api-design-and-parameters)
4. [Known Issues](#known-issues)
5. [Testing Requirements](#testing-requirements)
6. [Implementation Details](#implementation-details)

## BNE Integration

### Purpose
BNE is used as the carrier for T-Mobile customers. The system automatically routes messages for T-Mobile customers through the BNE carrier regardless of other settings.

### Implementation Details
- Each BNE request requires a unique correlation ID for tracking
- The system converts standard SMS request format to BNE format for T-Mobile customers
- BNE requests include specific formatting requirements:
  - Messages in dynamicTag array
  - Address in "tel:" prefix format
  - Language and timezone parameters
  - Delivery expiry time in ISO format

### Current Status
- The implementation for generating unique correlation IDs is working correctly
- HTTP 504 errors from BNE are being retried successfully in the current code
- Logging improvements are needed to better track BNE request lifecycle
- Two specific batches failed during the initial BNE call (before generating a BNE bulk ID)

### Developer Insights
- The team is adding new logs to capture all exceptions during BNE requests
- There may be data-specific issues causing failures in creating BNE requests
- The retry mechanism for 504 errors is working as designed
- The team is working to replicate the failed batch calls to determine the root cause

## Message Length Handling

### Validation Behavior
- Messages exceeding 800 characters are correctly rejected with 400 Bad Request errors
- The error message clearly states: "Message content must not exceed 800 characters"
- This validation happens early in the request lifecycle, before carrier processing

### Message Processing
- Even valid messages (under 800 characters) still fail with 500 Internal Server Error
- All carriers (TWILIO, INFOBIP_SMS, INFOBIP_RCS, BNE) return the same 500 error
- The error message "Failed to send/process SMS" indicates issues during processing, not validation

### Bug Report Clarification
- A bug report claimed messages exceeding length limits cause 500 errors
- Testing confirmed this is incorrect - the API properly validates message length with 400 errors
- The actual server-side processing errors are unrelated to message length validation

## API Design and Parameters

### Carrier Selection Approach
- The API uses explicit carrier selection rather than feature flags:
  - For RCS messaging: Use `carrier: "INFOBIP_RCS"`
  - For standard SMS: Use `carrier: "INFOBIP_SMS"` or `"TWILIO"`
  - For T-Mobile customers: Use `carrier: "BNE"`

### Parameter Validation
- The API strictly rejects unexpected parameters:
  - `tryRCS` - "Invalid field in request: 'tryRCS' is not allowed"
  - `globalSMSChannel` - "Invalid field in request: 'globalSMSChannel' is not allowed"
  - `testMode` - "Invalid field in request: 'testMode' is not allowed"
  - `mode` (for Email) - "Invalid field in request: 'mode' is not allowed"

### Design Misalignment
- Some tests assume a `tryRCS` flag controls RCS delivery
- Per developer feedback, the system expects explicit carrier selection instead
- Tests need to be updated to match the actual implementation

## Known Issues

### Server-Side Processing
- All messaging requests fail with 500 errors in the current environment
- This affects all carriers, not just BNE
- The failures occur after validation but during message processing

### BNE-Specific Issues
- Two specific batches failed during initial BNE call creation
- Current logs don't capture the exact reason for these failures
- There may be data-specific issues causing failures in creating BNE requests
- The staging environment might not be properly connected to the BNE service

### Environment Configuration
- The staging environment connectivity to BNE needs to be verified
- Server-side issues may be environment-specific

## Testing Requirements

### Phone Number Requirements
- BNE testing requires valid T-Mobile network numbers
- The confirmed T-Mobile test number is: +12144352325
- Non-T-Mobile numbers will not work properly with BNE

### BNE Format Testing
- Tests should verify the correct conversion from standard SMS format to BNE format
- Each BNE request should have a unique correlation ID
- Proper timezone, language, and address formatting should be verified

### Testing Limitations
- Server-side issues currently prevent end-to-end testing
- Message validation can be verified, but carrier processing cannot
- Environment connectivity issues need to be resolved for complete testing

## Implementation Details

### Correlation ID Implementation
- The system generates a unique correlation ID for each BNE request
- This is done using a `generateTestId()` function
- The ID is included in the `bulkBneRequest.bneBulkRequest.correlationId` field

### Message Conversion
- T-Mobile customer messages are automatically converted to BNE format
- This happens in the `submitRequest` function
- The conversion includes:
  1. Creating a unique correlation ID
  2. Mapping messages to the BNE format with proper formatting
  3. Setting a delivery expiry time 24 hours in the future
  4. Structuring the request according to BNE requirements

### Retry Mechanism
- The system has retry logic for BNE HTTP 504 errors
- These retries are working successfully in most cases
- Logging for these retries needs improvement

---

*This document consolidates information as of April 25, 2025. Implementation details and system behavior may change as updates are made to address the identified issues.* 