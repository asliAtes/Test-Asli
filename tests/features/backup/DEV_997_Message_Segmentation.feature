@DEV-997 @bug-verification @segmentation
Feature: Message Segmentation Information in API Response
  As a communication service user
  I want to receive segmentation information in the API response
  So that I can track message segments for billing and delivery purposes

  Background:
    Given the communication module is accessible

  @long-message @segmentation
  Scenario: TC01 - Long message should include segmentation information
    Given I prepare a standard SMS message request for DEV-997
    And I set message content to be 800 characters
    When I submit the SMS request to verify segmentation
    Then the SMS response should have status code 200
    And the response should include segment count information
    And the segment count should match the expected formula

  @very-long-message @segmentation
  Scenario: TC02 - Very long message should include segmentation information
    Given I prepare a standard SMS message request for DEV-997
    And I set message content to be 1600 characters
    When I submit the SMS request to verify segmentation
    Then the SMS response should have status code 200
    And the response should include segment count information
    And the segment count should match the expected formula

  @multiple-messages @segmentation
  Scenario: TC03 - Batch with long messages should include segmentation information for each message
    Given I prepare a batch of messages with varying lengths
    When I submit the SMS request to verify segmentation
    Then the SMS response should have status code 200
    And the response should include segment count information for each message
    And each segment count should match the expected formula

  @validation @formula-verification
  Scenario: TC04 - Verify segmentation formula is correctly applied
    Given I prepare a standard SMS message request for DEV-997
    And I set message content to be exactly 153 characters
    When I submit the SMS request to verify segmentation
    Then the SMS response should have status code 200
    And the response should report 1 segment
    
  @validation @formula-verification
  Scenario: TC05 - Verify segmentation formula for message just over segment boundary
    Given I prepare a standard SMS message request for DEV-997
    And I set message content to be exactly 154 characters
    When I submit the SMS request to verify segmentation
    Then the SMS response should have status code 200
    And the response should report 2 segments 