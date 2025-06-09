@regression @sms @api @p1
Feature: Global SMS Channel Configuration
  As a system administrator
  I want to control SMS channel settings globally
  So that I can manage message routing effectively

  Background:
    Given the SMS communication module is configured
    And I have administrator access

  @TC-929-01 @critical @smoke
  Scenario: Enable global SMS channel
    When I enable the global SMS channel
    Then all messages should be routed through SMS
    And the configuration change should be logged

  @TC-929-02 @p1
  Scenario: Disable global SMS channel
    When I disable the global SMS channel
    Then messages should use their default routing
    And the configuration change should be logged

  @TC-929-03 @p2
  Scenario: Override customer-specific settings
    Given a customer has specific channel settings
    When I enable the global SMS channel
    Then the global setting should override customer settings
    And affected customers should be notified

  @TC-929-04 @p1
  Scenario: Validate channel configuration
    When I update the SMS channel configuration
    Then the system should validate the settings
    And invalid configurations should be rejected

  @TC-929-05 @p2
  Scenario: Channel configuration audit trail
    When I make multiple channel configuration changes
    Then each change should be recorded in the audit log
    And the audit trail should include user information 