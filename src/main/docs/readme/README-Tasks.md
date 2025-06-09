# DEV-925 Task Tracking

## Overview

This document tracks the progress of DEV-925 and its subtasks (DEV-926, DEV-927, etc.). It captures the testing status, bugs, and completion criteria for each task.

## Task Status Summary

| Task ID | Description | Status | Test Files | Bugs | Next Steps |
|---------|------------|--------|------------|------|------------|
| DEV-925 | Parent Task - API Feature Testing | **IN PROGRESS** | [Bug_Verification.feature](features/Comm_Module/DEV_925_Bug_Verification.feature) | [See Bug Report](README-BugStatus.md) | Fix critical bugs |
| DEV-926 | Comm module as a separate service | **READY FOR RELEASE** | [Email_module.feature](features/Email_Module/DEV_926_Email_module.feature), [Comm_module_as_a_separate_service.feature](features/Comm_Module/DEV_926_Comm_module_as_a_separate_service.feature) | None | Final sign-off |
| DEV-927 | Infobip SMS as a new service | **READY FOR RELEASE** | Tested in DEV-926 | None | Final sign-off |
| DEV-928 | Infobip SMS Channel - Test mode | **READY FOR RELEASE** | Tested in DEV-926 | None | Final sign-off |
| DEV-929 | Flag controls which SMS Channel is used | **READY FOR RELEASE** | [Global_SMS_Channel_Flag.feature](features/Comm_Module/DEV_929_Global_SMS_Channel_Flag.feature) | API rejects globalSMSChannel parameter | Update API to support flag |
| DEV-930 | Infobip RCS Channel - Text only | **READY FOR RELEASE** | No test files found | None | Verify if needed |
| DEV-931 | RCS Failover message | **IN QA** | [RCS_Failover_message.feature](features/Comm_Module/DEV_931_RCS_Failover_message.feature) | None | Complete testing |
| DEV-932 | Flag controls SMS vs RCS | **READY FOR RELEASE** | [Customer_level_RCS_flag.feature](features/Comm_Module/DEV_932/DEV_932_Customer_level_RCS_flag.feature) | API rejects tryRCS parameter (EXPECTED BEHAVIOR) | Update documentation to reflect new design |
| DEV-933 | RCS Analytics Script | **CANCELLED** | N/A | N/A | No action needed |
| DEV-940 | Respect SMS and RCS Opt-out messages | **IN CODE REVIEW** | Not yet implemented | None | Implement tests |
| DEV-987 | BNE SMS carrier integration fails | **IN QA** | [Bug_Verification.feature](features/Comm_Module/DEV_925_Bug_Verification.feature) | **NOT FIXED** | Critical fix needed |
| DEV-988 | Malformed JSON exposes internal stack trace | **IN QA** | [Bug_Verification.feature](features/Comm_Module/DEV_925_Bug_Verification.feature) | **PARTIALLY FIXED** | Complete fix needed |
| DEV-989 | Large Message Content Handling | **IN QA** | [Bug_Verification.feature](features/Comm_Module/DEV_925_Bug_Verification.feature) | **PARTIALLY FIXED** | Review character limit change |
| DEV-997 | Missing segmentation information | **IN QA** | [Message_Segmentation.feature](features/Comm_Module/DEV_997_Message_Segmentation.feature) | **NOT FIXED** | Add segmentation information to API responses |

## Completion Criteria

A subtask is marked **COMPLETE** when:

1. All test cases are created and automated
2. All bugs are fixed and verified
3. Final sign-off received from QA lead

Once marked complete, no further changes will be made to the test code for that subtask.

## Bug Status

For detailed bug status information, see [Bug Status Report](README-BugStatus.md).

## Next Steps

1. **Critical**: Fix BNE SMS carrier integration (DEV-987) - affects T-Mobile customers
2. **Medium**: Add segmentation information to API responses (DEV-997) - affects message tracking and billing
3. **Medium**: Implement API support for globalSMSChannel parameter (DEV-929)
4. **Low**: Update documentation to reflect new design for tryRCS parameter (DEV-932)
5. Complete testing for DEV-931
6. Implement tests for DEV-940
7. Final sign-off for DEV-926, DEV-927, and DEV-928

## Test Environment

- Base URL: http://3.133.216.212/app4/kredos/comm
- Test Phone Numbers: Various (see test configuration)
- API Version: 2.5.0 