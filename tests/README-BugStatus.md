# Bug Status Report

## Summary of Bug Verification Tests

Last tested: **August 2, 2023**

| Bug ID | Description | Status | Detail |
|--------|------------|--------|--------|
| DEV-987 | BNE SMS carrier integration fails | **NOT FIXED** | Still returns 500 Internal Server Error |
| DEV-988 | Malformed JSON exposes internal stack trace | **PARTIALLY FIXED** | Now returns 400 instead of 500, but still leaks implementation details (`com.vassarlabs` package name) |
| DEV-989 | Large Message Content Handling | **PARTIALLY FIXED** | Now returns 400 instead of 500, but validation limit changed from 1600 to 800 characters |
| DEV-990 | Scheduling parameter requirements unclear | **NOT FIXED** | Error message does not clearly indicate scheduleAt parameter is required |
| DEV-996 | tryRCS parameter handling | **EXPECTED BEHAVIOR** | API now rejects tryRCS parameter entirely (`'tryRCS' is not allowed`) which is the correct behavior according to updated requirements |
| DEV-997 | Missing segmentation information in API response | **NOT FIXED** | API response does not include message segmentation information for long messages |

## Detailed Findings

### DEV-987: BNE SMS carrier integration

**Status: NOT FIXED**

The integration with BNE SMS carrier still fails with 500 Internal Server Error. This issue affects T-Mobile customers who may not receive messages due to this integration failure.

**Test result:**
```
⚠️ KNOWN ISSUE: BNE integration is still failing with 500 error
AssertionError [ERR_ASSERTION]: BNE integration bug is not fixed
```

### DEV-988: Malformed JSON error handling

**Status: PARTIALLY FIXED**

The API now correctly returns a 400 Bad Request status code for malformed JSON instead of 500 Internal Server Error. However, it still exposes implementation details in the error message:

```
Invalid JSON format: org.springframework.http.converter.HttpMessageNotReadableException: JSON parse error: Cannot construct instance of `com.vassarlabs.communication.pojo.SmsRequestPayload`...
```

The response contains Java package names and implementation-specific details, which is a security best practice violation.

### DEV-989: Large Message Content

**Status: PARTIALLY FIXED**

The API now returns a 400 Bad Request status code for messages that exceed the size limit, which is an improvement. However, the validation limit seems to have changed from 1600 to 800 characters, which may cause regressions in applications expecting the previous limit.

### DEV-990: Scheduling Parameter Requirements

**Status: NOT FIXED**

When scheduling is enabled but the required `scheduleAt` parameter is missing, the error message does not clearly indicate that this specific parameter is required.

### DEV-996: tryRCS Parameter Handling

**Status: EXPECTED BEHAVIOR**

The API now returns a 400 Bad Request with the message that the `tryRCS` parameter is not allowed in the request body. This is the expected behavior according to updated requirements. The API should reject the parameter entirely rather than validating its values.

### DEV-997: Missing Segmentation Information

**Status: NOT FIXED**

The API response does not include message segmentation information for SMS messages, making it difficult to track actual message delivery costs.

**Test findings:**
1. For messages of 800 characters, a `segmentCount` field with value 0 is returned, not matching the expected segment count of 6
2. For messages exceeding 800 characters, the API returns a 400 Bad Request with a message length validation error
3. For batch messages, no segmentation information is provided for each message
4. Segmentation information is missing even for messages at segment boundaries (153, 154 characters)

A possible implementation from the developer comments would be to:
- Calculate segments using the formula: `segmentCount = floor(message_length / 153) + 1`
- Return the segment count in the API response as `messageCount` or `segmentCount` field
- For batch messages, include segment information for each message in the batch response

## Overall Status

- **Completely fixed**: 0/5
- **Partially fixed**: 2/5
- **No improvement**: 3/5
- **Expected behavior**: 1/5

The most critical issue (BNE integration) remains unresolved, affecting T-Mobile customers. There have been improvements in handling malformed JSON and large messages, but implementation details are still exposed and the validation limits have changed. Additional issues with segmentation information need to be addressed. 