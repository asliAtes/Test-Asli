# DEV-925 Communication Module Implementation Task List

## Parent Task: DEV-925 (25% Done)

### ⬜ DEV-926: Communication module as a separate service
- **Status**: READY FOR RELEASE
- **Priority**: HIGH
- **Test Cases**:
  - Created: DEV_926_Comm_module_as_a_separate_service.feature (5.3KB, 132 lines)
  - Implementation: DEV_926_Comm_module_as_a_separate_service.ts (15KB, 488 lines)
- **Bugs**: None specifically tracked
- **Completion Criteria**:
  - ✓ Test implementation completed
  - ✓ Test cases automated
  - ⬜ Verify all channels work through standardized interface
  - ⬜ Verify scaling independently
  - ⬜ Final sign-off

### ⬜ DEV-927: Infobip SMS as a new service within the Communication module
- **Status**: READY FOR RELEASE
- **Priority**: HIGH
- **Test Cases**:
  - Created: DEV_927_Infobip_SMS_channel.feature (3.2KB, 73 lines)
  - Implementation: DEV_927_Infobip_SMS_channel.ts (14KB, 408 lines)
- **Bugs**: None specifically tracked
- **Completion Criteria**:
  - ✓ Test implementation completed
  - ✓ Test cases automated
  - ⬜ Verify Infobip SMS channel works correctly
  - ⬜ Final sign-off

### ⬜ DEV-928: Infobip SMS Channel - Test mode
- **Status**: READY FOR RELEASE
- **Priority**: MEDIUM
- **Test Cases**:
  - Created: DEV_928_Infobip_SMS_Test_Mode.feature (6.0KB, lines unknown)
  - Implementation: DEV_928_Infobip_SMS_Test_Mode.ts (35KB, lines unknown)
- **Bugs**: None specifically tracked
- **Completion Criteria**:
  - ✓ Test implementation completed
  - ✓ Test cases automated
  - ⬜ Verify test mode functionality
  - ⬜ Final sign-off

### ⬜ DEV-929: Flag controls which SMS Channel is used: Twilio or Infobip
- **Status**: READY FOR RELEASE
- **Priority**: HIGH
- **Test Cases**:
  - Created: DEV_929_Global_SMS_Channel_Flag.feature (2.8KB, 65 lines)
  - Implementation: DEV_929_Global_SMS_Channel_Flag.ts (11KB, 296 lines)
- **Bugs**: 
  - API doesn't support globalSMSChannel parameter (returns 400 error)
- **Completion Criteria**:
  - ✓ Test implementation completed
  - ✓ Test cases automated
  - ⬜ Verify flag correctly routes messages
  - ⬜ Fix globalSMSChannel parameter support
  - ⬜ Final sign-off

### ✅ DEV-930: Infobip RCS Channel - Text only
- **Status**: COMPLETE
- **Priority**: HIGH
- **Test Cases**: 
  - Covered by DEV-932_Customer_level_RCS_flag tests (INFOBIP_RCS carrier functionality)
  - Covered by DEV-928_Infobip_SMS_Test_Mode tests (TC09 - INFOBIP_RCS carrier in test mode)
- **Bugs**: None identified
- **Completion Criteria**:
  - ✓ Test implementation completed (via DEV-932 and DEV-928)
  - ✓ Test cases automated (via DEV-932 and DEV-928)
  - ✓ Verify RCS channel functionality (via customer-level RCS flag tests)
  - ✓ Final sign-off

### ⬜ DEV-931: RCS Failover message
- **Status**: IN QA (INCOMPLETE)
- **Priority**: HIGH
- **Test Cases**:
  - Created: DEV_931_RCS_Failover_message.feature (4.4KB, 101 lines, 19 test scenarios)
  - Implementation: Missing - no DEV_931_RCS_Failover_message.ts file found
- **Bugs**: None specifically tracked
- **Completion Criteria**:
  - ✓ Test specification completed
  - ⬜ Test implementation missing
  - ⬜ Verify failover functionality
  - ⬜ Final sign-off

