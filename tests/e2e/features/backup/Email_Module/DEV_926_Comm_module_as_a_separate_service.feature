Feature: Communication Module Message Routing
# KNOWN ISSUES/BUGS DISCOVERED:
#
# 2. Malformed JSON Returns 500 Instead of 400
#    - API returns 500 error with stack trace details when receiving invalid JSON
#    - Response exposes internal implementation details (com.vassarlabs.communication.pojo.SmsRequestPayload)
#    - Should return a cleaner 400 Bad Request error
#
# 3. Large Message Content (>1600 chars) Causes 500 Error
#    - Messages exceeding SMS length limits (1600+ chars) cause 500 errors
#    - Should return a 400 Bad Request with clear validation message about message length limits
#
# 4. Scheduling Requires Specific Parameter Names
#    - The API requires 'scheduleAt' and 'zoneId' parameters for scheduled messages
#    - Error messages are clear but API documentation should be updated to reflect these requirements
#
# NOTE: BNE integration is now FIXED. The deliveryExpiryTime for BNE must always use the current date with time 23:59 (e.g., 2025-04-28T23:59).
# The test and code have been updated to ensure this format is always used for BNE requests.

  Scenario: TC01 - Send SMS using Twilio
    Given test data for "TC01"
    When the message is submitted to the communication module
    Then it should be routed to "Twilio"

  Scenario: TC02 - Send SMS using Infobip
    Given test data for "TC02"
    When the message is submitted to the communication module
    Then it should be routed to "Infobip"

  Scenario: TC03 - Send SMS using BNE
    # BNE integration is now fixed. The deliveryExpiryTime is always set to the current date with time 23:59 (e.g., 2025-04-28T23:59).
    Given test data for "TC03"
    When the message is submitted to the communication module
    Then it should be routed to "BNE"

  Scenario: TC04 - Empty message body
    Given test data for "TC04"
    When the message is submitted to the communication module
    Then the response should indicate "empty message body"

  Scenario: TC05 - Unsupported carrier type
    Given test data for "TC05"
    When the message is submitted to the communication module
    Then the response should indicate "unsupported carrier type"

  Scenario: TC06 - Missing carrier field
    Given test data for "TC06"
    When the message is submitted to the communication module
    Then the response should indicate "400 Bad Request"

  Scenario: TC07 - Missing phone number
    Given test data for "TC07"
    When the message is submitted to the communication module
    Then the response should indicate "400 Bad Request"

  Scenario: TC08 - Invalid phone number format
    Given test data for "TC08"
    When the message is submitted to the communication module
    Then the response should indicate "400 Bad Request"

  # NOTE: Malformed JSON handling still returns 500 instead of 400
  Scenario: TC09 - Malformed JSON
    Given test data for "TC09"
    When the malformed payload is submitted to the communication module
    Then the response should indicate "400 Bad Request"

  Scenario: TC10 - Specific carrier override
    Given test data for "TC10"
    When the message is submitted to the communication module
    Then it should be routed to "Infobip"

  # NOTE: Extended test cases for edge cases
  Scenario: TC11 - Large message content
    Given test data for "TC11"
    When the message is submitted to the communication module
    Then it should be routed to "Twilio"

  Scenario: TC12 - Special characters in message
    Given test data for "TC12"
    When the message is submitted to the communication module
    Then it should be routed to "Twilio"

  Scenario: TC13 - Multiple recipients
    Given test data for "TC13"
    When the message is submitted to the communication module
    Then it should be routed to "Twilio"

  Scenario: TC14 - Mixed valid and invalid requests
    Given test data for "TC14"
    When the message is submitted to the communication module
    Then the response should indicate "invalid requests"

  Scenario: TC15 - Scheduled message
    Given test data for "TC15"
    When the message is submitted to the communication module
    Then it should be routed to "Twilio"

  Scenario: TC16 - Security testing with injection attempt
    Given test data for "TC16"
    When the message is submitted to the communication module
    Then it should be routed to "Twilio"

  Scenario: TC17 - HTML content in message
    Given test data for "TC17"
    When the message is submitted to the communication module
    Then it should be routed to "Twilio"

  Scenario: TC18 - URL content in message
    Given test data for "TC18"
    When the message is submitted to the communication module
    Then it should be routed to "Twilio"

  # Phone number validation test cases
  Scenario: TC19 - Phone number without E.164 format (+)
    Given test data for "TC19"
    When the message is submitted to the communication module
    Then the response should indicate "Invalid E.164 phone number format"

  Scenario: TC20 - Phone number with unexpected characters
    Given test data for "TC20"
    When the message is submitted to the communication module
    Then the response should indicate "Invalid E.164 phone number format"
  
  Scenario: TC21 - Phone number too short
    Given test data for "TC21"
    When the message is submitted to the communication module
    Then the response should indicate "Invalid E.164 phone number format"
