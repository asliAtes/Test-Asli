Feature: RCS and SMS Routing Based on Carrier
  The system supports only carrier-based routing. Parameters like tryRCS and globalSMSChannel are not supported and will be rejected.

  Background:
    Given the RCS/SMS communication module is deployed and accessible

  Scenario: Send RCS message to RCS-capable device
    Given I prepare RCS failover test data with carrier "INFOBIP_RCS" for an RCS-capable device
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate delivery through "RCS"

  Scenario: Send RCS message to non-RCS-capable device (should failover to SMS)
    Given I prepare RCS failover test data with carrier "INFOBIP_RCS" for a non-RCS-capable device
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate failover to "SMS"

  Scenario: Send SMS message using INFOBIP_SMS carrier
    Given I prepare RCS failover test data with carrier "INFOBIP_SMS" for any device
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate delivery through "SMS"

  Scenario: T-Mobile customer message is routed via BNE
    Given I prepare RCS failover test data for a T-Mobile customer
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate delivery through "BNE"

  Scenario: Message with unknown parameter is rejected
    Given I prepare RCS failover test data with an unknown parameter "fooBar"
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate "Invalid field in request: 'fooBar' is not allowed."

  # Validation scenarios
  Scenario: RCS message to non-RCS device should failover to SMS
    Given I prepare RCS failover test data for scenario "TC02" (non-RCS device)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate failover to "SMS"

  Scenario: RCS message with long content
    Given I prepare RCS failover test data for scenario "TC03" (long content)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate delivery through "RCS"

  Scenario: RCS message with special characters
    Given I prepare RCS failover test data for scenario "TC04" (special characters)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate delivery through "RCS"

  Scenario: RCS scheduled message
    Given I prepare RCS failover test data for scenario "TC05" (scheduled)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate delivery through "RCS"

  Scenario: Multiple RCS recipients with mixed device capabilities
    Given I prepare RCS failover test data for scenario "TC06" (mixed capabilities)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate mixed delivery: some "RCS", some failover to "SMS"

  Scenario: Empty message content for RCS
    Given I prepare RCS failover test data for scenario "TC07" (empty content)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate "empty message body"

  Scenario: Invalid phone number format for RCS
    Given I prepare RCS failover test data for scenario "TC08" (invalid phone number)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate "400 Bad Request"

  Scenario: Missing required field in RCS request
    Given I prepare RCS failover test data for scenario "TC09" (missing field)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate "400 Bad Request"

  Scenario: RCS message with HTML content
    Given I prepare RCS failover test data for scenario "TC10" (HTML content)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate delivery through "RCS"

  # Additional edge cases and failure tests
  Scenario: Network timeout handling for RCS
    Given I prepare RCS failover test data for scenario "TC11" (network timeout)
    When I submit the RCS failover message with a short timeout
    Then the RCS failover response should indicate appropriate error handling

  Scenario: Large batch of RCS messages
    Given I prepare RCS failover test data for scenario "TC12" (large batch)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate all recipients processed correctly

  Scenario: Malformed RCS payload
    Given I prepare RCS failover test data for scenario "TC13" (malformed payload)
    When I submit the malformed RCS failover message to the communication module
    Then the RCS failover response should indicate "400 Bad Request"

  Scenario: Extreme character limit for RCS
    Given I prepare RCS failover test data for scenario "TC14" (extreme character limit)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate appropriate handling

  Scenario: RCS with rapid sequential messages
    Given I prepare RCS failover test data for scenario "TC15" (rapid sequential)
    When I submit multiple RCS failover messages in rapid succession
    Then the RCS failover response should indicate all messages processed correctly

  # Phone number validation test cases
  Scenario: RCS with phone number missing country code
    Given I prepare RCS failover test data for scenario "TC16" (missing country code)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate "Invalid E.164 phone number format"

  Scenario: RCS with invalid numeric phone number
    Given I prepare RCS failover test data for scenario "TC17" (invalid numeric)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate "Invalid E.164 phone number format"

  Scenario: RCS with phone number containing invalid characters
    Given I prepare RCS failover test data for scenario "TC18" (invalid characters)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate "Invalid E.164 phone number format"

  # Additional verification test with specific phone number
  Scenario: RCS failover verification with specific test number
    Given I prepare RCS failover test data for scenario "TC22" (specific test number)
    When I submit the RCS failover message to the communication module
    Then the RCS failover response should indicate failover to "SMS" 