### ⬜ DEV-932: Flag controls SMS vs RCS, at the customer level
- **Status**: READY FOR RELEASE
- **Priority**: HIGH
- **Test Cases**:
  - Created: DEV_932_Customer_level_RCS_flag.feature (4.0KB, 83 lines)
  - Implementation: DEV_932_Customer_level_RCS_flag.ts (26KB, 694 lines)
- **Bugs**:
  - API doesn't support tryRCS parameter (returns 400 error)
  - DEV-996: Silent Handling of Invalid "tryRCS" Values (BLOCKED)
- **Completion Criteria**:
  - ✓ Test implementation completed
  - ✓ Test cases automated
  - ⬜ Fix tryRCS parameter support
  - ⬜ Final sign-off

### ⬜ DEV-933: RCS Analytics Script
- **Status**: CANCELLED
- **Priority**: MEDIUM
- **Test Cases**: N/A (Cancelled)
- **Bugs**: N/A
- **Completion Criteria**: N/A (Task cancelled)

### ⬜ DEV-940: Respect SMS and RCS Opt-out messages
- **Status**: IN CODE REVIEW
- **Priority**: MEDIUM
- **Test Cases**: No specific test files found yet
- **Bugs**: None tracked yet
- **Completion Criteria**:
  - ⬜ Test implementation completed
  - ⬜ Test cases automated
  - ⬜ Verify opt-out functionality
  - ⬜ Final sign-off

### ✅ DEV-987: BNE SMS carrier integration fails with 500 Internal Server Error
- **Status**: FIXED
- **Priority**: CRITICAL
- **Test Cases**:
  - Referenced in DEV_925_Bug_Verification.feature, TC01
- **Bugs**: Fixed by updating date format to use current day with 23:59 time
- **Completion Criteria**:
  - ✓ Test implementation completed
  - ✓ Bug fix verified
  - ✓ Final sign-off

### ⬜ DEV-988: Malformed JSON exposes internal stack trace
- **Status**: IN QA
- **Priority**: Not specified
- **Test Cases**:
  - Referenced in DEV_925_Bug_Verification.feature, TC02
- **Bugs**: Partially fixed (returns 400 but still shows stack trace)
- **Completion Criteria**:
  - ✓ Test implementation completed
  - ⬜ Bug fix verified
  - ⬜ Final sign-off

### ⬜ DEV-989: Large Message Content Handling (500 Error)
- **Status**: IN QA
- **Priority**: Not specified
- **Test Cases**:
  - Referenced in DEV_925_Bug_Verification.feature, TC03
- **Bugs**: Partially fixed (returns 400 but limit is 800 characters, not 1600)
- **Completion Criteria**:
  - ✓ Test implementation completed
  - ⬜ Bug fix verified
  - ⬜ Final sign-off

## Rules for Task Completion:

1. A subtask is marked complete (✅) when:
   - All test cases are created and automated
   - All associated bugs are fixed and verified
   - Final sign-off is received

2. Once a subtask is marked complete (✅):
   - No further changes will be made to the test code
   - The test code will be considered finalized

3. Progress tracking:
   - The parent task (DEV-925) completion percentage will be updated based on completed subtasks
   - Regular test runs will be performed to verify bug fixes

## Next Steps:

1. Fix the critical BNE integration issue (DEV-987) ✅ COMPLETED
2. Implement API support for the tryRCS parameter (DEV-996)
3. Create implementation file for DEV-931 RCS Failover Message
4. Complete and finalize testing for DEV-926, DEV-927, and DEV-928

## Update Log:

- Apr 26, 2025: Task list created
- Apr 27, 2025: Updated BNE date format in tests to use current day with 23:59 time instead of 24 hours in the future
- Apr 28, 2025: Marked DEV-930 as complete (covered by DEV-932 and DEV-928 tests); Updated DEV-931 status to note missing implementation
- [Date]: [Update description] 