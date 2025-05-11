@test-mode
Feature: Infobip SMS Channel Test Mode
  As a communication service provider
  I want to use a test mode for Infobip SMS
  So that I can verify the system without sending messages to real customers

  Background:
    # Use environment variables for test configuration
    # TEST_PHONE_NUMBER should be set to a valid test phone number

  @basic @smoke
  Scenario: TC01 - Enable Test Mode via API Parameter
    Given Infobip test data for basic test mode with "TC01"
    When the test mode message is submitted to the communication module
    Then the test mode is active in the response
    And the test mode configuration should be logged

  @configuration @limit
  Scenario: TC02 - Test Mode Message Limiting (Default 5)
    Given Infobip test data for "TC02" with 10 messages and test mode enabled
    When the batch is submitted to the communication module
    Then only 5 messages should be sent to test phones
    And 5 messages should be logged but not sent

  @configuration @limit
  Scenario: TC03 - Custom Message Limit Setting
    Given Infobip test data for "TC03" with 10 messages and test mode limit of 3
    When the batch is submitted to the communication module
    Then only 3 messages should be sent to test phones
    And 7 messages should be logged but not sent

  @configuration @limit
  Scenario: TC04 - Small Batch Handling (Fewer Than Limit)
    Given Infobip test data for "TC04" with 3 messages and test mode enabled
    When the batch is submitted to the communication module
    Then all 3 messages should be sent to test phones
    And 0 messages should be logged but not sent

  @configuration @phones
  Scenario: TC05 - Default Test Phone Usage
    Given Infobip test data for "TC05" with test mode enabled but no test phones specified
    When the test mode message is submitted to the communication module
    Then the message should be sent to the default test phone number
    And original recipient information should be preserved in logs

  @configuration @phones
  Scenario: TC06 - Custom Test Phone Configuration
    Given Infobip test data for "TC06" with test mode and custom test phones
    When the test mode message is submitted to the communication module
    Then the message should be sent to the specified test phones only
    And original recipient information should be preserved in logs

  @validation @phones
  Scenario: TC07 - Test Phone Number Validation
    Given Infobip test data for "TC07" with test mode and invalid test phones
    When the test mode message is submitted to the communication module
    Then the response should indicate invalid test phone format
    And no messages should be sent

  @carriers
  Scenario: TC08 - Infobip SMS Carrier in Test Mode
    Given Infobip test data for "TC08" with carrier "INFOBIP_SMS" and test mode enabled
    When the test mode message is submitted to the communication module
    Then the message should be sent via INFOBIP_SMS to test phones only
    And carrier-specific parameters should be preserved

  @carriers
  Scenario: TC09 - Infobip RCS Carrier in Test Mode
    Given Infobip test data for "TC09" with carrier "INFOBIP_RCS" and test mode enabled
    When the test mode message is submitted to the communication module
    Then the message should be sent via INFOBIP_RCS to test phones only
    And carrier-specific parameters should be preserved

  @scheduling
  Scenario: TC10 - Scheduled Message in Test Mode
    Given Infobip test data for "TC10" with scheduled delivery and test mode enabled
    When the test mode message is submitted to the communication module
    Then the message should be scheduled for delivery to test phones only
    And scheduled time parameters should be preserved

  @response
  Scenario: TC11 - Test Mode Response Format
    Given Infobip test data for basic test mode with "TC11"
    When the test mode message is submitted to the communication module
    Then the response should include test mode statistics
    And message details should be included in the response

  @error-handling
  Scenario: TC12 - Failed Message Handling in Test Mode
    Given Infobip test data for "TC12" with test mode and invalid message content
    When the test mode message is submitted to the communication module
    Then the error should be handled appropriately in test mode
    And no fallback to production mode should occur

  @validation @error-handling
  Scenario: TC13 - Test Mode with Empty Batch
    Given Infobip test data for "TC13" with empty message batch and test mode enabled
    When the batch is submitted to the communication module
    Then the response should indicate empty batch in test mode
    And no messages should be sent

  @validation @error-handling
  Scenario: TC14 - Invalid Test Mode Configuration
    Given Infobip test data for "TC14" with invalid test mode parameters
    When the test mode message is submitted to the communication module
    Then the response should indicate invalid test mode configuration
    And appropriate validation errors should be returned

  @mab-integration
  Scenario: TC15 - MAB Scoring Integration with Test Mode
    Given MAB scoring output data with test mode enabled
    When the MAB data is processed through the communication module
    Then only test messages should be sent to test phones
    And the remaining messages should be logged but not sent

  @multi-channel
  Scenario: TC16 - Multi-Channel Test Mode
    Given Infobip test data for "TC16" with multiple channels and test mode enabled
    When the test mode message is submitted to the communication module
    Then test mode should be applied consistently across all channels
    And channel-specific behaviors should be preserved

  @audit @reporting
  Scenario: TC17 - Test Mode Audit Trail
    Given Infobip test data for basic test mode with "TC17"
    When the test mode message is submitted to the communication module
    Then test mode usage should be recorded in audit logs
    And test statistics should be recorded for reporting 