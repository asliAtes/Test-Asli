@rcs @failover
Feature: RCS to SMS Failover
  As a system administrator
  I want RCS messages to failover to SMS when necessary
  So that message delivery is guaranteed

  Background:
    Given the treatment and communication modules are deployed
    And RCS failover is enabled

  @TC1 @smoke @api
  Scenario: Automatic failover when RCS is unavailable
    Given I have a message to send via RCS
    When the RCS service is unavailable
    Then the message should be sent via SMS
    And the failover should be logged

  @TC2 @api
  Scenario: Failover after RCS delivery timeout
    Given I have a message to send via RCS
    When the RCS delivery times out
    Then the message should be retried via SMS
    And the original RCS attempt should be marked as failed

  @TC3 @metrics
  Scenario: Track failover metrics
    Given multiple messages have failed over to SMS
    When I check the failover metrics
    Then I should see the count of failover occurrences
    And the metrics should show success rate of failover attempts

  @TC4 @configuration
  Scenario: Configure failover settings
    When I update the following failover settings:
      | Setting           | Value |
      | Timeout          | 30    |
      | Retry Attempts   | 2     |
      | Failover Delay   | 5     |
    Then the new settings should be applied
    And failover should occur according to these settings

  @TC5 @error
  Scenario: Handle failover errors
    Given I have messages in failover state
    When both RCS and SMS delivery fail
    Then the errors should be properly logged
    And appropriate error notifications should be sent 