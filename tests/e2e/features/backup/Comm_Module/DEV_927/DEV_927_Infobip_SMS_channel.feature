@DEV-927 @Comm_Module @Infobip @SMS
Feature: Infobip SMS channel implementation

  @TC01 @Smoke @Positive
  Scenario: Sending basic SMS messages through Infobip channel
    Given I have message details for TC01 - basic SMS through Infobip
    When I submit the SMS request
    Then I should receive a successful response for Infobip SMS

  @TC02 @Positive
  Scenario: Sending SMS with customer-specific sender code through Infobip
    Given I have message details for TC02 - customer-specific sender code
    When I submit the SMS request
    Then I should receive a successful response for Infobip SMS
    And the sender code should match the customer configuration

  @TC03 @Positive
  Scenario: Sending SMS with different customer-specific sender code
    Given I have message details for TC03 - different customer sender code
    When I submit the SMS request
    Then I should receive a successful response for Infobip SMS
    And the sender code should match the customer configuration

  @TC04 @Positive
  Scenario: Verifying detailed logging for Infobip SMS
    Given I have message details for TC04 - detailed logging verification
    When I submit the SMS request
    Then I should receive a successful response for Infobip SMS
    And the logs should contain detailed request and response information

  @TC05 @Positive
  Scenario: Sending scheduled SMS message through Infobip
    Given I have message details for TC05 - scheduled SMS message
    When I submit the SMS request
    Then I should receive a successful response for Infobip SMS
    And the scheduled time should be properly set

  @TC06 @Negative
  Scenario: Handling empty message content for Infobip SMS
    Given I have message details for TC06 - empty message content
    When I submit the SMS request
    Then I should receive an error response for empty message

  @TC07 @Negative
  Scenario: Handling invalid phone number format for Infobip SMS
    Given I have message details for TC07 - invalid phone number
    When I submit the SMS request
    Then I should receive an error response for invalid phone number

  @TC08 @Throttling @Positive
  Scenario: Handling rapid message sending through Infobip
    Given I have message details for TC08 - rapid message sending
    When I submit multiple SMS requests in quick succession
    Then all messages should be processed correctly with throttling

  @TC09 @Retry @Positive
  Scenario: Testing retry logic for temporary Infobip failures
    Given I have message details for TC09 - temporary failure scenario
    When I submit the SMS request with simulated temporary failure
    Then the system should retry and eventually succeed

  @TC10 @Negative
  Scenario: Handling service unavailable error for Infobip
    Given I have message details for TC10 - service unavailable
    When I submit the SMS request with simulated service unavailable
    Then the system should handle the error appropriately 

  @TC11 @Templates @Positive
  Scenario: Sending template-based SMS messages through Infobip
    Given I have message details for TC11 - template-based SMS
    When I submit the SMS request with template parameters
    Then I should receive a successful response for Infobip SMS
    And the template should be properly populated 